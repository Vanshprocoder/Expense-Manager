import { useEffect, useState } from "react";
import { api } from "../api/client";
import { formatCurrency } from "../utils/format";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";

const empty = {
  shop_online: "",
  shop_cash: "",
  personal: "",
  home: "",
};

export default function BalancesPage() {
  const [form, setForm] = useState(empty);
  const [computed, setComputed] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setError("");
    try {
      const [opening, shop, personal, home] = await Promise.all([
        api.get("/api/opening-balances"),
        api.get("/api/shop/summary"),
        api.get("/api/personal/summary"),
        api.get("/api/home/summary"),
      ]);
      setForm({
        shop_online: String(opening.shop_online ?? 0),
        shop_cash: String(opening.shop_cash ?? 0),
        personal: String(opening.personal ?? 0),
        home: String(opening.home ?? 0),
      });
      setComputed({
        shop_online: shop.account_balance,
        shop_cash: shop.cash_in_hand,
        personal: personal.available_balance,
        home: home.balance_in_hand,
      });
    } catch (err) {
      setError(err.message || "Failed to load balances");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await api.put("/api/opening-balances", {
        shop_online: Number(form.shop_online) || 0,
        shop_cash: Number(form.shop_cash) || 0,
        personal: Number(form.personal) || 0,
        home: Number(form.home) || 0,
      });
      setMessage("Opening balances saved. Current balances updated.");
      await load();
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Opening balances"
        subtitle="Enter money already available so shop, personal, and home show the correct remaining balance."
      />
      <div className="page-content">
        {error ? <div className="error-banner">{error}</div> : null}
        {message ? <div className="success-banner">{message}</div> : null}

        {computed ? (
          <div className="stats-grid">
            <StatCard
              label="Shop account (current)"
              value={formatCurrency(computed.shop_online)}
              hint="Opening + online sales − online expenses"
              tone="positive"
            />
            <StatCard
              label="Shop cash (current)"
              value={formatCurrency(computed.shop_cash)}
              hint="Opening + cash sales − cash expenses"
              tone="accent"
            />
            <StatCard
              label="Personal (current)"
              value={formatCurrency(computed.personal)}
              hint="Opening + salaries − salary expenses"
            />
            <StatCard
              label="Home (current)"
              value={formatCurrency(computed.home)}
              hint="Opening + home income − rent-paid expenses"
            />
          </div>
        ) : null}

        <div className="panel">
          <div className="panel-header">
            <h3>Set available balances</h3>
          </div>
          <div className="panel-body">
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="ob_shop_online">Shop — online account (₹)</label>
                <input
                  id="ob_shop_online"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.shop_online}
                  onChange={(e) => update("shop_online", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="ob_shop_cash">Shop — cash in hand (₹)</label>
                <input
                  id="ob_shop_cash"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.shop_cash}
                  onChange={(e) => update("shop_cash", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="ob_personal">Personal — in hand (₹)</label>
                <input
                  id="ob_personal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.personal}
                  onChange={(e) => update("personal", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="ob_home">Home — in hand (₹)</label>
                <input
                  id="ob_home"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.home}
                  onChange={(e) => update("home", e.target.value)}
                />
              </div>
              <p className="form-hint field-full">
                These are starting amounts already with you. Tracked sales, salary, rent, and expenses are added or deducted on top.
              </p>
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save balances"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
