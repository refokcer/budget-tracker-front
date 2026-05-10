import { useEffect, useMemo, useState } from "react";
import DataTable from "../../DataTable/DataTable";
import styles from "./ImportStatementModal.module.css";
import {
  calculateImportSummary,
  formatMoney,
  loadStatementImportOptions,
  prepareStatementFile,
  saveStatementOperations,
  statementBanks,
  statementTransactionTypes,
} from "../../../services/statementImportService";

const ImportStatementModal = ({ isOpen, onClose }) => {
  const [bank, setBank] = useState("ukrsib");
  const [fileName, setFileName] = useState("");
  const [operations, setOperations] = useState([]);
  const [options, setOptions] = useState({
    categories: [],
    accounts: [],
    plans: [],
    currencies: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    setBank("ukrsib");
    setFileName("");
    setOperations([]);
    setError(null);
    setSuccess(null);

    (async () => {
      try {
        setOptions(await loadStatementImportOptions());
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [isOpen]);

  const summary = useMemo(() => calculateImportSummary(operations), [operations]);

  const handleFile = async (e) => {
    if (bank !== "ukrsib") {
      setError("Statement import currently supports only UkrSibBank.");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setOperations([]);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { operations: preparedOperations, emptyReason } =
        await prepareStatementFile(file);

      if (emptyReason) {
        setError(emptyReason);
        setOperations([]);
        return;
      }

      setOperations(preparedOperations);
      setSuccess(`${preparedOperations.length} transactions are ready for review.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (id, field, value) => {
    setOperations((ops) =>
      ops.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  };

  const removeRow = (id) => {
    setOperations((ops) => ops.filter((o) => o.id !== id));
  };

  const clearPrepared = () => {
    setOperations([]);
    setFileName("");
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (operations.length === 0) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await saveStatementOperations(operations);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (v, r) => (
        <input
          className={styles["table-input"]}
          value={r.title}
          onChange={(e) => updateRow(r.id, "title", e.target.value)}
        />
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (v, r) => (
        <input
          className={styles["table-input"]}
          type="number"
          value={r.amount}
          onChange={(e) => updateRow(r.id, "amount", e.target.value)}
        />
      ),
    },
    {
      key: "currencyId",
      label: "Currency",
      render: (v, r) => (
        <select
          className={styles["table-select"]}
          value={r.currencyId}
          onChange={(e) => updateRow(r.id, "currencyId", e.target.value)}
        >
          <option value="">-</option>
          {options.currencies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.symbol}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "categoryId",
      label: "Category",
      render: (v, r) => (
        <select
          className={styles["table-select"]}
          value={r.categoryId}
          onChange={(e) => updateRow(r.id, "categoryId", e.target.value)}
        >
          <option value="">-</option>
          {options.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "budgetPlanId",
      label: "Plan",
      render: (v, r) => (
        <select
          className={styles["table-select"]}
          value={r.budgetPlanId}
          onChange={(e) => updateRow(r.id, "budgetPlanId", e.target.value)}
        >
          <option value="">-</option>
          {options.plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "accountFrom",
      label: "From",
      render: (v, r) => (
        <select
          className={styles["table-select"]}
          value={r.accountFrom}
          onChange={(e) => updateRow(r.id, "accountFrom", e.target.value)}
        >
          <option value="">-</option>
          {options.accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "accountTo",
      label: "To",
      render: (v, r) => (
        <select
          className={styles["table-select"]}
          value={r.accountTo}
          onChange={(e) => updateRow(r.id, "accountTo", e.target.value)}
        >
          <option value="">-</option>
          {options.accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (v, r) => (
        <input
          className={styles["table-input"]}
          type="date"
          value={r.date}
          onChange={(e) => updateRow(r.id, "date", e.target.value)}
        />
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (v, r) => (
        <input
          className={styles["table-input"]}
          value={r.description}
          onChange={(e) => updateRow(r.id, "description", e.target.value)}
        />
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (v, r) => (
        <select
          className={styles["table-select"]}
          value={r.type}
          onChange={(e) => updateRow(r.id, "type", e.target.value)}
        >
          {statementTransactionTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className={styles["modal-overlay"]}>
      <div className={`${styles["modal-content"]} ${styles.large}`}>
        <div className={styles["modal-header"]}>
          <div>
            <p className={styles.eyebrow}>Statement import</p>
            <h3>Review bank transactions</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles["icon-close"]}
            aria-label="Close import statement"
          >
            X
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <div className={styles["import-grid"]}>
          <section className={styles["setup-panel"]}>
            <label className={styles["field-label"]}>
              <span>Bank</span>
              <select
                value={bank}
                onChange={(e) => {
                  setBank(e.target.value);
                  setError(null);
                  setSuccess(null);
                }}
                className={styles["bank-select"]}
              >
                {statementBanks.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles["bank-hint"]}>
              {statementBanks.find((item) => item.value === bank)?.note}
            </div>

            <label
              className={`${styles["file-drop"]} ${
                bank !== "ukrsib" ? styles["file-drop-disabled"] : ""
              }`}
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFile}
                disabled={bank !== "ukrsib" || loading}
              />
              <span className={styles["file-title"]}>
                {fileName || "Choose PDF statement"}
              </span>
              <span className={styles["file-subtitle"]}>
                {bank === "ukrsib"
                  ? "The file will be parsed and prepared for review before saving."
                  : "This bank parser is not available yet."}
              </span>
            </label>
          </section>

          <section className={styles["summary-panel"]}>
            <div className={styles["summary-card"]}>
              <span>Ready</span>
              <strong>{summary.count}</strong>
            </div>
            <div className={styles["summary-card"]}>
              <span>Expenses</span>
              <strong>{summary.expenses}</strong>
              <small>{formatMoney(summary.expenseAmount)}</small>
            </div>
            <div className={styles["summary-card"]}>
              <span>Income</span>
              <strong>{summary.incomes}</strong>
              <small>{formatMoney(summary.incomeAmount)}</small>
            </div>
            <div className={styles["summary-card"]}>
              <span>Transfers</span>
              <strong>{summary.transfers}</strong>
              <small>{formatMoney(summary.transferAmount)}</small>
            </div>
          </section>
        </div>

        {loading && (
          <div className={styles["loading-row"]}>
            <span className={styles.spinner} />
            <span>Processing statement...</span>
          </div>
        )}

        {operations.length > 0 && (
          <div className={styles["review-section"]}>
            <div className={styles["review-header"]}>
              <h4>Prepared transactions</h4>
              <span>Edit rows before saving. Remove anything you do not want to import.</span>
            </div>
            <DataTable
              columns={columns}
              rows={operations}
              onDelete={removeRow}
              tableClassName={styles["import-table"]}
            />
          </div>
        )}

        <div className={styles["modal-actions"]}>
          <button onClick={onClose} className={styles["secondary-button"]}>
            Close
          </button>
          <button
            onClick={clearPrepared}
            disabled={loading || operations.length === 0}
            className={styles["secondary-button"]}
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={loading || operations.length === 0}
            className={styles["submit-button"]}
          >
            Import {operations.length || ""} transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportStatementModal;
