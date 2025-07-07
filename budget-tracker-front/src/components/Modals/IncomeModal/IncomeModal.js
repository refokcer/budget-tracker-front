import { useState, useEffect } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import styles from "./IncomeModal.module.css";

const IncomeModal = ({ isOpen, onClose, transaction = null, onSaved }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountTo, setAccountTo] = useState("");
  const [description, setDescription] = useState("");
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const fetchData = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.incomeModal);
        if (!res.ok) throw new Error("Помилка завантаження даних");
        const data = await res.json();
        setCurrencies(data.currencies);
        setCategories(data.categories);
        setAccounts(data.accounts);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();

    document.addEventListener("keydown", handleKeyDown);

    // Видаляємо обробник при розмонтуванні/закритті
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (transaction) {
      setTitle(transaction.title || "");
      setAmount(transaction.amount);
      setCurrencyId(String(transaction.currencyId || ""));
      setCategoryId(String(transaction.categoryId || ""));
      setAccountTo(String(transaction.accountTo || transaction.accountToId || ""));
      setDescription(transaction.description || "");
    } else {
      setTitle("");
      setAmount("");
      setCurrencyId("");
      setCategoryId("");
      setAccountTo("");
      setDescription("");
    }
  }, [isOpen, transaction]);

  const handleSubmit = async () => {
    if (!title || !amount || !currencyId || !categoryId || !accountTo) {
      alert("Заповніть всі поля!");
      return;
    }

    setLoading(true);
    setError(null);

    const newTransaction = {
      title,
      amount: parseFloat(amount),
      currencyId: parseInt(currencyId),
      categoryId: parseInt(categoryId),
      date: transaction ? transaction.date : new Date().toISOString(),
      accountTo: parseInt(accountTo),
      description,
    };

    try {
      const response = await fetch(
        transaction ? API_ENDPOINTS.updateTransaction : API_ENDPOINTS.createIncome,
        {
          method: transaction ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            transaction ? { ...newTransaction, id: transaction.id } : newTransaction
          ),
        }
      );

      if (!response.ok) {
        throw new Error("Помилка при створенні транзакції");
      }

      if (onSaved) onSaved({ ...newTransaction, id: transaction ? transaction.id : undefined });
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <h3>{transaction ? 'Редагувати дохід' : 'Додати дохід'}</h3>
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
          value={accountTo}
          onChange={(e) => setAccountTo(e.target.value)}
        >
          <option value="">Оберіть рахунок</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.title}
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
              : "Створення..."
            : transaction
            ? "Зберегти"
            : "Створити транзакцію"}
        </button>
        <button onClick={onClose} className={styles["close-button"]}>
          Скасувати
        </button>
      </div>
    </div>
  );
};

export default IncomeModal;
