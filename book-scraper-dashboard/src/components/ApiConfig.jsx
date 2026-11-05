import { useState } from "react";

export default function ApiConfig({ apiBase, onSave }) {
  const [value, setValue] = useState(apiBase);

  return (
    <div className="api-config">
      <label htmlFor="apiBase">API base URL</label>
      <input
        id="apiBase"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="button" onClick={() => onSave(value)}>
        Save
      </button>
    </div>
  );
}
