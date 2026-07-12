import React, { useState, useEffect } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import { apiFetch, getApiErrorMessage } from "../../../services/apiClient";
import styles from "./CreatePlanModal.module.css";

const CreatePlanModal = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
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

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title || !startDate || !endDate) {
      alert("Enter a name and dates!");
      return;
    }

    const newPlan = {
      title,
      startDate,
      endDate,
      type: 0,
      description,
    };

    try {
      setLoading(true);
      setError(null);
      await apiFetch(API_ENDPOINTS.createBudgetPlan, {
        method: "POST",
        body: newPlan,
      }, "Failed to create budget plan");
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
        <h3>Create plan</h3>

        {error && <p className={styles.error}>{error}</p>}

        <input
          type="text"
          placeholder="Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Start date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label>End date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={styles["submit-button"]}
        >
          {loading ? "Creating..." : "Create plan"}
        </button>

        <button onClick={onClose} className={styles["close-button"]}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreatePlanModal;
