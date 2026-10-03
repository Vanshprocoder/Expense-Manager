export default function StatCard({ label, value, hint, tone }) {
  const className = ["stat-card", tone].filter(Boolean).join(" ");
  return (
    <div className={className}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}
