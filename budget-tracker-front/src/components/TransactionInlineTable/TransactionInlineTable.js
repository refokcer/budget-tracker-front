import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import API_ENDPOINTS from "../../config/apiConfig";
import { apiFetch, apiJson, getApiErrorMessage } from "../../services/apiClient";
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
  listEndpoint,
  detailEndpoint = API_ENDPOINTS.transactionById,
  updateEndpoint = API_ENDPOINTS.updateTransaction,
  deleteEndpoint = API_ENDPOINTS.deleteTransaction,
  entityName = "transaction",
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
        const url = listEndpoint
          ? listEndpoint(start, end)
          : API_ENDPOINTS.transactionsByFilter({ start, end, type });
        const data = await apiJson(url, {}, "Failed to load data");
        setTableRows(data.transactions);
      } catch (fetchError) {
        setError(getApiErrorMessage(fetchError));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    reloadRef.current = fetchData;
  }, [rows, start, end, type, listEndpoint]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const data = await apiJson(modalEndpoint, {}, "Failed to load editor data");
        setOptions({
          accounts: data.accounts || [],
          categories: data.categories || [],
          plans: data.plans || [],
          currencies: data.currencies || [],
        });
      } catch (fetchError) {
        setError((prev) => prev || getApiErrorMessage(fetchError));
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
      await apiFetch(deleteEndpoint(id), {
        method: "DELETE",
      }, "Delete error");
      setTableRows((prev) => prev.filter((item) => item.id !== id));
      onReload?.();
    } catch (deleteError) {
      alert(getApiErrorMessage(deleteError));
    } finally {
      setBusyId(null);
    }
  };

  const ensureItemDetails = async (id) => {
    if (detailsById[id]) return detailsById[id];

    const item = await apiJson(
      detailEndpoint(id),
      {},
      `Failed to load ${entityName}`
    );
    setDetailsById((prev) => ({ ...prev, [id]: item }));
    return item;
  };

  const startEditing = async (row, columnKey) => {
    if (savingCell || busyId === row.id) return;

    const config = editableColumns[columnKey];
    if (!config) return;

    try {
      const item = await ensureItemDetails(row.id);
      const rawValue = item[config.field];
      const nextValue =
        config.type === "date"
          ? formatDateForInput(rawValue)
          : rawValue === null || rawValue === undefined
            ? ""
            : String(rawValue);

      setDraftValue(nextValue);
      setEditingCell({ rowId: row.id, columnKey });
    } catch (loadError) {
      alert(getApiErrorMessage(loadError));
    }
  };

  const updateSummaryRow = (row, columnKey, value, item) => {
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
      updatedRow.date = item.date;
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

    const currentItem = detailsById[rowId];
    if (!currentItem) return;

    const normalizedValue = nextRawValue;
    const trimmedValue =
      typeof normalizedValue === "string" ? normalizedValue.trim() : normalizedValue;
    const previousValue =
      config.type === "date"
        ? formatDateForInput(currentItem[config.field])
        : currentItem[config.field] === null || currentItem[config.field] === undefined
          ? ""
          : String(currentItem[config.field]);

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

    const updatedItem = {
      ...currentItem,
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
      const validationError = config.validate(updatedItem);
      if (validationError) {
        alert(validationError);
        return;
      }
    }

    commitLockRef.current = true;
    setSavingCell(cell);

    try {
      await apiFetch(updateEndpoint, {
        method: "PUT",
        body: buildPayload(updatedItem),
      }, "Save failed");

      setDetailsById((prev) => ({ ...prev, [rowId]: updatedItem }));
      setTableRows((prev) =>
        prev.map((row) =>
          row.id === rowId
            ? updateSummaryRow(row, columnKey, normalizedValue, updatedItem)
            : row,
        ),
      );
      onReload?.();
      cancelEditing();
    } catch (saveError) {
      alert(getApiErrorMessage(saveError));
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
