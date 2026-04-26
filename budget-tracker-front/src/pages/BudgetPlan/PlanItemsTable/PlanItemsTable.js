import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DataTable from "../../../components/DataTable/DataTable";
import API_ENDPOINTS from "../../../config/apiConfig";
import editorStyles from "../../../components/TransactionInlineTable/TransactionInlineTable.module.css";
import pageStyles from "../BudgetPlanPage/BudgetPlanPage.module.css";

const editableColumns = {
  categoryTitle: {
    field: "categoryId",
    type: "select",
    required: true,
    optionsKey: "categories",
    getOptionLabel: (option) => option.title,
    summaryKey: "categoryTitle",
  },
  amount: {
    field: "amount",
    type: "number",
    required: true,
    renderDisplay: (row) =>
      row.amount === "-" ? "-" : `${row.currencySymbol}${row.amount}`,
  },
  description: {
    field: "description",
    type: "text",
    renderDisplay: (row) => row.description || "—",
  },
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
    <div ref={containerRef} className={editorStyles.selectEditor}>
      <button
        type="button"
        className={editorStyles.selectTrigger}
        disabled={disabled}
        onClick={onCancel}
      >
        <span className={editorStyles.selectTriggerLabel}>
          {selectedOption ? getOptionLabel(selectedOption) : "Select value"}
        </span>
        <span className={editorStyles.selectTriggerIcon}>▾</span>
      </button>
      {menuStyle &&
        createPortal(
          <div
            className={`${editorStyles.selectMenu} ${openUpward ? editorStyles.selectMenuUpward : ""}`}
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
                  className={`${editorStyles.selectOption} ${isActive ? editorStyles.selectOptionActive : ""}`}
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

const PlanItemsTable = ({ items, onReload }) => {
  const [rows, setRows] = useState(items || []);
  const [options, setOptions] = useState({ categories: [], currencies: [] });
  const [editingCell, setEditingCell] = useState(null);
  const [draftValue, setDraftValue] = useState("");
  const [savingCell, setSavingCell] = useState(null);

  const editorRef = useRef(null);
  const commitLockRef = useRef(false);

  useEffect(() => {
    setRows(items || []);
  }, [items]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.editPlanModal);
        if (!res.ok) throw new Error("Failed to load editor data");
        const data = await res.json();
        setOptions({
          categories: data.categories || [],
          currencies: data.currencies || [],
        });
      } catch (error) {
        console.error(error);
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    if (!editingCell || !editorRef.current) return;
    editorRef.current.focus();
  }, [editingCell]);

  if (!items || items.length === 0) return <p>Нет позиций в этом плане.</p>;

  const cancelEditing = () => {
    setEditingCell(null);
    setDraftValue("");
  };

  const getAvailableCategories = (rowId) => {
    const usedCategoryIds = new Set(
      rows
        .filter((item) => item.id !== rowId)
        .map(
          (item) =>
            item.categoryId ??
            options.categories.find((category) => category.title === item.categoryTitle)?.id,
        )
        .filter(Boolean)
        .map(String),
    );

    return options.categories.filter((category) => !usedCategoryIds.has(String(category.id)));
  };

  const buildPayload = (row, value, columnKey) => {
    const categoryId =
      columnKey === "categoryTitle"
        ? Number(value)
        : Number(
            row.categoryId ??
              options.categories.find((category) => category.title === row.categoryTitle)?.id,
          );

    const currencyId = Number(
      row.currencyId ??
        options.currencies.find((currency) => currency.symbol === row.currencySymbol)?.id,
    );

    return {
      id: row.id,
      budgetPlanId: row.budgetPlanId,
      categoryId,
      amount: columnKey === "amount" ? Number(value) : Number(row.amount),
      currencyId,
      description: columnKey === "description" ? value : row.description || "",
    };
  };

  const commitEditing = async (cell = editingCell, nextRawValue = draftValue) => {
    if (!cell || commitLockRef.current) return;

    const { rowId, columnKey } = cell;
    const row = rows.find((item) => item.id === rowId);
    if (!row) return;

    const config = editableColumns[columnKey];
    const normalizedValue = nextRawValue;
    const trimmedValue =
      typeof normalizedValue === "string" ? normalizedValue.trim() : normalizedValue;
    const previousValue =
      row[config.summaryKey || config.field] === null || row[config.summaryKey || config.field] === undefined
        ? ""
        : String(row[config.summaryKey || config.field]);

    if (columnKey === "categoryTitle") {
      const previousCategoryId = String(
        row.categoryId ??
          options.categories.find((category) => category.title === row.categoryTitle)?.id ??
          "",
      );
      if (normalizedValue === previousCategoryId) {
        cancelEditing();
        return;
      }
    } else if (normalizedValue === previousValue) {
      cancelEditing();
      return;
    }

    if (config.required && !trimmedValue) {
      alert("Value is required");
      return;
    }

    if (columnKey === "amount" && Number.isNaN(Number(normalizedValue))) {
      alert("Amount must be a valid number");
      return;
    }

    const payload = buildPayload(row, normalizedValue, columnKey);

    if (!payload.categoryId || !payload.currencyId || Number.isNaN(payload.amount)) {
      alert("Failed to prepare budget plan item for saving");
      return;
    }

    commitLockRef.current = true;
    setSavingCell(cell);

    try {
      const res = await fetch(API_ENDPOINTS.updateBudgetPlanItem, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Save failed with status ${res.status}`);

      setRows((prev) =>
        prev.map((item) => {
          if (item.id !== rowId) return item;

          if (columnKey === "categoryTitle") {
            const selectedCategory = options.categories.find(
              (category) => String(category.id) === String(normalizedValue),
            );
            return {
              ...item,
              categoryId: Number(normalizedValue),
              categoryTitle: selectedCategory ? selectedCategory.title : item.categoryTitle,
            };
          }

          if (columnKey === "amount") {
            return { ...item, amount: Number(normalizedValue) };
          }

          return { ...item, description: normalizedValue };
        }),
      );
      onReload?.();
      cancelEditing();
    } catch (error) {
      alert(error.message);
    } finally {
      commitLockRef.current = false;
      setSavingCell(null);
    }
  };

  const startEditing = (row, columnKey) => {
    const config = editableColumns[columnKey];
    if (!config || savingCell) return;

    if (columnKey === "categoryTitle") {
      const categoryId =
        row.categoryId ??
        options.categories.find((category) => category.title === row.categoryTitle)?.id ??
        "";
      setDraftValue(String(categoryId));
    } else if (columnKey === "description") {
      setDraftValue(row.description || "");
    } else {
      setDraftValue(String(row.amount ?? ""));
    }

    setEditingCell({ rowId: row.id, columnKey });
  };

  const renderEditableCell = (key, row) => {
    const config = editableColumns[key];
    const isEditing = editingCell?.rowId === row.id && editingCell?.columnKey === key;
    const isSaving = savingCell?.rowId === row.id && savingCell?.columnKey === key;

    if (!config) {
      if (key === "spent" || key === "remaining") {
        return row[key] === "-" ? "-" : `${row.currencySymbol}${row[key]}`;
      }
      return row[key];
    }

    if (isEditing && config.type === "select") {
      return (
        <InlineSelectEditor
          cellKey={key}
          options={getAvailableCategories(row.id)}
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
        <div className={editorStyles.inputEditor}>
          <input
            ref={editorRef}
            className={editorStyles.inlineEditor}
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
        className={editorStyles.inlineCell}
        disabled={Boolean(savingCell)}
        onClick={() => startEditing(row, key)}
      >
        <span className={editorStyles.inlineCellValue}>
          {config.renderDisplay ? config.renderDisplay(row) : row[config.summaryKey || config.field]}
        </span>
      </button>
    );
  };

  const columns = [
    {
      key: "categoryTitle",
      label: "Категория",
      render: (_, row) => renderEditableCell("categoryTitle", row),
    },
    {
      key: "amount",
      label: "Выделено",
      render: (_, row) => renderEditableCell("amount", row),
    },
    {
      key: "spent",
      label: "Потрачено",
      render: (_, row) => renderEditableCell("spent", row),
    },
    {
      key: "remaining",
      label: "Осталось",
      render: (_, row) => renderEditableCell("remaining", row),
    },
    {
      key: "description",
      label: "Описание",
      render: (_, row) => renderEditableCell("description", row),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      tableClassName={pageStyles["plan-items-data-table"]}
    />
  );
};

export default PlanItemsTable;
