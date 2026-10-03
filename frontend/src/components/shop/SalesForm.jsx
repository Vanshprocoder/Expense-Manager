import { useState } from "react";
import { todayISO } from "../../utils/format";

const empty = {
  sale_date: todayISO(),
  online_amount: "",
  cash_amount: "",
  notes: "",
};

export default function SalesForm({ onSubmit }) {
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        sale_date: form.sale_date,
        online_amount: Number(form.online_amount) || 0,
        cash_amount: Number(form.cash_amount) || 0,
        notes: form.notes || null,
      });
      setForm({ ...empty, sale_date: form.sale_date });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="sale_date">Date</label>
        <input
          id="sale_date"
          type="date"
          required
          value={form.sale_date}
          onChange={(e) => update("sale_date", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="online_amount">Online sales (₹)</label>
        <input
          id="online_amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="0"
          value={form.online_amount}
          onChange={(e) => update("online_amount", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="cash_amount">Cash sales (₹)</label>
        <input
          id="cash_amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="0"
          value={form.cash_amount}
          onChange={(e) => update("cash_amount", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="sale_notes">Notes</label>
        <input
          id="sale_notes"
          type="text"
          placeholder="Optional"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? "Saving…" : "Add sale"}
      </button>
    </form>
  );
}
