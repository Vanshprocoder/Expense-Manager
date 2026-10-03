import { useState } from "react";
import { todayISO } from "../../utils/format";

const empty = {
  income_date: todayISO(),
  amount: "",
  source: "rent",
  description: "",
};

export default function RentForm({ onSubmit }) {
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
        income_date: form.income_date,
        amount: Number(form.amount),
        source: form.source,
        description: form.description || null,
      });
      setForm({ ...empty, income_date: form.income_date, source: form.source });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="hi_date">Date</label>
        <input
          id="hi_date"
          type="date"
          required
          value={form.income_date}
          onChange={(e) => update("income_date", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="hi_amount">Amount (₹)</label>
        <input
          id="hi_amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={form.amount}
          onChange={(e) => update("amount", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="hi_source">Source</label>
        <select id="hi_source" value={form.source} onChange={(e) => update("source", e.target.value)}>
          <option value="rent">Rent</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="hi_desc">Description</label>
        <input
          id="hi_desc"
          type="text"
          placeholder="Tenant / property"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? "Saving…" : "Add income"}
      </button>
    </form>
  );
}
