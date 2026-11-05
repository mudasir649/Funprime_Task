import { useCallback, useEffect, useState } from "react";
import { extractBooks, getBooks } from "../api.js";
import BooksTable from "./BooksTable.jsx";
import Filters from "./Filters.jsx";
import Message from "./Message.jsx";
import Pagination from "./Pagination.jsx";

const NO_FILTERS = { category: "", minPrice: "", maxPrice: "" };

export default function Books({ apiBase, reloadKey }) {
  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setMsg({ type: "loading", text: "Loading books..." });
    try {
      const body = await getBooks(apiBase, {
        category: filters.category,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        page,
        page_size: pageSize,
      });
      const data = extractBooks(body);
      setBooks(data.items);
      setTotal(data.total);
      setCategories((prev) => {
        const set = new Set(prev);
        data.items.forEach((b) => b.category && set.add(b.category));
        return Array.from(set).sort();
      });
      setMsg({ type: "success", text: `Loaded ${data.items.length} book(s).` });
    } catch (err) {
      setBooks([]);
      setTotal(null);
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }, [apiBase, filters, page, pageSize]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const totalPages = total != null ? Math.max(1, Math.ceil(total / pageSize)) : null;
  const hasNext = totalPages != null ? page < totalPages : books.length >= pageSize;

  return (
    <section className="card">
      <h2>Books</h2>

      <Filters
        categories={categories}
        pageSize={pageSize}
        onApply={(f) => {
          setFilters(f);
          setPage(1);
        }}
        onPageSize={(n) => {
          setPageSize(n);
          setPage(1);
        }}
      />

      <Message state={msg} />
      <BooksTable books={books} />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        loading={loading}
        hasNext={hasNext}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
      />
    </section>
  );
}
