import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "../../utils/format";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #d5dbd4",
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: 13,
      }}
    >
      <div style={{ color: "#6e7b72", marginBottom: 4 }}>{label}</div>
      <strong>{formatCurrency(payload[0].value)}</strong>
    </div>
  );
}

export default function SalesChart({ data }) {
  const chartData = (data || []).map((d) => ({
    ...d,
    label: d.date?.slice(8) || d.date,
  }));

  if (!chartData.length) {
    return (
      <div className="empty-state">
        <p>No shop sales this month to chart.</p>
      </div>
    );
  }

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8e0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6e7b72" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: "#6e7b72" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
            width={42}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(31,107,74,0.06)" }} />
          <Bar dataKey="amount" fill="#1f6b4a" radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
