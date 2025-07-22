import { useState, useEffect } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import styles from "./EditExpenseModal.module.css";

const EditExpenseModal = ({ isOpen, onClose, transaction, onSaved }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountFrom, setAccountFrom] = useState("");
  const [budgetPlanId, setBudgetPlanId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [plans, setPlans] = useState([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    const load = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.expenseModal);
        if (!res.ok) throw new Error("Failed to load data");
        const data = await res.json();
        setCurrencies(data.currencies);
        setCategories(data.categories);
        setAccounts(data.accounts);
        setPlans(data.plans);
      } catch (e) {
        setError(e.message);
      }
    };

    load();
    if (transaction) {
      setTitle(transaction.title || "");
      setAmount(transaction.amount ? String(transaction.amount) : "");
      setCurrencyId(transaction.currencyId ? String(transaction.currencyId) : "");
      setCategoryId(transaction.categoryId ? String(transaction.categoryId) : "");
      setAccountFrom(transaction.accountFrom ? String(transaction.accountFrom) : "");
      setBudgetPlanId(transaction.budgetPlanId ? String(transaction.budgetPlanId) : "");
      setDescription(transaction.description || "");
      setDate(transaction.date || "");
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose, transaction]);

  const handleSubmit = async () => {
    if (
      !title ||
      !amount ||
      !currencyId ||
      !categoryId ||
      !accountFrom ||
      !budgetPlanId
    ) {
      alert("Please fill in all fields!");
      return;
    }

    const payload = {
      id: transaction.id,
      title,
      amount: parseFloat(amount),
      accountFrom: parseInt(accountFrom),
      budgetPlanId: parseInt(budgetPlanId),
      currencyId: parseInt(currencyId),
      categoryId: parseInt(categoryId),
      date,
      description,
      type: 2,
    };

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.updateTransaction, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      onSaved && onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <h3>Edit Expense</h3>
        {error && <p className={styles.error}>{error}</p>}

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select value={currencyId} onChange={(e) => setCurrencyId(e.target.value)}>
          <option value="">Select currency</option>
          {currencies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.symbol} ({c.name})
            </option>
          ))}
        </select>

        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>

        <select value={accountFrom} onChange={(e) => setAccountFrom(e.target.value)}>
          <option value="">Select account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.title}
            </option>
          ))}
        </select>

        <select value={budgetPlanId} onChange={(e) => setBudgetPlanId(e.target.value)}>
          <option value="">Select plan</option>
          {plans.map((pl) => (
            <option key={pl.id} value={pl.id}>
              {pl.title}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button onClick={handleSubmit} disabled={loading} className={styles["submit-button"]}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button onClick={onClose} className={styles["close-button"]}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditExpenseModal;
