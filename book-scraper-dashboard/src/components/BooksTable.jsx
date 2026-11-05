const show = (v) => (v == null || v === "" ? "-" : String(v));

function formatPrice(p) {
  return p != null && p !== "" && !isNaN(Number(p)) ? Number(p).toFixed(2) : show(p);
}

export default function BooksTable({ books }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Price</th>
            <th>Rating</th>
            <th>Availability</th>
          </tr>
        </thead>
        <tbody>
          {books.length === 0 ? (
            <tr>
              <td colSpan={6} className="empty">
                No books found.
              </td>
            </tr>
          ) : (
            books.map((b, i) => (
              <tr key={b.id ?? i}>
                <td>{show(b.id)}</td>
                <td>{show(b.title)}</td>
                <td>{show(b.category)}</td>
                <td>{formatPrice(b.price)}</td>
                <td>{show(b.rating)}</td>
                <td>{show(b.availability ?? b.in_stock)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
