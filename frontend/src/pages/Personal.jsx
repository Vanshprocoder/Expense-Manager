import { useCallback, useEffect, useState } from "react";
import { api, monthQuery } from "../api/client";
import { currentMonthYear, MONTHS } from "../utils/format";
import PageHeader from "../components/common/PageHeader";
import MonthPicker from "../components/common/MonthPicker";
import PersonalSummaryCards from "../components/personal/PersonalSummaryCards";
import SalaryForm from "../components/personal/SalaryForm";
import PersonalExpenseForm from "../components/personal/PersonalExpenseForm";
import PersonalExpenseList from "../components/personal/PersonalExpenseList";

export default function PersonalPage() {
  const [{ month, year }, setPeriod] = useState(currentMonthYear());
  const [tab, setTab] = useState("expenses");
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const q = monthQuery(year, month);
      const [sum, exp] = await Promise.all([
        api.get(`/api/personal/summary?${q}`),
        api.get(`/api/personal/expenses?${q}`),
      ]);
      setSummary(sum);
      setExpenses(exp);
    } catch (err) {
      setError(err.message || "Failed to load personal data");
    }
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveSalary(payload) {
    setMessage("");
    await api.post("/api/personal/salaries", payload);
    setMessage("Salary saved.");
    await load();
  }

  async function addExpense(payload) {
    setMessage("");
    await api.post("/api/personal/expenses", payload);
    setMessage("Expense recorded.");
    await load();
  }

  async function deleteExpense(id) {
    if (typeof id !== "number") return;
    await api.delete(`/api/personal/expenses/${id}`);
    await load();
  }

  return (
    <>
      <PageHeader
        title="Personal"
        subtitle={`Salary, expenses & savings · ${MONTHS[month - 1]} ${year}`}
        actions={<MonthPicker month={month} year={year} onChange={setPeriod} />}
      />
      <div className="page-content">
        {error ? <div className="error-banner">{error}</div> : null}
        {message ? <div className="success-banner">{message}</div> : null}

        <PersonalSummaryCards summary={summary} />

        <div className="tabs">
          <button
            type="button"
            className={`tab${tab === "expenses" ? " active" : ""}`}
            onClick={() => setTab("expenses")}
          >
            Expenses
          </button>
          <button
            type="button"
            className={`tab${tab === "salary" ? " active" : ""}`}
            onClick={() => setTab("salary")}
          >
            Salary
          </button>
        </div>

        {tab === "salary" ? (
          <div className="panel">
            <div className="panel-header">
              <h3>Monthly salary</h3>
            </div>
            <div className="panel-body">
              <SalaryForm onSubmit={saveSalary} initial={{ month, year, amount: summary?.salary || "" }} />
            </div>
          </div>
        ) : (
          <>
            <div className="panel">
              <div className="panel-header">
                <h3>Add personal expense</h3>
              </div>
              <div className="panel-body">
                <PersonalExpenseForm onSubmit={addExpense} />
              </div>
            </div>
            <div className="panel">
              <div className="panel-header">
                <h3>Expenses this month</h3>
              </div>
              <PersonalExpenseList expenses={expenses} onDelete={deleteExpense} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
