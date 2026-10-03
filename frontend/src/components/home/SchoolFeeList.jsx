import { formatCurrency, formatDate } from "../../utils/format";
import EmptyState from "../common/EmptyState";
import { PAID_FROM_LABEL, PAID_FROM_BADGE } from "../../constants/paidFrom";

export default function SchoolFeeList({ fees, onDelete, onToggleStatus }) {
  if (!fees?.length) {
    return <EmptyState message="No school fees for this month." />;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Due date</th>
            <th>Amount</th>
            <th>Child</th>
            <th>Paid from</th>
            <th>Status</th>
            <th>Description</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {fees.map((f) => (
            <tr key={f.id}>
              <td>{formatDate(f.due_date)}</td>
              <td className="amount-cell">{formatCurrency(f.amount)}</td>
              <td>{f.child_name || "—"}</td>
              <td>
                <span className={`badge badge-${PAID_FROM_BADGE[f.paid_from] || "other"}`}>
                  {PAID_FROM_LABEL[f.paid_from] || f.paid_from}
                </span>
              </td>
              <td>
                <button
                  className={`badge badge-${f.status}`}
                  type="button"
                  style={{ cursor: "pointer", border: "none" }}
                  onClick={() => onToggleStatus(f.id, f.status === "paid" ? "pending" : "paid")}
                  title="Click to toggle status"
                >
                  {f.status}
                </button>
              </td>
              <td>{f.description || "—"}</td>
              <td>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => onDelete(f.id)}>
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
