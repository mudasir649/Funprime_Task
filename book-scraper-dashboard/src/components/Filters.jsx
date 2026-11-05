import { useState } from "react";

const EMPTY = { category: "", minPrice: "", maxPrice: "" };

export default function Filters({ categories, pageSize, onApply, onPageSize }) {
  const [form, setForm] = useState(EMPTY);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onApply({ ...form, category: form.category.trim() });
  };

  const reset = () => {
    setForm(EMPTY);
    onApply(EMPTY);
  };

  return (
    <form className="row filters" onSubmit={submit}>
      <label>
        Category
        <input
          type="text"
          list="categoryList"
          placeholder="e.g. Travel"
          value={form.category}
          onChange={set("category")}
        />
        <datalist id="categoryList">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>
      <label>
        Min price
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0"
          value={form.minPrice}
          onChange={set("minPrice")}
        />
      </label>
      <label>
        Max price
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="100"
          value={form.maxPrice}
          onChange={set("maxPrice")}
        />
      </label>
      <label>
        Per page
        <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </label>
      <button type="submit">Apply</button>
      <button type="button" onClick={reset}>
        Reset
      </button>
    </form>
  );
}
