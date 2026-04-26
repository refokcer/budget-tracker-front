import API_ENDPOINTS from "../../../config/apiConfig";
import TransactionInlineTable from "../../../components/TransactionInlineTable/TransactionInlineTable";

const editableColumns = {
  title: { field: "title", type: "text", required: true },
  amount: { field: "amount", type: "number", required: true },
  accountFromTitle: {
    field: "accountFrom",
    type: "select",
    required: true,
    optionsKey: "accounts",
    getOptionLabel: (option) => option.title,
    summaryKey: "accountFromTitle",
    validate: (transaction) =>
      Number(transaction.accountFrom) === Number(transaction.accountTo)
        ? "Sender and receiver accounts can't match!"
        : null,
  },
  accountToTitle: {
    field: "accountTo",
    type: "select",
    required: true,
    optionsKey: "accounts",
    getOptionLabel: (option) => option.title,
    summaryKey: "accountToTitle",
    validate: (transaction) =>
      Number(transaction.accountFrom) === Number(transaction.accountTo)
        ? "Sender and receiver accounts can't match!"
        : null,
  },
  date: { field: "date", type: "date", required: true },
  description: { field: "description", type: "text" },
};

const tableColumns = [
  { key: "title", label: "Назва", sortable: true },
  { key: "amount", label: "Сума", sortable: true },
  { key: "accountFromTitle", label: "З рахунку", sortable: true },
  { key: "accountToTitle", label: "На рахунок", sortable: true },
  { key: "date", label: "Дата", sortable: true },
  { key: "description", label: "Опис" },
];

const buildPayload = (transaction) => ({
  id: transaction.id,
  title: transaction.title,
  amount: Number(transaction.amount),
  accountFrom: Number(transaction.accountFrom),
  accountTo: Number(transaction.accountTo),
  currencyId: Number(transaction.currencyId),
  categoryId: Number(transaction.categoryId),
  date: new Date(String(transaction.date).split("T")[0]).toISOString(),
  description: transaction.description || "",
  type: 0,
});

const TransfersTable = ({ start, end }) => (
  <TransactionInlineTable
    type={0}
    start={start}
    end={end}
    modalEndpoint={API_ENDPOINTS.transferModal}
    editableColumns={editableColumns}
    tableColumns={tableColumns}
    buildPayload={buildPayload}
    deleteConfirmText="Delete?"
  />
);

export default TransfersTable;
