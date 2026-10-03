import StatCard from "../common/StatCard";
import { formatCurrency } from "../../utils/format";

export default function PersonalSummaryCards({ summary }) {
  if (!summary) return null;

  const savings = summary.month_end_savings;
  const linked = summary.linked_home_expenses || 0;
  return (
    <div className="stats-grid">
      <StatCard label="Salary" value={formatCurrency(summary.salary)} />
      <StatCard
        label="Total expenses"
        value={formatCurrency(summary.total_expenses)}
        hint={
          linked
            ? `Includes ${formatCurrency(linked)} from home / school`
            : "Personal + home paid from salary"
        }
      />
      <StatCard
        label="Available balance"
        value={formatCurrency(summary.available_balance ?? 0)}
        hint={
          summary.opening_personal
            ? `Includes opening ${formatCurrency(summary.opening_personal)}`
            : "Opening + salaries − expenses"
        }
        tone="positive"
      />
      <StatCard
        label="Month-end savings"
        value={formatCurrency(savings)}
        hint="This month: salary − expenses"
        tone={savings >= 0 ? "positive" : "negative"}
      />
    </div>
  );
}
