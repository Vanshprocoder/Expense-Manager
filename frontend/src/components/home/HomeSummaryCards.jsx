import StatCard from "../common/StatCard";
import { formatCurrency } from "../../utils/format";

export default function HomeSummaryCards({ summary }) {
  if (!summary) return null;

  return (
    <div className="stats-grid">
      <StatCard
        label="Rent income"
        value={formatCurrency(summary.rent_income)}
        hint={summary.other_income ? `Other: ${formatCurrency(summary.other_income)}` : undefined}
        tone="positive"
      />
      <StatCard label="Home expenses" value={formatCurrency(summary.total_expenses)} />
      <StatCard
        label="Balance in hand"
        value={formatCurrency(summary.balance_in_hand ?? 0)}
        hint={
          summary.opening_home
            ? `Includes opening ${formatCurrency(summary.opening_home)}`
            : "Opening + income − rent-paid expenses"
        }
        tone="accent"
      />
      <StatCard
        label="School fees"
        value={formatCurrency(summary.school_fees_total)}
        hint={`Paid ${formatCurrency(summary.school_fees_paid)}`}
      />
    </div>
  );
}
