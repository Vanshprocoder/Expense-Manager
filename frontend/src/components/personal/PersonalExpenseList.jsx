import { formatCurrency, formatDate } from "../../utils/format";
import EmptyState from "../common/EmptyState";

const LINK_LABEL = {
  home: "From home",
  school: "School fee",
};

export default function PersonalExpenseList({ expenses, onDelete }) {
  if (!expenses?.length) {
    return <EmptyState message="No personal expenses for this month." />;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Type</th>
            <th>Description</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td>{formatDate(e.expense_date)}</td>
              <td className="amount-cell">{formatCurrency(e.amount)}</td>
              <td>{e.category}</td>
              <td>
                {e.linked_from ? (
                  <span className="badge badge-linked">{LINK_LABEL[e.linked_from] || "Linked"}</span>
                ) : e.is_major ? (
                  <span className="badge badge-major">Major</span>
                ) : (
                  "Regular"
                )}
              </td>
              <td>{e.description || "—"}</td>
              <td>
                {e.editable !== false ? (
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => onDelete(e.id)}>
                    Delete
                  </button>
                ) : (
                  <span className="muted-cell">Edit in Home</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
