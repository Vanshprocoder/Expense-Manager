import { useCallback, useEffect, useState } from "react";
import { api, monthQuery } from "../api/client";
import { formatCurrency, currentMonthYear, MONTHS } from "../utils/format";
import PageHeader from "../components/common/PageHeader";
import MonthPicker from "../components/common/MonthPicker";
import StatCard from "../components/common/StatCard";
import SalesChart from "../components/dashboard/SalesChart";
import BreakdownPanel from "../components/dashboard/BreakdownPanel";

export default function DashboardPage() {
  const [{ month, year }, setPeriod] = useState(currentMonthYear());
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/dashboard?${monthQuery(year, month)}`);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`${MONTHS[month - 1]} ${year} overview`}
        actions={<MonthPicker month={month} year={year} onChange={setPeriod} />}
      />
      <div className="page-content">
        {error ? <div className="error-banner">{error}</div> : null}
        {loading && !data ? (
          <div className="loading">Loading dashboard…</div>
        ) : data ? (
          <>
            <div className="stats-grid">
              <StatCard label="Total income" value={formatCurrency(data.total_income)} tone="positive" />
              <StatCard label="Total expenses" value={formatCurrency(data.total_expenses)} tone="accent" />
              <StatCard
                label="Net balance"
                value={formatCurrency(data.net)}
                hint="Income − expenses"
                tone={data.net >= 0 ? "positive" : "negative"}
              />
            </div>

            <BreakdownPanel breakdown={data.breakdown} />

            <div className="panel">
              <div className="panel-header">
                <h3>Daily shop sales</h3>
              </div>
              <div className="panel-body">
                <SalesChart data={data.daily_shop_sales} />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
