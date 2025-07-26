import { useState, useEffect } from "react";
import DataTable from "../../DataTable/DataTable";
import API_ENDPOINTS from "../../../config/apiConfig";
import styles from "./ImportStatementModal.module.css";

const banks = [
  { value: "privat", label: "PrivatBank" },
  { value: "ukrsib", label: "UkrSibBank" },
];

const typeOptions = [
  { value: 2, label: "Расход" },
  { value: 1, label: "Доход" },
  { value: 0, label: "Перевод" },
];

const normalize = (text) =>
  text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const dateRe = /^\d{2}\.\d{2}\.\d{4}$/;
const currencyRe =
  /^(UAH|USD|EUR|PLN|GBP|CHF|CAD|AUD|JPY|CZK|HUF|NOK|SEK|DKK|RON|TRY|RUB)$/i;
const amountRe = /^-?\d{1,3}(?:[\s\u202f]\d{3})*(?:[.,]\d+)?$/;

const cleanAmount = (s) =>
  Math.abs(parseFloat(String(s).replace(/\s/g, "").replace(",", ".")));

function cleanName(raw) {
  return raw
    .replace(/^[\s\d]+/, "")
    .replace(/^[№#]?\d+\s+/, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\\+/g, " \\ ")
    .trim();
}

function firstNonDigitWord(str) {
  const tokens = str.split(/[\s\\/]+/).filter(Boolean);
  return tokens.find((t) => /\D/.test(t)) || "";
}

function typeFromWord(word) {
  const w = word.toLowerCase();
  if (w === "переказ") return 0;
  if (w === "зарахування") return 1;
  if (w === "комісія" || w === "оплата") return 2;
  return 2;
}

function parseAll(lines) {
  const res = [];
  let i = 0;

  while (i < lines.length) {
    if (!dateRe.test(lines[i])) {
      i++;
      continue;
    }

    const date = lines[i];
    let k = i + 1;
    if (k < lines.length && dateRe.test(lines[k])) k++;

    const descParts = [];
    while (k < lines.length && !currencyRe.test(lines[k])) {
      if (
        /^(Операції|Поточні блокування|Виписка|Дані по рахунку)/i.test(lines[k])
      )
        break;
      descParts.push(lines[k]);
      k++;
    }

    if (k >= lines.length || !currencyRe.test(lines[k])) {
      i++;
      continue;
    }

    const currency = lines[k];
    const amountLine = lines[k + 1];

    if (!amountLine || !amountRe.test(amountLine)) {
      i++;
      continue;
    }

    const amount = cleanAmount(amountLine);
    const rawName = descParts.join(" ");
    const name = cleanName(rawName);
    const type = firstNonDigitWord(name);

    res.push({ date, name, currency, amount, type });

    i = k + 2;
  }
  return res;
}

const ImportStatementModal = ({ isOpen, onClose }) => {
  const [bank, setBank] = useState("");
  const [operations, setOperations] = useState([]);
  const [options, setOptions] = useState({
    categories: [],
    accounts: [],
    plans: [],
    currencies: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setBank("");
    setOperations([]);
    setError(null);
    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.expenseModal);
        if (!res.ok) throw new Error("Failed to load data");
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

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
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

      const lines = normalize(fullText);
      const ops = parseAll(lines).map((op, idx) => {
        const t = typeFromWord(op.type);
        const cleanTitle = op.name.replace(new RegExp(`^${op.type}\s*`, "i"), "").trim();
        return {
          id: idx + 1,
          title: cleanTitle,
          amount: op.amount,
          currency: op.currency,
          currencyId:
            options.currencies.find((c) => c.symbol === op.currency)?.id || "",
          categoryId: "",
          budgetPlanId: "",
          accountId: "",
          date: op.date.split(".").reverse().join("-"),
          description: op.name,
          type: t,
        };
      });
      setOperations(ops);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (id, field, value) => {
    setOperations((ops) =>
      ops.map((o) => (o.id === id ? { ...o, [field]: value } : o)),
    );
  };

  const removeRow = (id) => {
    setOperations((ops) => ops.filter((o) => o.id !== id));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      for (const op of operations) {
        const payload = {
          title: op.title,
          amount: parseFloat(op.amount),
          currencyId: parseInt(op.currencyId),
          categoryId: op.categoryId ? parseInt(op.categoryId) : undefined,
          accountFrom: parseInt(op.accountId || 0),
          budgetPlanId: op.budgetPlanId ? parseInt(op.budgetPlanId) : undefined,
          description: op.description,
          date: new Date(op.date).toISOString(),
        };
        let url = API_ENDPOINTS.createExpense;
        if (String(op.type) === "1") url = API_ENDPOINTS.createIncome;
        if (String(op.type) === "0") url = API_ENDPOINTS.createTransfer;
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
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
      label: "Название",
      render: (v, r) => (
        <input
          value={r.title}
          onChange={(e) => updateRow(r.id, "title", e.target.value)}
        />
      ),
    },
    {
      key: "amount",
      label: "Сумма",
      render: (v, r) => (
        <input
          type="number"
          value={r.amount}
          onChange={(e) => updateRow(r.id, "amount", e.target.value)}
        />
      ),
    },
    {
      key: "currencyId",
      label: "Валюта",
      render: (v, r) => (
        <select
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
      label: "Категория",
      render: (v, r) => (
        <select
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
      label: "План",
      render: (v, r) => (
        <select
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
      key: "accountId",
      label: "Рахунок",
      render: (v, r) => (
        <select
          value={r.accountId}
          onChange={(e) => updateRow(r.id, "accountId", e.target.value)}
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
      label: "Дата",
      render: (v, r) => (
        <input
          type="date"
          value={r.date}
          onChange={(e) => updateRow(r.id, "date", e.target.value)}
        />
      ),
    },
    {
      key: "description",
      label: "Описание",
      render: (v, r) => (
        <input
          value={r.description}
          onChange={(e) => updateRow(r.id, "description", e.target.value)}
        />
      ),
    },
    {
      key: "type",
      label: "Тип",
      render: (v, r) => (
        <select
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
        <h3>Import statement</h3>
        {error && <p className={styles.error}>{error}</p>}
        <label>Банк:</label>
        <select
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          className={styles["bank-select"]}
        >
          <option value="">Выберите банк</option>
          {banks.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
        {bank === "ukrsib" && (
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFile}
            className={styles["file-input"]}
          />
        )}
        {loading && <p>Loading...</p>}
        {operations.length > 0 && (
          <DataTable columns={columns} rows={operations} onDelete={removeRow} />
        )}
        {operations.length > 0 && (
          <button
            onClick={handleSave}
            disabled={loading}
            className={styles["submit-button"]}
          >
            Сохранить
          </button>
        )}
        <button onClick={onClose} className={styles["close-button"]}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default ImportStatementModal;
