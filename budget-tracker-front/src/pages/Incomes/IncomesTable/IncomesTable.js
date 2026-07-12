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
  accountToTitle: {
    field: "accountTo",
    type: "select",
    required: true,
    optionsKey: "accounts",
    getOptionLabel: (option) => option.title,
    summaryKey: "accountToTitle",
  },
  date: { field: "date", type: "date", required: true },
  description: { field: "description", type: "text" },
};

const tableColumns = [
  { key: "title", label: "Name", sortable: true },
  { key: "amount", label: "Amount", sortable: true },
  { key: "categoryTitle", label: "Category", sortable: true },
  { key: "accountToTitle", label: "Account", sortable: true },
  { key: "date", label: "Date", sortable: true },
  { key: "description", label: "Description" },
];

const buildPayload = (transaction) => ({
  id: transaction.id,
  title: transaction.title,
  amount: Number(transaction.amount),
  currencyId: Number(transaction.currencyId),
  categoryId: Number(transaction.categoryId),
  date: new Date(String(transaction.date).split("T")[0]).toISOString(),
  accountTo: Number(transaction.accountTo),
  description: transaction.description || "",
  type: 1,
});

const IncomesTable = ({ start, end }) => (
  <TransactionInlineTable
    type={1}
    start={start}
    end={end}
    modalEndpoint={API_ENDPOINTS.incomeModal}
    editableColumns={editableColumns}
    tableColumns={tableColumns}
    buildPayload={buildPayload}
  />
);

export default IncomesTable;
