import { useCallback, useEffect, useRef, useState } from "react";
import {
  getJob,
  isFailedStatus,
  isFinalStatus,
  startScrape,
} from "../api.js";
import Message from "./Message.jsx";

const POLL_MS = 3000;

export default function ScrapeJob({ apiBase, onJobFinished }) {
  const [jobId, setJobId] = useState(localStorage.getItem("lastJobId") || null);
  const [status, setStatus] = useState(null);
  const [starting, setStarting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [msg, setMsg] = useState(
    jobId
      ? { type: "", text: 'Last job restored. Click "Refresh status" to check it.' }
      : { type: "", text: "" }
  );

  const timer = useRef(null);
  const onFinishedRef = useRef(onJobFinished);
  onFinishedRef.current = onJobFinished;

  const applyJob = useCallback((job, fallbackId) => {
    const id = job.job_id || job.id || fallbackId;
    const s = job.status || "unknown";
    if (id) {
      setJobId(id);
      localStorage.setItem("lastJobId", id);
    }
    setStatus(s);
    return { id, status: s };
  }, []);

  const check = useCallback(
    async (id, quiet) => {
      if (!id) return;
      setChecking(true);
      if (!quiet) setMsg({ type: "loading", text: "Checking job status..." });
      try {
        const job = await getJob(apiBase, id);
        const { status: s } = applyJob(job || {}, id);
        if (isFinalStatus(s)) {
          if (isFailedStatus(s)) {
            setMsg({ type: "error", text: `Job finished with status: ${s}` });
          } else {
            setMsg({ type: "success", text: "Job finished. Reloading books..." });
            onFinishedRef.current?.();
          }
        } else {
          setMsg({ type: "loading", text: `Job in progress (${s}).` });
          if (autoRefresh) {
            timer.current = setTimeout(() => check(id, true), POLL_MS);
          }
        }
      } catch (err) {
        setMsg({ type: "error", text: err.message });
      } finally {
        setChecking(false);
      }
    },
    [apiBase, applyJob, autoRefresh]
  );

  const stopPolling = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => stopPolling, []);
  useEffect(() => {
    if (!autoRefresh) stopPolling();
  }, [autoRefresh]);

  const handleStart = async () => {
    stopPolling();
    setStarting(true);
    setMsg({ type: "loading", text: "Starting scrape job..." });
    try {
      const job = await startScrape(apiBase);
      const { id, status: s } = applyJob(job || {}, null);
      setMsg({ type: "success", text: "Job created." });
      if (id && !isFinalStatus(s) && autoRefresh) {
        timer.current = setTimeout(() => check(id, true), POLL_MS);
      }
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setStarting(false);
    }
  };

  return (
    <section className="card">
      <h2>Scrape Job</h2>
      <div className="row">
        <button type="button" onClick={handleStart} disabled={starting}>
          Start scraping
        </button>
        <button
          type="button"
          onClick={() => {
            stopPolling();
            check(jobId, false);
          }}
          disabled={!jobId || checking}
        >
          Refresh status
        </button>
        <label className="inline">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh while running
        </label>
      </div>

      <dl className="job-info">
        <dt>Job ID</dt>
        <dd>{jobId || "-"}</dd>
        <dt>Status</dt>
        <dd>{status || "-"}</dd>
      </dl>

      <Message state={msg} />
    </section>
  );
}
