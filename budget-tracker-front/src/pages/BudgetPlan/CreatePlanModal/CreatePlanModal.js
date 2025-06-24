import React, { useState, useEffect } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import styles from "./CreatePlanModal.module.css";

const CreatePlanModal = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("0"); // рядок '0' | '1'
  const [description, setDescription] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title || !startDate || !endDate) {
      alert("Введіть назву та дати!");
      return;
    }

    const newPlan = {
      title,
      startDate,
      endDate,
      type: Number(type), // надсилаємо 0 або 1
      description,
    };

    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.createBudgetPlan, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlan),
      });
      if (!res.ok) throw new Error("Помилка при створенні плану");
      onCreated();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <h3>Створити план</h3>

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

        <label>Тип плану:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="0">Місячний</option>
          <option value="1">Подія</option>
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
          {loading ? "Створення..." : "Створити план"}
        </button>

        <button onClick={onClose} className={styles["close-button"]}>
          Скасувати
        </button>
      </div>
    </div>
  );
};

export default CreatePlanModal;
