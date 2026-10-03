import { useCallback, useEffect, useState } from "react";
import { api, monthQuery } from "../api/client";
import { currentMonthYear, MONTHS } from "../utils/format";
import PageHeader from "../components/common/PageHeader";
import MonthPicker from "../components/common/MonthPicker";
import HomeSummaryCards from "../components/home/HomeSummaryCards";
import RentForm from "../components/home/RentForm";
import HomeExpenseForm from "../components/home/HomeExpenseForm";
import SchoolFeeForm from "../components/home/SchoolFeeForm";
import HomeIncomeList from "../components/home/HomeIncomeList";
import HomeExpenseList from "../components/home/HomeExpenseList";
import SchoolFeeList from "../components/home/SchoolFeeList";

export default function HomePage() {
  const [{ month, year }, setPeriod] = useState(currentMonthYear());
  const [tab, setTab] = useState("expenses");
  const [summary, setSummary] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [fees, setFees] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const q = monthQuery(year, month);
      const [sum, inc, exp, fee] = await Promise.all([
        api.get(`/api/home/summary?${q}`),
        api.get(`/api/home/incomes?${q}`),
        api.get(`/api/home/expenses?${q}`),
        api.get(`/api/home/school-fees?${q}`),
      ]);
      setSummary(sum);
      setIncomes(inc);
      setExpenses(exp);
      setFees(fee);
    } catch (err) {
      setError(err.message || "Failed to load home data");
    }
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  async function addIncome(payload) {
    setMessage("");
    await api.post("/api/home/incomes", payload);
    setMessage("Income recorded.");
    await load();
  }

  async function addExpense(payload) {
    setMessage("");
    await api.post("/api/home/expenses", payload);
    setMessage("Expense recorded.");
    await load();
  }

  async function addFee(payload) {
    setMessage("");
    await api.post("/api/home/school-fees", payload);
    setMessage("School fee added.");
    await load();
  }

  async function deleteIncome(id) {
    await api.delete(`/api/home/incomes/${id}`);
    await load();
  }

  async function deleteExpense(id) {
    await api.delete(`/api/home/expenses/${id}`);
    await load();
  }

  async function deleteFee(id) {
    await api.delete(`/api/home/school-fees/${id}`);
    await load();
  }

  async function toggleFeeStatus(id, status) {
    await api.patch(`/api/home/school-fees/${id}?status=${status}`);
    await load();
  }

  return (
    <>
      <PageHeader
        title="Home"
        subtitle={`Rent, school fees & household expenses · ${MONTHS[month - 1]} ${year}`}
        actions={<MonthPicker month={month} year={year} onChange={setPeriod} />}
      />
      <div className="page-content">
        {error ? <div className="error-banner">{error}</div> : null}
        {message ? <div className="success-banner">{message}</div> : null}

        <HomeSummaryCards summary={summary} />

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
            className={`tab${tab === "income" ? " active" : ""}`}
            onClick={() => setTab("income")}
          >
            Rent / income
          </button>
          <button
            type="button"
            className={`tab${tab === "fees" ? " active" : ""}`}
            onClick={() => setTab("fees")}
          >
            School fees
          </button>
        </div>

        {tab === "income" ? (
          <>
            <div className="panel">
              <div className="panel-header">
                <h3>Add rent / income</h3>
              </div>
              <div className="panel-body">
                <RentForm onSubmit={addIncome} />
              </div>
            </div>
            <div className="panel">
              <div className="panel-header">
                <h3>Income this month</h3>
              </div>
              <HomeIncomeList incomes={incomes} onDelete={deleteIncome} />
            </div>
          </>
        ) : null}

        {tab === "expenses" ? (
          <>
            <div className="panel">
              <div className="panel-header">
                <h3>Add home expense</h3>
              </div>
              <div className="panel-body">
                <HomeExpenseForm onSubmit={addExpense} />
              </div>
            </div>
            <div className="panel">
              <div className="panel-header">
                <h3>Expenses this month</h3>
              </div>
              <HomeExpenseList expenses={expenses} onDelete={deleteExpense} />
            </div>
          </>
        ) : null}

        {tab === "fees" ? (
          <>
            <div className="panel">
              <div className="panel-header">
                <h3>Add school fee</h3>
              </div>
              <div className="panel-body">
                <SchoolFeeForm onSubmit={addFee} />
              </div>
            </div>
            <div className="panel">
              <div className="panel-header">
                <h3>School fees this month</h3>
              </div>
              <SchoolFeeList fees={fees} onDelete={deleteFee} onToggleStatus={toggleFeeStatus} />
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
