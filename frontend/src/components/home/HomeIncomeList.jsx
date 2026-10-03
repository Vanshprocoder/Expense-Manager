import { formatCurrency, formatDate } from "../../utils/format";
import EmptyState from "../common/EmptyState";

export default function HomeIncomeList({ incomes, onDelete }) {
  if (!incomes?.length) {
    return <EmptyState message="No home income recorded for this month." />;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Source</th>
            <th>Description</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {incomes.map((i) => (
            <tr key={i.id}>
              <td>{formatDate(i.income_date)}</td>
              <td className="amount-cell">{formatCurrency(i.amount)}</td>
              <td>
                <span className={`badge badge-${i.source}`}>{i.source}</span>
              </td>
              <td>{i.description || "—"}</td>
              <td>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => onDelete(i.id)}>
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
