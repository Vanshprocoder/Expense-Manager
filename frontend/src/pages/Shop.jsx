import { useCallback, useEffect, useState } from "react";
import { api, monthQuery } from "../api/client";
import { currentMonthYear, MONTHS } from "../utils/format";
import PageHeader from "../components/common/PageHeader";
import MonthPicker from "../components/common/MonthPicker";
import ShopSummaryCards from "../components/shop/ShopSummaryCards";
import SalesForm from "../components/shop/SalesForm";
import ShopExpenseForm from "../components/shop/ShopExpenseForm";
import SalesList from "../components/shop/SalesList";
import ShopExpenseList from "../components/shop/ShopExpenseList";

export default function ShopPage() {
  const [{ month, year }, setPeriod] = useState(currentMonthYear());
  const [tab, setTab] = useState("sales");
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const q = monthQuery(year, month);
      const [sum, s, e] = await Promise.all([
        api.get(`/api/shop/summary?${q}`),
        api.get(`/api/shop/sales?${q}`),
        api.get(`/api/shop/expenses?${q}`),
      ]);
      setSummary(sum);
      setSales(s);
      setExpenses(e);
    } catch (err) {
      setError(err.message || "Failed to load shop data");
    }
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  async function addSale(payload) {
    setMessage("");
    await api.post("/api/shop/sales", payload);
    setMessage("Sale recorded.");
    await load();
  }

  async function addExpense(payload) {
    setMessage("");
    await api.post("/api/shop/expenses", payload);
    setMessage("Expense recorded.");
    await load();
  }

  async function deleteSale(id) {
    await api.delete(`/api/shop/sales/${id}`);
    await load();
  }

  async function deleteExpense(id) {
    if (typeof id !== "number") return;
    await api.delete(`/api/shop/expenses/${id}`);
    await load();
  }

  return (
    <>
      <PageHeader
        title="Shop"
        subtitle={`Track sales, expenses, and balances · ${MONTHS[month - 1]} ${year}`}
        actions={<MonthPicker month={month} year={year} onChange={setPeriod} />}
      />
      <div className="page-content">
        {error ? <div className="error-banner">{error}</div> : null}
        {message ? <div className="success-banner">{message}</div> : null}

        <ShopSummaryCards summary={summary} />

        <div className="tabs">
          <button type="button" className={`tab${tab === "sales" ? " active" : ""}`} onClick={() => setTab("sales")}>
            Daily sales
          </button>
          <button
            type="button"
            className={`tab${tab === "expenses" ? " active" : ""}`}
            onClick={() => setTab("expenses")}
          >
            Expenses
          </button>
        </div>

        {tab === "sales" ? (
          <>
            <div className="panel">
              <div className="panel-header">
                <h3>Add daily sale</h3>
              </div>
              <div className="panel-body">
                <SalesForm onSubmit={addSale} />
              </div>
            </div>
            <div className="panel">
              <div className="panel-header">
                <h3>Sales this month</h3>
              </div>
              <SalesList sales={sales} onDelete={deleteSale} />
            </div>
          </>
        ) : (
          <>
            <div className="panel">
              <div className="panel-header">
                <h3>Add shop expense</h3>
              </div>
              <div className="panel-body">
                <ShopExpenseForm onSubmit={addExpense} />
              </div>
            </div>
            <div className="panel">
              <div className="panel-header">
                <h3>Expenses this month</h3>
              </div>
              <ShopExpenseList expenses={expenses} onDelete={deleteExpense} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
