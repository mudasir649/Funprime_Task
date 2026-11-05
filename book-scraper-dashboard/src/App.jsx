import { useState } from "react";
import { getApiBase, saveApiBase } from "./api.js";
import ApiConfig from "./components/ApiConfig.jsx";
import Books from "./components/Books.jsx";
import ScrapeJob from "./components/ScrapeJob.jsx";

export default function App() {
  const [apiBase, setApiBase] = useState(getApiBase());
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <>
      <header>
        <h1>Book Scraper Dashboard</h1>
        <ApiConfig apiBase={apiBase} onSave={(v) => setApiBase(saveApiBase(v))} />
      </header>

      <main>
        <ScrapeJob
          apiBase={apiBase}
          onJobFinished={() => setReloadKey((k) => k + 1)}
        />
        <Books apiBase={apiBase} reloadKey={reloadKey} />
      </main>
    </>
  );
}
