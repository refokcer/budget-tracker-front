import { useState, useEffect } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import { apiFetch, apiJson, getApiErrorMessage } from "../../../services/apiClient";
import styles from "./EditTransferModal.module.css";

const EditTransferModal = ({ isOpen, onClose, transfer, onSaved }) => {
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
        const data = await apiJson(API_ENDPOINTS.transferModal, {}, "Failed to load data");
        setCategories(data.categories);
        setCurrencies(data.currencies);
        setAccounts(data.accounts);
      } catch (error) {
        setError(getApiErrorMessage(error));
      }
    };

    fetchData();
    if (transfer) {
      setTitle(transfer.title || "");
      setAmount(transfer.amount ? String(transfer.amount) : "");
      setCurrencyId(transfer.currencyId ? String(transfer.currencyId) : "");
      setAccountFrom(transfer.accountFrom ? String(transfer.accountFrom) : "");
      setAccountTo(transfer.accountTo ? String(transfer.accountTo) : "");
      setCategoryId(transfer.categoryId ? String(transfer.categoryId) : "");
      setDescription(transfer.description || "");
      setDate(
        transfer.date ? transfer.date.split("T")[0] : new Date().toISOString().split("T")[0]
      );
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, transfer]);

  const handleSubmit = async () => {
    if (!title || !amount || !currencyId || !accountFrom || !accountTo || !categoryId || !date) {
      alert("Please fill in all fields!");
      return;
    }

    if (accountFrom === accountTo) {
      alert("Sender and receiver accounts can't match!");
      return;
    }

    setLoading(true);
    setError(null);
    const payload = {
      id: transfer.id,
      title,
      amount: parseFloat(amount),
      accountFrom: parseInt(accountFrom),
      accountTo: parseInt(accountTo),
      currencyId: parseInt(currencyId),
      categoryId: parseInt(categoryId),
      date: new Date(date).toISOString(),
      description,
      type: 0,
    };

    try {
      await apiFetch(API_ENDPOINTS.updateTransfer, {
        method: "PUT",
        body: payload,
      }, "Update failed");

      onSaved && onSaved();
      onClose();
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <h3>Edit Transfer</h3>
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
              {c.symbol} ({c.name || c.title || c.code})
            </option>
          ))}
        </select>

        <select value={accountFrom} onChange={(e) => setAccountFrom(e.target.value)}>
          <option value="">Select sender account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.title}
            </option>
          ))}
        </select>

        <select value={accountTo} onChange={(e) => setAccountTo(e.target.value)}>
          <option value="">Select receiver account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.title}
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

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

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

export default EditTransferModal;

