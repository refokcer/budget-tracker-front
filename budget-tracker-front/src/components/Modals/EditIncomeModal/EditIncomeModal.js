import { useState, useEffect } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import styles from "./EditIncomeModal.module.css";

const EditIncomeModal = ({ isOpen, onClose, transaction, onSaved }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountTo, setAccountTo] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
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
        if (!res.ok) throw new Error("\u041F\u043E\u043C\u0438\u043B\u043A\u0430 \u0437\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F \u0434\u0430\u043D\u0438\u0445");
        const data = await res.json();
        setCurrencies(data.currencies);
        setCategories(data.categories);
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
      setCategoryId(transaction.categoryId ? String(transaction.categoryId) : "");
      setAccountTo(transaction.accountTo ? String(transaction.accountTo) : "");
      setDescription(transaction.description || "");
      setDate(transaction.date || "");
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, transaction]);

  const handleSubmit = async () => {
    if (!title || !amount || !currencyId || !categoryId || !accountTo) {
      alert("\u0417\u0430\u043F\u043E\u0432\u043D\u0456\u0442\u044C \u0432\u0441\u0456 \u043F\u043E\u043B\u044F!");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      id: transaction.id,
      title,
      amount: parseFloat(amount),
      currencyId: parseInt(currencyId),
      categoryId: parseInt(categoryId),
      date,
      accountTo: parseInt(accountTo),
      description,
      type: 1,
    };

    try {
      const response = await fetch(API_ENDPOINTS.updateTransaction, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("\u041F\u043E\u043C\u0438\u043B\u043A\u0430 \u043F\u0440\u0438 \u043E\u043D\u043E\u0432\u043B\u0435\u043D\u043D\u0456");
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
        <h3>\u0420\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u0442\u0438 \u0434\u043E\u0445\u0456\u0434</h3>
        {error && <p className={styles.error}>{error}</p>}

        <input
          type="text"
          placeholder="\u041D\u0430\u0437\u0432\u0430"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="\u0421\u0443\u043C\u0430"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select value={currencyId} onChange={(e) => setCurrencyId(e.target.value)}>
          <option value="">\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u0432\u0430\u043B\u044E\u0442\u0443</option>
          {currencies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.symbol} ({c.name})
            </option>
          ))}
        </select>

        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044E</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>

        <select value={accountTo} onChange={(e) => setAccountTo(e.target.value)}>
          <option value="">\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u0440\u0430\u0445\u0443\u043D\u043E\u043A</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.title}
            </option>
          ))}
        </select>

        <textarea
          placeholder="\u041E\u043F\u0438\u0441"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button onClick={handleSubmit} disabled={loading} className={styles["submit-button"]}>
          {loading ? "\u0417\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u043D\u044F..." : "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438"}
        </button>
        <button onClick={onClose} className={styles["close-button"]}>
          \u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438
        </button>
      </div>
    </div>
  );
};

export default EditIncomeModal;
