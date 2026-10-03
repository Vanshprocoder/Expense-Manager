import { formatCurrency, formatDate } from "../../utils/format";
import EmptyState from "../common/EmptyState";

export default function SalesList({ sales, onDelete }) {
  if (!sales?.length) {
    return <EmptyState message="No sales recorded for this month." />;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Online</th>
            <th>Cash</th>
            <th>Total</th>
            <th>Notes</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id}>
              <td>{formatDate(s.sale_date)}</td>
              <td className="amount-cell">{formatCurrency(s.online_amount)}</td>
              <td className="amount-cell">{formatCurrency(s.cash_amount)}</td>
              <td className="amount-cell">
                {formatCurrency((s.online_amount || 0) + (s.cash_amount || 0))}
              </td>
              <td>{s.notes || "—"}</td>
              <td>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => onDelete(s.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
