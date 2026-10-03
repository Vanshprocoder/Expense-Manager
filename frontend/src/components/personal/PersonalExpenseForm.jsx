import { useState } from "react";
import { todayISO } from "../../utils/format";

const empty = {
  expense_date: todayISO(),
  amount: "",
  category: "",
  is_major: false,
  description: "",
};

export default function PersonalExpenseForm({ onSubmit }) {
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
        expense_date: form.expense_date,
        amount: Number(form.amount),
        category: form.category,
        is_major: form.is_major,
        description: form.description || null,
      });
      setForm({ ...empty, expense_date: form.expense_date });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="pe_date">Date</label>
        <input
          id="pe_date"
          type="date"
          required
          value={form.expense_date}
          onChange={(e) => update("expense_date", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="pe_amount">Amount (₹)</label>
        <input
          id="pe_amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={form.amount}
          onChange={(e) => update("amount", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="pe_cat">Category</label>
        <input
          id="pe_cat"
          type="text"
          required
          placeholder="Food, travel, EMI…"
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
        />
      </div>
      <div className="field field-checkbox">
        <input
          id="pe_major"
          type="checkbox"
          checked={form.is_major}
          onChange={(e) => update("is_major", e.target.checked)}
        />
        <label htmlFor="pe_major">Major expense</label>
      </div>
      <div className="field field-full">
        <label htmlFor="pe_desc">Description</label>
        <input
          id="pe_desc"
          type="text"
          placeholder="Optional"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? "Saving…" : "Add expense"}
      </button>
    </form>
  );
}
