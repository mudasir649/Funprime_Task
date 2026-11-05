export default function Pagination({ page, totalPages, total, loading, hasNext, onPrev, onNext }) {
  let info = `Page ${page}`;
  if (totalPages != null) {
    info += ` of ${totalPages}`;
    if (total != null) info += ` (${total} books)`;
  }

  return (
    <div className="row pager">
      <button type="button" onClick={onPrev} disabled={loading || page <= 1}>
        &laquo; Prev
      </button>
      <span>{info}</span>
      <button type="button" onClick={onNext} disabled={loading || !hasNext}>
        Next &raquo;
      </button>
    </div>
  );
}
