import API_ENDPOINTS from "../../../config/apiConfig";
import TransactionInlineTable from "../../../components/TransactionInlineTable/TransactionInlineTable";

const editableColumns = {
  title: { field: "title", type: "text", required: true },
  amount: { field: "amount", type: "number", required: true },
  categoryTitle: {
    field: "categoryId",
    type: "select",
    required: true,
    optionsKey: "categories",
    getOptionLabel: (option) => option.title,
    summaryKey: "categoryTitle",
  },
  budetPlanTitle: {
    field: "budgetPlanId",
    type: "select",
    required: true,
    optionsKey: "plans",
    getOptionLabel: (option) => option.title,
    summaryKey: "budetPlanTitle",
  },
  accountFromTitle: {
    field: "accountFrom",
    type: "select",
    required: true,
    optionsKey: "accounts",
    getOptionLabel: (option) => option.title,
    summaryKey: "accountFromTitle",
  },
  date: { field: "date", type: "date", required: true },
  description: { field: "description", type: "text" },
};

const tableColumns = [
  { key: "title", label: "Назва", sortable: true },
  { key: "amount", label: "Сума", sortable: true },
  { key: "categoryTitle", label: "Категорія", sortable: true },
  { key: "budetPlanTitle", label: "План", sortable: true },
  { key: "accountFromTitle", label: "Рахунок", sortable: true },
  { key: "date", label: "Дата", sortable: true },
  { key: "description", label: "Опис" },
];

const buildPayload = (transaction) => ({
  id: transaction.id,
  title: transaction.title,
  amount: Number(transaction.amount),
  accountFrom: Number(transaction.accountFrom),
  budgetPlanId: Number(transaction.budgetPlanId),
  currencyId: Number(transaction.currencyId),
  categoryId: Number(transaction.categoryId),
  date: new Date(String(transaction.date).split("T")[0]).toISOString(),
  description: transaction.description || "",
  type: 2,
});

const ExpensesTable = ({ start, end }) => (
  <TransactionInlineTable
    type={2}
    start={start}
    end={end}
    modalEndpoint={API_ENDPOINTS.expenseModal}
    editableColumns={editableColumns}
    tableColumns={tableColumns}
    buildPayload={buildPayload}
  />
);

export default ExpensesTable;
