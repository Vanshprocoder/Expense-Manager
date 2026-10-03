import { useState } from "react";
import { todayISO } from "../../utils/format";

const empty = {
  expense_date: todayISO(),
  amount: "",
  source: "cash",
  category: "",
  description: "",
};

export default function ShopExpenseForm({ onSubmit }) {
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
        source: form.source,
        category: form.category || null,
        description: form.description || null,
      });
      setForm({ ...empty, expense_date: form.expense_date, source: form.source });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="shop_exp_date">Date</label>
        <input
          id="shop_exp_date"
          type="date"
          required
          value={form.expense_date}
          onChange={(e) => update("expense_date", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="shop_exp_amount">Amount (₹)</label>
        <input
          id="shop_exp_amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={form.amount}
          onChange={(e) => update("amount", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="shop_exp_source">Paid from</label>
        <select
          id="shop_exp_source"
          value={form.source}
          onChange={(e) => update("source", e.target.value)}
        >
          <option value="online">Online account</option>
          <option value="cash">Cash in hand</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="shop_exp_cat">Category</label>
        <input
          id="shop_exp_cat"
          type="text"
          placeholder="Stock, rent, utilities…"
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
        />
      </div>
      <div className="field field-full">
        <label htmlFor="shop_exp_desc">Description</label>
        <input
          id="shop_exp_desc"
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
