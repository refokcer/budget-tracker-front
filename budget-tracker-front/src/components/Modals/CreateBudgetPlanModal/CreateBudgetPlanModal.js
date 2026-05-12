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
      alert("Заполните все обязательные поля!");
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

      alert("План бюджета успешно создан!");
      // Сообщаем родителю, что план создан
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
        <h3>Создать новый план</h3>
        {error && <p className={styles.error}>{error}</p>}

        <label>Название плана:</label>
        <input
          type="text"
          placeholder="Мой план"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Дата начала:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label>Дата окончания:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <label>Тип плана:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}></select>

        <label>Описание:</label>
        <textarea
          placeholder="Опционально"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className={styles["modal-buttons"]}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={styles["create-button"]}
          >
            {loading ? "Создание..." : "Создать"}
          </button>
          <button onClick={onClose} className={styles["close-button"]}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBudgetPlanModal;
