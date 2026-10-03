import StatCard from "../common/StatCard";
import { formatCurrency } from "../../utils/format";

export default function ShopSummaryCards({ summary }) {
  if (!summary) return null;

  const change = summary.sales_change;
  const pct = summary.sales_change_percent;
  let changeHint = "vs previous month";
  if (pct != null) {
    changeHint = `${change >= 0 ? "+" : ""}${pct}% vs previous month`;
  }

  const linked = summary.linked_home_expenses || 0;

  return (
    <div className="stats-grid">
      <StatCard
        label="Total sales"
        value={formatCurrency(summary.total_sales)}
        hint={`Online ${formatCurrency(summary.online_sales)} · Cash ${formatCurrency(summary.cash_sales)}`}
      />
      <StatCard
        label="vs last month"
        value={formatCurrency(Math.abs(change || 0))}
        hint={changeHint}
        tone={change >= 0 ? "positive" : "negative"}
      />
      <StatCard
        label="Account balance"
        value={formatCurrency(summary.account_balance)}
        hint={
          summary.opening_shop_online
            ? `Includes opening ${formatCurrency(summary.opening_shop_online)}`
            : "Opening + online sales − online expenses"
        }
        tone="positive"
      />
      <StatCard
        label="Cash in hand"
        value={formatCurrency(summary.cash_in_hand)}
        hint={
          summary.opening_shop_cash
            ? `Includes opening ${formatCurrency(summary.opening_shop_cash)}`
            : "Opening + cash sales − cash expenses"
        }
        tone="accent"
      />
      <StatCard
        label="Shop expenses"
        value={formatCurrency(summary.total_expenses)}
        hint={
          linked
            ? `Includes ${formatCurrency(linked)} from home / school`
            : `Online ${formatCurrency(summary.online_expenses)} · Cash ${formatCurrency(summary.cash_expenses)}`
        }
      />
    </div>
  );
}
