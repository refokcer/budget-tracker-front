import React, { useState, useEffect } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import styles from "./EditPlanModal.module.css";

const EditPlanModal = ({ isOpen, onClose, plan, items, onSaved }) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("0");
  const [description, setDesc] = useState("");
  const [rows, setRows] = useState([]);
  const [allCats, setAllCats] = useState([]);
  const [allCur, setAllCur] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !plan) return;
    setTitle(plan.title);
    setStartDate(plan.startDate.substring(0, 10));
    setEndDate(plan.endDate.substring(0, 10));
    setType(String(plan.type));
    setDesc(plan.description || "");
    // Ensure that row objects contain direct references to categoryId and
    // currencyId so the corresponding selects show correct values when the
    // modal opens. Some API responses may omit these fields or use different
    // casing, therefore fallback checks are added.
    setRows(
      items.map((i) => ({
        id: i.id,
        budgetPlanId: i.budgetPlanId,
        categoryId: i.categoryId ?? i.categoryID ?? i.category?.id ?? "",
        amount: i.amount,
        currencyId: i.currencyId ?? i.currencyID ?? i.currency?.id ?? "",
        description: i.description ?? "",
        _status: "old",
      }))
    );
    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.editPlanModal);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setAllCats(data.categories);
        setAllCur(data.currencies);
      } catch {}
    })();
  }, [isOpen, plan, items]);

  if (!isOpen) return null;

  const addRow = () =>
    setRows([
      ...rows,
      {
        id: Date.now(),
        budgetPlanId: plan.id,
        categoryId: "",
        amount: "",
        currencyId: "",
        description: "",
        _status: "new",
      },
    ]);

  const updateRow = (idx, field, val) => {
    const updated = [...rows];
    updated[idx] = {
      ...updated[idx],
      [field]: val,
      _status: updated[idx]._status || "new",
    };
    setRows(updated);
  };

  const deleteRow = (idx) => {
    const updated = [...rows];
    updated[idx]._status = updated[idx]._status === "new" ? "skip" : "delete";
    setRows(updated);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await fetch(API_ENDPOINTS.updateBudgetPlan, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: plan.id,
          title,
          startDate,
          endDate,
          type: Number(type),
          description,
        }),
      });
      for (const row of rows) {
        if (row._status === "skip") continue;
        const payload = {
          budgetPlanId: plan.id,
          categoryId: Number(row.categoryId),
          amount: Number(row.amount),
          currencyId: Number(row.currencyId),
          description: row.description,
        };
        if (row._status === "new") {
          await fetch(API_ENDPOINTS.createBudgetPlanItem, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else if (row._status === "delete") {
          await fetch(API_ENDPOINTS.deleteBudgetPlanItem(row.id), {
            method: "DELETE",
          });
        } else {
          await fetch(API_ENDPOINTS.updateBudgetPlanItem, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, id: row.id }),
          });
        }
      }
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["modal-overlay"]}>
      <div className={`${styles["modal-content"]} ${styles.large}`}>
        <h3>Редагувати план</h3>
        {error && <p className={styles.error}>{error}</p>}
        <input
          placeholder="Назва"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label>Дата початку:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label>Дата завершення:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <label>Тип плану:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="0">Monthly</option>
          <option value="1">Event</option>
        </select>
        <textarea
          placeholder="Опис"
          value={description}
          onChange={(e) => setDesc(e.target.value)}
        />
        <div className={styles["table-scroll"]}>
          <table className={styles["edit-table"]}>
            <thead>
              <tr>
                <th>Категорія</th>
                <th>Сума</th>
                <th>Валюта</th>
                <th>Опис</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((r) => r._status !== "skip" && r._status !== "delete")
                .map((r, idx) => (
                  <tr key={r.id}>
                    <td>
                      <select
                        value={r.categoryId}
                        onChange={(e) =>
                          updateRow(idx, "categoryId", e.target.value)
                        }
                      >
                        <option value="">-</option>
                        {allCats.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={r.amount}
                        onChange={(e) =>
                          updateRow(idx, "amount", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <select
                        value={r.currencyId}
                        onChange={(e) =>
                          updateRow(idx, "currencyId", e.target.value)
                        }
                      >
                        <option value="">-</option>
                        {allCur.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.symbol}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        value={r.description}
                        onChange={(e) =>
                          updateRow(idx, "description", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <button
                        className={styles["del-row"]}
                        onClick={() => deleteRow(idx)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <button className={styles["add-row"]} onClick={addRow}>
          + рядок
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className={styles["submit-button"]}
        >
          {loading ? "Збереження…" : "Зберегти"}
        </button>
        <button onClick={onClose} className={styles["close-button"]}>
          Скасувати
        </button>
      </div>
    </div>
  );
};

export default EditPlanModal;
