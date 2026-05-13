import API_ENDPOINTS from "../../../config/apiConfig";
import TransactionInlineTable from "../../../components/TransactionInlineTable/TransactionInlineTable";

const TRANSFER_TYPE = 0;

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
    validate: (transfer) =>
      Number(transfer.accountFrom) === Number(transfer.accountTo)
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
    validate: (transfer) =>
      Number(transfer.accountFrom) === Number(transfer.accountTo)
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

const buildPayload = (transfer) => ({
  id: transfer.id,
  title: transfer.title,
  amount: Number(transfer.amount),
  accountFrom: Number(transfer.accountFrom),
  accountTo: Number(transfer.accountTo),
  currencyId: Number(transfer.currencyId),
  categoryId: Number(transfer.categoryId),
  date: new Date(String(transfer.date).split("T")[0]).toISOString(),
  description: transfer.description || "",
  type: TRANSFER_TYPE,
});

const TransfersTable = ({ start, end }) => (
  <TransactionInlineTable
    type={TRANSFER_TYPE}
    start={start}
    end={end}
    listEndpoint={API_ENDPOINTS.transfersByDate}
    detailEndpoint={API_ENDPOINTS.transferById}
    updateEndpoint={API_ENDPOINTS.updateTransfer}
    deleteEndpoint={API_ENDPOINTS.deleteTransfer}
    entityName="transfer"
    modalEndpoint={API_ENDPOINTS.transferModal}
    editableColumns={editableColumns}
    tableColumns={tableColumns}
    buildPayload={buildPayload}
    deleteConfirmText="Delete transfer?"
  />
);

export default TransfersTable;
