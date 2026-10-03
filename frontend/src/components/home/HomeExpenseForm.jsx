import { useState } from "react";
import { todayISO } from "../../utils/format";
import { PAID_FROM_OPTIONS } from "../../constants/paidFrom";

const empty = {
  expense_date: todayISO(),
  amount: "",
  paid_from: "salary",
  category: "",
  description: "",
};

export default function HomeExpenseForm({ onSubmit }) {
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
        paid_from: form.paid_from,
        category: form.category,
        description: form.description || null,
      });
      setForm({ ...empty, expense_date: form.expense_date, paid_from: form.paid_from });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="he_date">Date</label>
        <input
          id="he_date"
          type="date"
          required
          value={form.expense_date}
          onChange={(e) => update("expense_date", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="he_amount">Amount (₹)</label>
        <input
          id="he_amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={form.amount}
          onChange={(e) => update("amount", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="he_from">Paid from</label>
        <select
          id="he_from"
          key="paid-from-v2"
          value={form.paid_from}
          onChange={(e) => update("paid_from", e.target.value)}
        >
          {PAID_FROM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="he_cat">Category</label>
        <input
          id="he_cat"
          type="text"
          required
          placeholder="Groceries, utilities…"
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
        />
      </div>
      <div className="field field-full">
        <label htmlFor="he_desc">Description</label>
        <input
          id="he_desc"
          type="text"
          placeholder="Optional"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>
      <p className="form-hint field-full">
        Shop Online deducts account balance · Shop Cash deducts cash in hand · Salary deducts month-end savings.
      </p>
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? "Saving…" : "Add expense"}
      </button>
    </form>
  );
}
