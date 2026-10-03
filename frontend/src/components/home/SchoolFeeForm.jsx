import { useState } from "react";
import { todayISO } from "../../utils/format";
import { PAID_FROM_OPTIONS } from "../../constants/paidFrom";

const empty = {
  due_date: todayISO(),
  amount: "",
  paid_from: "salary",
  child_name: "",
  status: "pending",
  description: "",
};

export default function SchoolFeeForm({ onSubmit }) {
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
        due_date: form.due_date,
        amount: Number(form.amount),
        paid_from: form.paid_from,
        child_name: form.child_name || null,
        status: form.status,
        description: form.description || null,
      });
      setForm({ ...empty, due_date: form.due_date, paid_from: form.paid_from });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="sf_date">Due date</label>
        <input
          id="sf_date"
          type="date"
          required
          value={form.due_date}
          onChange={(e) => update("due_date", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="sf_amount">Amount (₹)</label>
        <input
          id="sf_amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={form.amount}
          onChange={(e) => update("amount", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="sf_child">Child name</label>
        <input
          id="sf_child"
          type="text"
          placeholder="Optional"
          value={form.child_name}
          onChange={(e) => update("child_name", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="sf_from">Paid from</label>
        <select
          id="sf_from"
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
        <label htmlFor="sf_status">Status</label>
        <select id="sf_status" value={form.status} onChange={(e) => update("status", e.target.value)}>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="sf_desc">Description</label>
        <input
          id="sf_desc"
          type="text"
          placeholder="Term / school"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>
      <p className="form-hint field-full">
        Only paid fees deduct from salary / shop balances. Shop Online → account · Shop Cash → cash in hand.
      </p>
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? "Saving…" : "Add school fee"}
      </button>
    </form>
  );
}
