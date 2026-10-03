import { formatCurrency } from "../../utils/format";

export default function BreakdownPanel({ breakdown }) {
  if (!breakdown) return null;

  const incomeItems = [
    { label: "Shop sales", value: breakdown.shop_income },
    { label: "Salary", value: breakdown.salary_income },
    { label: "Home / rent", value: breakdown.home_income },
  ];

  const expenseItems = [
    { label: "Shop expenses", value: breakdown.shop_expenses },
    { label: "Personal", value: breakdown.personal_expenses },
    { label: "Home", value: breakdown.home_expenses },
    { label: "School fees", value: breakdown.school_fees_paid },
  ];

  const maxIncome = Math.max(...incomeItems.map((i) => i.value), 1);
  const maxExpense = Math.max(...expenseItems.map((i) => i.value), 1);

  return (
    <div className="two-col">
      <div className="panel">
        <div className="panel-header">
          <h3>Income sources</h3>
        </div>
        <div className="panel-body">
          <ul className="breakdown-list">
            {incomeItems.map((item) => (
              <li key={item.label}>
                <span style={{ minWidth: 90 }}>{item.label}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(item.value / maxIncome) * 100}%` }} />
                </div>
                <span className="amount-cell">{formatCurrency(item.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="panel">
        <div className="panel-header">
          <h3>Expense categories</h3>
        </div>
        <div className="panel-body">
          <ul className="breakdown-list">
            {expenseItems.map((item) => (
              <li key={item.label}>
                <span style={{ minWidth: 90 }}>{item.label}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(item.value / maxExpense) * 100}%`, background: "#c45c26" }}
                  />
                </div>
                <span className="amount-cell">{formatCurrency(item.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
