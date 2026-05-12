import { useState, useEffect } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import { apiFetch, apiJson, getApiErrorMessage } from "../../../services/apiClient";
import styles from "./ManageAccounts.module.css";

const ACCOUNT_TYPES = [
  { value: 0, label: "Other" },
  { value: 1, label: "Cash" },
  { value: 2, label: "Checking" },
  { value: 3, label: "Savings" },
  { value: 4, label: "Credit card" },
  { value: 5, label: "Investment" },
  { value: 6, label: "Deposit" },
  { value: 7, label: "E-wallet" },
  { value: 8, label: "Loan" },
];

const getAccountTypeLabel = (type) => {
  const accountType = ACCOUNT_TYPES.find(
    (item) => item.value === Number(type) || item.label === type
  );
  return accountType?.label || "Other";
};

const ManageAccounts = ({ isOpen, onClose, onSaved }) => {
  const [accounts, setAccounts] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("0");
  const [descr, setDescr] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiJson(API_ENDPOINTS.manageAccounts, {}, "Failed to load accounts");
        setAccounts(Array.isArray(data.accounts) ? data.accounts : []);
      } catch (e) {
        setError(getApiErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen]);

  const addAccount = async () => {
    if (!title || !amount) return alert("Введіть назву та суму");
    try {
      setLoading(true);
      setError(null);
      const newAcc = await apiJson(API_ENDPOINTS.accounts, {
        method: "POST",
        body: {
          title,
          amount: +amount,
          currencyId: 1,
          type: Number(type),
          description: descr,
        },
      }, "Failed to create account");
      setAccounts((a) => [...a, newAcc]);
      setTitle("");
      setAmount("");
      setType("0");
      setDescr("");
      onSaved && onSaved();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Видалити акаунт?")) return;
    try {
      setBusyId(id);
      await apiFetch(API_ENDPOINTS.deleteAccount(id), {
        method: "DELETE",
      }, "Failed to delete account");
      setAccounts((a) => a.filter((x) => x.id !== id));
    } catch (e) {
      alert(getApiErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles["modal-overlay"]}>
      <div className={`${styles["modal-content"]} ${styles.large}`}>
        <h3>Manage accounts</h3>

        {error && <p className={styles.error}>{error}</p>}
        {loading && <p>Завантаження...</p>}

        {!loading && (
          <>
            <div className={styles["acc-table-wrapper"]}>
              <table className={styles["acc-table"]}>
                <thead>
                  <tr>
                    <th>Назва</th>
                    <th>Сума</th>
                    <th>Опис</th>
                    <th>Type</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a) => (
                    <tr key={a.id}>
                      <td>{a.title}</td>
                      <td>{a.amount.toFixed(2)}</td>
                      <td>{a.description || "-"}</td>
                      <td>{getAccountTypeLabel(a.type)}</td>
                      <td>
                        <button
                          className={styles["del-btn"]}
                          disabled={busyId === a.id}
                          onClick={() => del(a.id)}
                        >
                          {busyId === a.id ? "…" : "✕"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles["add-form"]}>
              <input
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
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {ACCOUNT_TYPES.map((accountType) => (
                  <option key={accountType.value} value={accountType.value}>
                    {accountType.label}
                  </option>
                ))}
              </select>
              <input
                placeholder="Опис"
                value={descr}
                onChange={(e) => setDescr(e.target.value)}
              />
              <button
                className={`${styles["submit-button"]} ${styles["submit-button-acc"]}`}
                onClick={addAccount}
              >
                Додати
              </button>
            </div>
          </>
        )}

        <button className={styles["close-button"]} onClick={onClose}>
          Закрити
        </button>
      </div>
    </div>
  );
};

export default ManageAccounts;
