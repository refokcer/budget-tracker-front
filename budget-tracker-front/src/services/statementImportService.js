import API_ENDPOINTS from "../config/apiConfig";
import { parseAll, mapToPrepare } from "../utils/ukrsibParser";

const PDFJS_WORKER_URL =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.worker.mjs";

export const statementBanks = [
  { value: "ukrsib", label: "UkrSibBank", note: "PDF statement" },
  { value: "privat", label: "PrivatBank", note: "Not available yet" },
];

export const statementTransactionTypes = [
  { value: 2, label: "Expense" },
  { value: 1, label: "Income" },
  { value: 0, label: "Transfer" },
];

export const formatMoney = (value) =>
  Number(value || 0).toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const calculateImportSummary = (operations) =>
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
  );

export const loadStatementImportOptions = async () => {
  const res = await fetch(API_ENDPOINTS.expenseModal);
  if (!res.ok) throw new Error("Failed to load import options");

  const data = await res.json();
  return {
    categories: data.categories || [],
    accounts: data.accounts || [],
    plans: data.plans || [],
    currencies: data.currencies || [],
  };
};

export const prepareStatementFile = async (file) => {
  const fullText = await readPdfText(file);
  const { operations: parsed } = parseAll(fullText);

  if (parsed.length === 0) {
    return {
      operations: [],
      emptyReason: "This statement does not contain transactions.",
    };
  }

  const res = await fetch(API_ENDPOINTS.prepareTransactions, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.map(mapToPrepare)),
  });
  if (!res.ok) throw new Error("Failed to prepare statement data");

  const prepared = await res.json();
  if (!prepared.length) {
    return {
      operations: [],
      emptyReason: "All transactions from this statement already exist.",
    };
  }

  return {
    operations: prepared.map(toEditableOperation),
    emptyReason: null,
  };
};

export const saveStatementOperations = async (operations) => {
  for (const op of operations) {
    const res = await fetch(resolveCreateEndpoint(op.type), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toCreatePayload(op)),
    });

    if (!res.ok) {
      throw new Error(`Failed to save "${op.title}"`);
    }
  }
};

const readPdfText = async (file) => {
  const pdfjsLib = await import(
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.mjs"
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let fullText = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const txt = await page.getTextContent();
    fullText += txt.items.map((item) => item.str).join("\n") + "\n";
  }

  return fullText;
};

const toEditableOperation = (op, idx) => ({
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
});

const toCreatePayload = (op) => ({
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
});

const resolveCreateEndpoint = (type) => {
  if (String(type) === "1") return API_ENDPOINTS.createIncome;
  if (String(type) === "0") return API_ENDPOINTS.createTransfer;
  return API_ENDPOINTS.createExpense;
};
