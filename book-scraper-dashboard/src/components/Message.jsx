export default function Message({ state }) {
  return (
    <div className={`message ${state.type || ""}`} role="status">
      {state.text}
    </div>
  );
}
