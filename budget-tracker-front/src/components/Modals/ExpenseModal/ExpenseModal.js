import { useState, useEffect } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import styles from "./ExpenseModal.module.css";

const ExpenseModal = ({ isOpen, onClose, transaction = null, onSaved }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountFrom, setAccountFrom] = useState("");
  const [budgetPlanId, setBudgetPlanId] = useState("");
  const [description, setDescription] = useState("");

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
        if (!res.ok) throw new Error("Помилка завантаження даних");
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
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (transaction) {
      setTitle(transaction.title || "");
      setAmount(transaction.amount);
      setCurrencyId(String(transaction.currencyId || ""));
      setCategoryId(String(transaction.categoryId || ""));
      setAccountFrom(String(transaction.accountFrom || transaction.accountFromId || ""));
      setBudgetPlanId(String(transaction.budgetPlanId || ""));
      setDescription(transaction.description || "");
    } else {
      setTitle("");
      setAmount("");
      setCurrencyId("");
      setCategoryId("");
      setAccountFrom("");
      setBudgetPlanId("");
      setDescription("");
    }
  }, [isOpen, transaction]);

  const handleSubmit = async () => {
    if (
      !title ||
      !amount ||
      !currencyId ||
      !categoryId ||
      !accountFrom ||
      !budgetPlanId
    ) {
      alert("Заповніть усі поля!");
      return;
    }

    const newTransaction = {
      title,
      amount: parseFloat(amount),
      accountFrom: parseInt(accountFrom),
      budgetPlanId: parseInt(budgetPlanId),
      currencyId: parseInt(currencyId),
      categoryId: parseInt(categoryId),
      date: transaction ? transaction.date : new Date().toISOString(),
      description,
    };

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(transaction ? API_ENDPOINTS.updateTransaction : API_ENDPOINTS.createExpense, {
        method: transaction ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction ? { ...newTransaction, id: transaction.id } : newTransaction),
      });
      if (!res.ok) throw new Error(`Статус ${res.status}`);
      if (onSaved) onSaved({ ...newTransaction, id: transaction ? transaction.id : undefined });
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
        <h3>{transaction ? 'Редагувати витрату' : 'Добавить расход'}</h3>
        {error && <p className={styles.error}>{error}</p>}

        <input
          type="text"
          placeholder="Назва"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Сума"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select
          value={currencyId}
          onChange={(e) => setCurrencyId(e.target.value)}
        >
          <option value="">Оберіть валюту</option>
          {currencies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.symbol} ({c.name})
            </option>
          ))}
        </select>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Оберіть категорію</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>

        <select
          value={accountFrom}
          onChange={(e) => setAccountFrom(e.target.value)}
        >
          <option value="">Оберіть рахунок</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.title}
            </option>
          ))}
        </select>

        <select
          value={budgetPlanId}
          onChange={(e) => setBudgetPlanId(e.target.value)}
        >
          <option value="">Оберіть план</option>
          {plans.map((pl) => (
            <option key={pl.id} value={pl.id}>
              {pl.title}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Опис"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={styles["submit-button"]}
        >
          {loading
            ? transaction
              ? "Saving..."
              : "Creating..."
            : transaction
            ? "Зберегти"
            : "Створити транзакцію"}
        </button>
        <button onClick={onClose} className={styles["close-button"]}>
          Відмінити
        </button>
      </div>
    </div>
  );
};

export default ExpenseModal;
