import { useState, useEffect } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import styles from "./TransferModal.module.css";

const TransferModal = ({ isOpen, onClose, transaction, onSaved }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [accountFrom, setAccountFrom] = useState("");
  const [accountTo, setAccountTo] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [currencies, setCurrencies] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
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
        const res = await fetch(API_ENDPOINTS.transferModal);
        if (!res.ok) throw new Error("Failed to load data");
        const data = await res.json();
        setCategories(data.categories);
        setCurrencies(data.currencies);
        setAccounts(data.accounts);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
    if (transaction) {
      setTitle(transaction.title || "");
      setAmount(transaction.amount ? String(transaction.amount) : "");
      setCurrencyId(transaction.currencyId ? String(transaction.currencyId) : "");
      setAccountFrom(transaction.accountFrom ? String(transaction.accountFrom) : "");
      setAccountTo(transaction.accountTo ? String(transaction.accountTo) : "");
      setCategoryId(transaction.categoryId ? String(transaction.categoryId) : "");
      setDescription(transaction.description || "");
      setDate(
        transaction.date ? transaction.date.split("T")[0] : new Date().toISOString().split("T")[0]
      );
    } else {
      setTitle("");
      setAmount("");
      setCurrencyId("");
      setAccountFrom("");
      setAccountTo("");
      setCategoryId("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, transaction]);

  const handleSubmit = async () => {
    if (!title || !amount || !currencyId || !accountFrom || !accountTo || !date) {
      alert("Please fill in all fields!");
      return;
    }

    if (accountFrom === accountTo) {
      alert("Sender and receiver accounts can't be the same!");
      return;
    }

    setLoading(true);
    setError(null);
    const payload = {
      title,
      amount: parseFloat(amount),
      accountFrom: parseInt(accountFrom),
      accountTo: parseInt(accountTo),
      currencyId: parseInt(currencyId),
      categoryId: parseInt(categoryId),
      date: new Date(date).toISOString(),
      description,
      id: transaction ? transaction.id : undefined,
    };

    if (!payload.categoryId) {
      alert("Please select a category!");
      return;
    }

    try {
      const response = await fetch(
        transaction ? API_ENDPOINTS.updateTransaction : API_ENDPOINTS.createTransfer,
        {
          method: transaction ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(
          transaction ? "Update failed" : "Creation failed"
        );
      }

      onSaved && onSaved();
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
        <h3>{transaction ? "Редагувати переказ" : "Створити переказ"}</h3>
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
          value={accountFrom}
          onChange={(e) => setAccountFrom(e.target.value)}
        >
          <option value="">Оберіть рахунок відправника</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.title}
            </option>
          ))}
        </select>

        <select
          value={accountTo}
          onChange={(e) => setAccountTo(e.target.value)}
        >
          <option value="">Оберіть рахунок одержувача</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.title}
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

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

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
              ? "Збереження..."
              : "Створення..."
            : transaction
            ? "Зберегти"
            : "Створити переказ"}
        </button>
        <button onClick={onClose} className={styles["close-button"]}>
          Скасувати
        </button>
      </div>
    </div>
  );
};

export default TransferModal;
