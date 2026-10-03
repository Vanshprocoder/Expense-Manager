import { useState } from "react";
import { currentMonthYear } from "../../utils/format";

export default function SalaryForm({ onSubmit, initial }) {
  const now = currentMonthYear();
  const [form, setForm] = useState({
    month: initial?.month || now.month,
    year: initial?.year || now.year,
    amount: initial?.amount ?? "",
    notes: initial?.notes || "",
  });
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        month: Number(form.month),
        year: Number(form.year),
        amount: Number(form.amount),
        notes: form.notes || null,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="sal_month">Month</label>
        <select id="sal_month" value={form.month} onChange={(e) => update("month", e.target.value)}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2000, i, 1).toLocaleString("en", { month: "long" })}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="sal_year">Year</label>
        <input
          id="sal_year"
          type="number"
          required
          value={form.year}
          onChange={(e) => update("year", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="sal_amount">Salary (₹)</label>
        <input
          id="sal_amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={form.amount}
          onChange={(e) => update("amount", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="sal_notes">Notes</label>
        <input
          id="sal_notes"
          type="text"
          placeholder="Optional"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? "Saving…" : "Save salary"}
      </button>
    </form>
  );
}
