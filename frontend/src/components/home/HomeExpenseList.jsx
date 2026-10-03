import { formatCurrency, formatDate } from "../../utils/format";
import EmptyState from "../common/EmptyState";
import { PAID_FROM_LABEL, PAID_FROM_BADGE } from "../../constants/paidFrom";

export default function HomeExpenseList({ expenses, onDelete }) {
  if (!expenses?.length) {
    return <EmptyState message="No home expenses for this month." />;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Paid from</th>
            <th>Category</th>
            <th>Description</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td>{formatDate(e.expense_date)}</td>
              <td className="amount-cell">{formatCurrency(e.amount)}</td>
              <td>
                <span className={`badge badge-${PAID_FROM_BADGE[e.paid_from] || "other"}`}>
                  {PAID_FROM_LABEL[e.paid_from] || e.paid_from}
                </span>
              </td>
              <td>{e.category}</td>
              <td>{e.description || "—"}</td>
              <td>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => onDelete(e.id)}>
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
