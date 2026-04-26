import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import API_ENDPOINTS from "../../config/apiConfig";
import DataTable from "../DataTable/DataTable";
import styles from "./TransactionInlineTable.module.css";

const EMPTY_OPTIONS = {
  accounts: [],
  categories: [],
  plans: [],
  currencies: [],
};

const formatDateForInput = (value) => {
  if (!value) return "";
  return String(value).split("T")[0];
};

const formatDateForDisplay = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

const defaultDisplayValue = (row, key) => {
  if (key === "amount") {
    const amount = Number(row.amount ?? 0);
    return `${row.currencySymbol} ${amount.toFixed(2)}`;
  }

  if (key === "date") {
    return formatDateForDisplay(row.date);
  }

  if (key === "description") {
    return row.description || "-";
  }

  return row[key] || "-";
};

const InlineSelectEditor = ({
  cellKey,
  options,
  value,
  disabled,
  getOptionLabel,
  onSelect,
  onCancel,
}) => {
  const containerRef = useRef(null);
  const [openUpward, setOpenUpward] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        onCancel();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  useEffect(() => {
    const updateDirection = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const estimatedMenuHeight = Math.min(260, Math.max(options.length, 1) * 44) + 16;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const nextOpenUpward = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;

      setOpenUpward(nextOpenUpward);
      setMenuStyle({
        left: rect.left,
        width: Math.max(rect.width, 220),
        top: nextOpenUpward ? Math.max(8, rect.top - 6) : Math.min(window.innerHeight - 8, rect.bottom + 6),
      });
    };

    updateDirection();
    window.addEventListener("resize", updateDirection);
    window.addEventListener("scroll", updateDirection, true);

    return () => {
      window.removeEventListener("resize", updateDirection);
      window.removeEventListener("scroll", updateDirection, true);
    };
  }, [options.length]);

  const selectedOption = options.find((option) => String(option.id) === String(value));

  return (
    <div ref={containerRef} className={styles.selectEditor}>
      <button
        type="button"
        className={styles.selectTrigger}
        disabled={disabled}
        onClick={onCancel}
      >
        <span className={styles.selectTriggerLabel}>
          {selectedOption ? getOptionLabel(selectedOption) : "Select value"}
        </span>
        <span className={styles.selectTriggerIcon}>▾</span>
      </button>
      {menuStyle &&
        createPortal(
          <div
            className={`${styles.selectMenu} ${openUpward ? styles.selectMenuUpward : ""}`}
            style={menuStyle}
            role="listbox"
            aria-label={cellKey}
          >
            {options.map((option) => {
              const isActive = String(option.id) === String(value);

              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`${styles.selectOption} ${isActive ? styles.selectOptionActive : ""}`}
                  onClick={() => onSelect(String(option.id))}
                >
                  {getOptionLabel(option)}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
};

const TransactionInlineTable = ({
  type,
  rows,
  start,
  end,
  modalEndpoint,
  deleteConfirmText = "Delete transaction?",
  editableColumns,
  tableColumns,
  buildPayload,
  onReload,
}) => {
  const [tableRows, setTableRows] = useState(rows || []);
  const [loading, setLoading] = useState(rows ? false : true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [editingCell, setEditingCell] = useState(null);
  const [draftValue, setDraftValue] = useState("");
  const [detailsById, setDetailsById] = useState({});
  const [savingCell, setSavingCell] = useState(null);

  const reloadRef = useRef(() => {});
  const commitLockRef = useRef(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!rows) return;
    setTableRows(rows);
    setLoading(false);
  }, [rows]);

  useEffect(() => {
    if (rows) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = API_ENDPOINTS.transactionsByFilter({ start, end, type });
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load data");
        const data = await res.json();
        setTableRows(data.transactions);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    reloadRef.current = fetchData;
  }, [rows, start, end, type]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const res = await fetch(modalEndpoint);
        if (!res.ok) throw new Error("Failed to load editor data");
        const data = await res.json();
        setOptions({
          accounts: data.accounts || [],
          categories: data.categories || [],
          plans: data.plans || [],
          currencies: data.currencies || [],
        });
      } catch (fetchError) {
        setError((prev) => prev || fetchError.message);
      }
    };

    loadOptions();
  }, [modalEndpoint]);

  useEffect(() => {
    if (!editingCell || !editorRef.current) return;
    editorRef.current.focus();
  }, [editingCell]);

  const cancelEditing = () => {
    setEditingCell(null);
    setDraftValue("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm(deleteConfirmText)) return;

    try {
      setBusyId(id);
      const res = await fetch(API_ENDPOINTS.deleteTransaction(id), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete error");
      setTableRows((prev) => prev.filter((transaction) => transaction.id !== id));
      onReload?.();
    } catch (deleteError) {
      alert(deleteError.message);
    } finally {
      setBusyId(null);
    }
  };

  const ensureTransactionDetails = async (id) => {
    if (detailsById[id]) return detailsById[id];

    const res = await fetch(API_ENDPOINTS.transactionById(id));
    if (!res.ok) throw new Error("Failed to load transaction");

    const transaction = await res.json();
    setDetailsById((prev) => ({ ...prev, [id]: transaction }));
    return transaction;
  };

  const startEditing = async (row, columnKey) => {
    if (savingCell || busyId === row.id) return;

    const config = editableColumns[columnKey];
    if (!config) return;

    try {
      const transaction = await ensureTransactionDetails(row.id);
      const rawValue = transaction[config.field];
      const nextValue =
        config.type === "date"
          ? formatDateForInput(rawValue)
          : rawValue === null || rawValue === undefined
            ? ""
            : String(rawValue);

      setDraftValue(nextValue);
      setEditingCell({ rowId: row.id, columnKey });
    } catch (loadError) {
      alert(loadError.message);
    }
  };

  const updateSummaryRow = (row, columnKey, value, transaction) => {
    const updatedRow = { ...row };
    const config = editableColumns[columnKey];

    if (config.summaryKey) {
      const selectedOption = options[config.optionsKey].find(
        (option) => String(option.id) === String(value),
      );
      updatedRow[config.summaryKey] = selectedOption
        ? config.getOptionLabel(selectedOption)
        : "-";
    } else if (config.field === "date") {
      updatedRow.date = transaction.date;
    } else {
      updatedRow[config.field] = config.type === "number" ? Number(value) : value;
    }

    return updatedRow;
  };

  const commitEditing = async (cell = editingCell, nextRawValue = draftValue) => {
    if (!cell || commitLockRef.current) return;

    const { rowId, columnKey } = cell;
    const config = editableColumns[columnKey];
    if (!config) return;

    const currentTransaction = detailsById[rowId];
    if (!currentTransaction) return;

    const normalizedValue = nextRawValue;
    const trimmedValue =
      typeof normalizedValue === "string" ? normalizedValue.trim() : normalizedValue;
    const previousValue =
      config.type === "date"
        ? formatDateForInput(currentTransaction[config.field])
        : currentTransaction[config.field] === null || currentTransaction[config.field] === undefined
          ? ""
          : String(currentTransaction[config.field]);

    if (normalizedValue === previousValue) {
      cancelEditing();
      return;
    }

    if (config.required && !trimmedValue) {
      alert("Value is required");
      return;
    }

    if (config.type === "number" && trimmedValue !== "" && Number.isNaN(Number(normalizedValue))) {
      alert("Amount must be a valid number");
      return;
    }

    const updatedTransaction = {
      ...currentTransaction,
      [config.field]:
        config.type === "number"
          ? Number(normalizedValue)
          : config.type === "select"
            ? Number(normalizedValue)
            : config.type === "date"
              ? new Date(normalizedValue).toISOString()
              : normalizedValue,
    };

    if (typeof config.validate === "function") {
      const validationError = config.validate(updatedTransaction);
      if (validationError) {
        alert(validationError);
        return;
      }
    }

    commitLockRef.current = true;
    setSavingCell(cell);

    try {
      const res = await fetch(API_ENDPOINTS.updateTransaction, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(updatedTransaction)),
      });

      if (!res.ok) throw new Error(`Save failed with status ${res.status}`);

      setDetailsById((prev) => ({ ...prev, [rowId]: updatedTransaction }));
      setTableRows((prev) =>
        prev.map((row) =>
          row.id === rowId
            ? updateSummaryRow(row, columnKey, normalizedValue, updatedTransaction)
            : row,
        ),
      );
      onReload?.();
      cancelEditing();
    } catch (saveError) {
      alert(saveError.message);
    } finally {
      commitLockRef.current = false;
      setSavingCell(null);
    }
  };

  const renderEditableCell = (key, row) => {
    const config = editableColumns[key];
    const isEditing = editingCell?.rowId === row.id && editingCell?.columnKey === key;
    const isSaving = savingCell?.rowId === row.id && savingCell?.columnKey === key;

    if (!config) {
      return <span>{defaultDisplayValue(row, key)}</span>;
    }

    if (isEditing && config.type === "select") {
      return (
        <InlineSelectEditor
          cellKey={key}
          options={options[config.optionsKey]}
          value={draftValue}
          disabled={isSaving}
          getOptionLabel={config.getOptionLabel}
          onSelect={(value) => {
            setDraftValue(value);
            commitEditing({ rowId: row.id, columnKey: key }, value);
          }}
          onCancel={cancelEditing}
        />
      );
    }

    if (isEditing) {
      return (
        <div className={styles.inputEditor}>
          <input
            ref={editorRef}
            className={styles.inlineEditor}
            type={config.type}
            value={draftValue}
            disabled={isSaving}
            onChange={(event) => setDraftValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitEditing();
              }

              if (event.key === "Escape") {
                event.preventDefault();
                cancelEditing();
              }
            }}
            onBlur={() => commitEditing()}
          />
        </div>
      );
    }

    return (
      <button
        type="button"
        className={styles.inlineCell}
        disabled={Boolean(savingCell)}
        onClick={() => startEditing(row, key)}
      >
        <span className={styles.inlineCellValue}>
          {config.renderDisplay
            ? config.renderDisplay(row[config.summaryKey || config.field], row)
            : defaultDisplayValue(row, key)}
        </span>
      </button>
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  const columns = tableColumns.map((column) => ({
    ...column,
    render: (_, row) => renderEditableCell(column.key, row),
  }));

  return (
    <DataTable
      columns={columns}
      rows={tableRows}
      onDelete={handleDelete}
      deletingId={busyId}
    />
  );
};

export default TransactionInlineTable;
