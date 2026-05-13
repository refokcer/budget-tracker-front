import { useEffect, useMemo, useState } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import { apiFetch, apiJson, getApiErrorMessage } from "../../../services/apiClient";
import styles from "./ManageRecurringPayments.module.css";

const TYPES = [
  { value: 2, label: "Expense" },
  { value: 1, label: "Income" },
  { value: 0, label: "Transfer" },
];

const FREQUENCIES = [
  { value: 0, label: "Monthly" },
  { value: 1, label: "Weekly" },
  { value: 2, label: "Yearly" },
];

const WEEK_DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const emptyForm = {
  id: null,
  title: "",
  amount: "",
  currencyId: "",
  categoryId: "",
  accountFrom: "",
  accountTo: "",
  type: "2",
  frequency: "0",
  interval: "1",
  dayOfMonth: "",
  dayOfWeek: "",
  startDate: "",
  endDate: "",
  isActive: true,
  autoCreateTransactions: false,
  description: "",
};

const toDateInput = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

const money = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getTypeLabel = (type) =>
  TYPES.find((item) => Number(item.value) === Number(type))?.label || "Other";

const getFrequencyLabel = (frequency, interval) => {
  const label = FREQUENCIES.find((item) => Number(item.value) === Number(frequency))?.label || "Monthly";
  return Number(interval) > 1 ? `Every ${interval} ${label.toLowerCase()}s` : label;
};

const ManageRecurringPayments = ({ isOpen, onClose }) => {
  const [payments, setPayments] = useState([]);
  const [options, setOptions] = useState({ currencies: [], accounts: [], categories: [] });
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const filteredCategories = useMemo(
    () => options.categories.filter((category) => Number(category.type) === Number(form.type)),
    [options.categories, form.type]
  );

  useEffect(() => {
    if (!isOpen) return;

    const today = new Date().toISOString().slice(0, 10);
    setForm((current) => ({
      ...emptyForm,
      currencyId: current.currencyId,
      startDate: today,
    }));

    load();
  }, [isOpen]);

  const load = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const [paymentsData, optionsData] = await Promise.all([
        apiJson(API_ENDPOINTS.recurringPayments, {}, "Failed to load recurring payments"),
        apiJson(API_ENDPOINTS.recurringPaymentOptions, {}, "Failed to load recurring payment options"),
      ]);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setOptions({
        currencies: optionsData.currencies || [],
        accounts: optionsData.accounts || [],
        categories: optionsData.categories || [],
      });
      setForm((current) => ({
        ...current,
        currencyId: current.currencyId || String(optionsData.currencies?.[0]?.id || ""),
      }));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "type" ? { categoryId: "" } : {}),
    }));
    setMessage(null);
    setError(null);
  };

  const edit = (payment) => {
    setForm({
      id: payment.id,
      title: payment.title || "",
      amount: String(payment.amount ?? ""),
      currencyId: String(payment.currencyId || ""),
      categoryId: payment.categoryId ? String(payment.categoryId) : "",
      accountFrom: payment.accountFrom ? String(payment.accountFrom) : "",
      accountTo: payment.accountTo ? String(payment.accountTo) : "",
      type: String(payment.type),
      frequency: String(payment.frequency),
      interval: String(payment.interval || 1),
      dayOfMonth: payment.dayOfMonth ? String(payment.dayOfMonth) : "",
      dayOfWeek: payment.dayOfWeek != null ? String(payment.dayOfWeek) : "",
      startDate: toDateInput(payment.startDate),
      endDate: toDateInput(payment.endDate),
      isActive: Boolean(payment.isActive),
      autoCreateTransactions: Boolean(payment.autoCreateTransactions),
      description: payment.description || "",
    });
  };

  const reset = () => {
    setForm({
      ...emptyForm,
      currencyId: String(options.currencies?.[0]?.id || ""),
      startDate: new Date().toISOString().slice(0, 10),
    });
    setMessage(null);
    setError(null);
  };

  const buildPayload = () => ({
    ...(form.id ? { id: form.id } : {}),
    title: form.title.trim(),
    amount: Number(form.amount),
    currencyId: Number(form.currencyId),
    categoryId: form.categoryId ? Number(form.categoryId) : null,
    accountFrom: form.accountFrom ? Number(form.accountFrom) : null,
    accountTo: form.accountTo ? Number(form.accountTo) : null,
    type: Number(form.type),
    frequency: Number(form.frequency),
    interval: Number(form.interval || 1),
    dayOfMonth: form.dayOfMonth ? Number(form.dayOfMonth) : null,
    dayOfWeek: form.dayOfWeek !== "" ? Number(form.dayOfWeek) : null,
    startDate: form.startDate,
    endDate: form.endDate || null,
    isActive: form.isActive,
    autoCreateTransactions: form.autoCreateTransactions,
    description: form.description.trim() || null,
  });

  const save = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.amount || !form.currencyId || !form.startDate) {
      setError("Title, amount, currency and start date are required.");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const saved = await apiJson(API_ENDPOINTS.recurringPayments, {
        method: form.id ? "PUT" : "POST",
        body: buildPayload(),
      }, "Failed to save recurring payment");

      setPayments((current) =>
        form.id
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved]
      );
      setMessage(form.id ? "Recurring payment updated" : "Recurring payment added");
      reset();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (payment) => {
    if (!window.confirm(`Delete "${payment.title}"?`)) return;

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await apiFetch(API_ENDPOINTS.recurringPaymentById(payment.id), {
        method: "DELETE",
      }, "Failed to delete recurring payment");
      setPayments((current) => current.filter((item) => item.id !== payment.id));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const generateDue = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const result = await apiJson(API_ENDPOINTS.generateRecurringPayments, {
        method: "POST",
        body: { upTo: new Date().toISOString().slice(0, 10) },
      }, "Failed to generate recurring transactions");
      const summary = `Generated ${result.created || 0} transactions, skipped ${result.skipped || 0}`;
      await load();
      setMessage(summary);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h3>Recurring payments</h3>
            <p>Rent, subscriptions, utilities, salary and transfers used by auto plans and forecasts.</p>
          </div>
          <button className={styles.secondaryButton} onClick={generateDue} disabled={busy || loading}>
            Generate due
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.success}>{message}</p>}

        <div className={styles.body}>
          <div className={styles.list}>
            {loading && <p className={styles.muted}>Loading...</p>}
            {!loading && payments.length === 0 && (
              <p className={styles.muted}>No recurring payments yet.</p>
            )}
            {payments.map((payment) => (
              <article
                key={payment.id}
                className={`${styles.paymentCard} ${!payment.isActive ? styles.inactive : ""}`}
              >
                <div className={styles.paymentTop}>
                  <div>
                    <h4>{payment.title}</h4>
                    <span>{getTypeLabel(payment.type)} - {getFrequencyLabel(payment.frequency, payment.interval)}</span>
                  </div>
                  <strong>{payment.currencySymbol || ""}{money(payment.amount)}</strong>
                </div>
                <div className={styles.metaRow}>
                  <span>{payment.categoryTitle || "No category"}</span>
                  <span>{payment.accountFromTitle || payment.accountToTitle || "No account"}</span>
                  <span>{payment.autoCreateTransactions ? "Auto-create" : "Plan only"}</span>
                </div>
                {payment.preview?.length > 0 && (
                  <div className={styles.previewRow}>
                    {payment.preview.map((item) => (
                      <span key={`${payment.id}-${item.date}`}>{toDateInput(item.date)}</span>
                    ))}
                  </div>
                )}
                <div className={styles.cardActions}>
                  <button onClick={() => edit(payment)} disabled={busy}>Edit</button>
                  <button onClick={() => remove(payment)} disabled={busy} className={styles.dangerButton}>Delete</button>
                </div>
              </article>
            ))}
          </div>

          <form className={styles.form} onSubmit={save}>
            <h4>{form.id ? "Edit recurring payment" : "New recurring payment"}</h4>

            <label>
              <span>Title</span>
              <input value={form.title} onChange={(e) => updateField("title", e.target.value)} />
            </label>

            <div className={styles.twoCols}>
              <label>
                <span>Type</span>
                <select value={form.type} onChange={(e) => updateField("type", e.target.value)}>
                  {TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Amount</span>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => updateField("amount", e.target.value)} />
              </label>
            </div>

            <div className={styles.twoCols}>
              <label>
                <span>Currency</span>
                <select value={form.currencyId} onChange={(e) => updateField("currencyId", e.target.value)}>
                  {options.currencies.map((currency) => (
                    <option key={currency.id} value={currency.id}>
                      {currency.symbol} {currency.code || currency.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Category</span>
                <select value={form.categoryId} onChange={(e) => updateField("categoryId", e.target.value)}>
                  <option value="">No category</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.title}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.twoCols}>
              <label>
                <span>From account</span>
                <select value={form.accountFrom} onChange={(e) => updateField("accountFrom", e.target.value)}>
                  <option value="">None</option>
                  {options.accounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.title}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>To account</span>
                <select value={form.accountTo} onChange={(e) => updateField("accountTo", e.target.value)}>
                  <option value="">None</option>
                  {options.accounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.title}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.twoCols}>
              <label>
                <span>Frequency</span>
                <select value={form.frequency} onChange={(e) => updateField("frequency", e.target.value)}>
                  {FREQUENCIES.map((frequency) => (
                    <option key={frequency.value} value={frequency.value}>{frequency.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Interval</span>
                <input type="number" min="1" value={form.interval} onChange={(e) => updateField("interval", e.target.value)} />
              </label>
            </div>

            <div className={styles.twoCols}>
              <label>
                <span>Day of month</span>
                <input type="number" min="1" max="31" value={form.dayOfMonth} onChange={(e) => updateField("dayOfMonth", e.target.value)} />
              </label>
              <label>
                <span>Day of week</span>
                <select value={form.dayOfWeek} onChange={(e) => updateField("dayOfWeek", e.target.value)}>
                  <option value="">By start date</option>
                  {WEEK_DAYS.map((day) => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.twoCols}>
              <label>
                <span>Start date</span>
                <input type="date" value={form.startDate} onChange={(e) => updateField("startDate", e.target.value)} />
              </label>
              <label>
                <span>End date</span>
                <input type="date" value={form.endDate} onChange={(e) => updateField("endDate", e.target.value)} />
              </label>
            </div>

            <label>
              <span>Description</span>
              <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} />
            </label>

            <div className={styles.checks}>
              <label>
                <input type="checkbox" checked={form.isActive} onChange={(e) => updateField("isActive", e.target.checked)} />
                Active
              </label>
              <label>
                <input type="checkbox" checked={form.autoCreateTransactions} onChange={(e) => updateField("autoCreateTransactions", e.target.checked)} />
                Auto-create transactions
              </label>
            </div>

            <div className={styles.formActions}>
              <button type="submit" disabled={busy}>{form.id ? "Save changes" : "Add recurring"}</button>
              <button type="button" className={styles.secondaryButton} onClick={reset} disabled={busy}>Reset</button>
            </div>
          </form>
        </div>

        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ManageRecurringPayments;
