import { useState } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import { apiFetch, getApiErrorMessage } from "../../../services/apiClient";
import styles from "./CreateBudgetPlanModal.module.css";

const CreateBudgetPlanModal = ({ isOpen, onClose, onPlanCreated }) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("0");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title || !startDate || !endDate) {
      alert("Fill in all required fields!");
      return;
    }

    setLoading(true);
    setError(null);

    const newPlan = {
      title,
      startDate,
      endDate,
      type: parseInt(type),
      description,
    };

    try {
      await apiFetch(API_ENDPOINTS.createBudgetPlan, {
        method: "POST",
        body: newPlan,
      }, "Failed to create budget plan");

      alert("Budget plan created successfully!");
      // Notify the parent that the plan was created.
      onPlanCreated();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <h3>Create new plan</h3>
        {error && <p className={styles.error}>{error}</p>}

        <label>Plan name:</label>
        <input
          type="text"
          placeholder="My plan"
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

        <label>Plan type:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}></select>

        <label>Description:</label>
        <textarea
          placeholder="Optional"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className={styles["modal-buttons"]}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={styles["create-button"]}
          >
            {loading ? "Creating..." : "Create"}
          </button>
          <button onClick={onClose} className={styles["close-button"]}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBudgetPlanModal;
