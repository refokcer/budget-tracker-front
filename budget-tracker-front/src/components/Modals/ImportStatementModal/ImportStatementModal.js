import { useEffect, useMemo, useState } from "react";
import DataTable from "../../DataTable/DataTable";
import API_ENDPOINTS from "../../../config/apiConfig";
import styles from "./ImportStatementModal.module.css";
import { parseAll, mapToPrepare } from "../../../utils/ukrsibParser";

const banks = [
  { value: "ukrsib", label: "UkrSibBank", note: "PDF statement" },
  { value: "privat", label: "PrivatBank", note: "Not available yet" },
];

const typeOptions = [
  { value: 2, label: "Expense" },
  { value: 1, label: "Income" },
  { value: 0, label: "Transfer" },
];

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
        const res = await fetch(API_ENDPOINTS.expenseModal);
        if (!res.ok) throw new Error("Failed to load import options");
        const data = await res.json();
        setOptions({
          categories: data.categories || [],
          accounts: data.accounts || [],
          plans: data.plans || [],
          currencies: data.currencies || [],
        });
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [isOpen]);

  const summary = useMemo(
    () =>
      operations.reduce(
        (acc, op) => {
          const amount = Number(op.amount || 0);
          acc.count += 1;

          if (String(op.type) === "2") {
            acc.expenses += 1;
            acc.expenseAmount += amount;
          } else if (String(op.type) === "1") {
            acc.incomes += 1;
            acc.incomeAmount += amount;
          } else {
            acc.transfers += 1;
            acc.transferAmount += amount;
          }

          return acc;
        },
        {
          count: 0,
          expenses: 0,
          incomes: 0,
          transfers: 0,
          expenseAmount: 0,
          incomeAmount: 0,
          transferAmount: 0,
        }
      ),
    [operations]
  );

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
      const pdfjsLib = await import(
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.mjs"
      );
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.worker.mjs";

      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

      let fullText = "";
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const txt = await page.getTextContent();
        fullText += txt.items.map((i) => i.str).join("\n") + "\n";
      }

      const { operations: parsed } = parseAll(fullText);
      if (parsed.length === 0) {
        setError("This statement does not contain transactions.");
        return;
      }

      const prepareModels = parsed.map(mapToPrepare);
      const res = await fetch(API_ENDPOINTS.prepareTransactions, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prepareModels),
      });
      if (!res.ok) throw new Error("Failed to prepare statement data");

      const prepared = await res.json();
      if (!prepared.length) {
        setError("All transactions from this statement already exist.");
        setOperations([]);
        return;
      }

      const ops = prepared.map((op, idx) => ({
        id: idx + 1,
        title: op.title,
        amount: op.amount,
        currencyId: op.currencyId ? String(op.currencyId) : "",
        categoryId: op.categoryId ? String(op.categoryId) : "",
        budgetPlanId: op.budgetPlanId ? String(op.budgetPlanId) : "",
        accountFrom: op.accountFrom ? String(op.accountFrom) : "",
        accountTo: op.accountTo ? String(op.accountTo) : "",
        authCode: op.authCode || "",
        date: op.date ? op.date.split("T")[0] : "",
        description: op.description || "",
        type: String(op.type),
      }));

      setOperations(ops);
      setSuccess(`${ops.length} transactions are ready for review.`);
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
      for (const op of operations) {
        const payload = {
          title: op.title,
          amount: parseFloat(op.amount),
          currencyId: parseInt(op.currencyId),
          categoryId: op.categoryId ? parseInt(op.categoryId) : undefined,
          accountFrom: op.accountFrom ? parseInt(op.accountFrom) : undefined,
          accountTo: op.accountTo ? parseInt(op.accountTo) : undefined,
          budgetPlanId: op.budgetPlanId ? parseInt(op.budgetPlanId) : undefined,
          description: op.description,
          date: new Date(op.date).toISOString(),
          authCode: op.authCode || "",
        };

        let url = API_ENDPOINTS.createExpense;
        if (String(op.type) === "1") url = API_ENDPOINTS.createIncome;
        if (String(op.type) === "0") url = API_ENDPOINTS.createTransfer;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Failed to save "${op.title}"`);
        }
      }

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
          {typeOptions.map((t) => (
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
                {banks.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles["bank-hint"]}>
              {banks.find((item) => item.value === bank)?.note}
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
