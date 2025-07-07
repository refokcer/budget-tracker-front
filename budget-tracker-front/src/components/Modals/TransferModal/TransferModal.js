import { useState, useEffect } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import styles from "./TransferModal.module.css";

const TransferModal = ({ isOpen, onClose, transaction = null, onSaved }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [accountFrom, setAccountFrom] = useState("");
  const [accountTo, setAccountTo] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
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
        if (!res.ok) throw new Error("Помилка завантаження даних");
        const data = await res.json();
        setCategories(data.categories);
        setCurrencies(data.currencies);
        setAccounts(data.accounts);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();

    document.addEventListener("keydown", handleKeyDown);

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
      setAccountFrom(String(transaction.accountFrom || transaction.accountFromId || ""));
      setAccountTo(String(transaction.accountTo || transaction.accountToId || ""));
      setCategoryId(String(transaction.categoryId || ""));
      setDescription(transaction.description || "");
    } else {
      setTitle("");
      setAmount("");
      setCurrencyId("");
      setAccountFrom("");
      setAccountTo("");
      setCategoryId("");
      setDescription("");
    }
  }, [isOpen, transaction]);

  const handleSubmit = async () => {
    if (!title || !amount || !currencyId || !accountFrom || !accountTo) {
      alert("Заповніть всі поля!");
      return;
    }

    if (accountFrom === accountTo) {
      alert("Рахунок відправника та одержувача не можуть співпадати!");
      return;
    }

    setLoading(true);
    setError(null);
    const newTransfer = {
      title,
      amount: parseFloat(amount),
      accountFrom: parseInt(accountFrom),
      accountTo: parseInt(accountTo),
      currencyId: parseInt(currencyId),
      categoryId: parseInt(categoryId),
      date: transaction ? transaction.date : new Date().toISOString(),
      description,
    };

    if (!newTransfer.categoryId) {
      alert("Оберіть категорію!");
      return;
    }

    try {
      const response = await fetch(
        transaction ? API_ENDPOINTS.updateTransaction : API_ENDPOINTS.createTransfer,
        {
          method: transaction ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            transaction ? { ...newTransfer, id: transaction.id } : newTransfer
          ),
        }
      );

      if (!response.ok) {
        throw new Error("Помилка при створенні переказу");
      }

      if (onSaved) onSaved({ ...newTransfer, id: transaction ? transaction.id : undefined });
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
        <h3>{transaction ? 'Редагувати переказ' : 'Створити переказ'}</h3>
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
