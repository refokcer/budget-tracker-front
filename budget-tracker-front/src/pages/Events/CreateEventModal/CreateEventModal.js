import React, { useState, useEffect } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import { apiFetch, apiJson, getApiErrorMessage } from "../../../services/apiClient";
import styles from "./CreateEventModal.module.css";

const CreateEventModal = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [months, setMonths] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown, { passive: true });
    return () =>
      document.removeEventListener("keydown", handleKeyDown, { passive: true });
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;
    (async () => {
      try {
        const data = await apiJson(API_ENDPOINTS.monthPlans, {}, "Failed to load month plans");
        if (!ignore) setMonths(data);
      } catch {
        if (!ignore) setMonths([]);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title || !startDate || !endDate) {
      alert("Введите название и даты!");
      return;
    }
    const newEvent = {
      title,
      startDate,
      endDate,
      type: 1,
      description,
      parentId: parentId ? Number(parentId) : null,
    };
    try {
      setLoading(true);
      setError(null);
      await apiFetch(API_ENDPOINTS.createBudgetPlan, {
        method: "POST",
        body: newEvent,
      }, "Failed to create event");
      onCreated();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <h3>Створити подію</h3>
        {error && <p className={styles.error}>{error}</p>}
        <input
          type="text"
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
        <label>Дата закінчення:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <label>Місячний план:</label>
        <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">-</option>
          {months.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Опис"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={styles["submit-button"]}
        >
          {loading ? "Створення..." : "Створити"}
        </button>
        <button onClick={onClose} className={styles["close-button"]}>
          Скасувати
        </button>
      </div>
    </div>
  );
};

export default CreateEventModal;
