import { MONTHS } from "../../utils/format";

export default function MonthPicker({ month, year, onChange }) {
  const years = [];
  const current = new Date().getFullYear();
  for (let y = current; y >= current - 5; y--) years.push(y);

  return (
    <div className="month-picker">
      <select
        value={month}
        onChange={(e) => onChange({ month: Number(e.target.value), year })}
        aria-label="Month"
      >
        {MONTHS.map((name, i) => (
          <option key={name} value={i + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => onChange({ month, year: Number(e.target.value) })}
        aria-label="Year"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
