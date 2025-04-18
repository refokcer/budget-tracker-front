// src/pages/BudgetPlanPage/CreateBudgetPlanModal.js

import React, { useState } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import './CreateBudgetPlanModal.css';

const CreateBudgetPlanModal = ({ isOpen, onClose, onPlanCreated }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('0'); // Пример: 0 = "None", 1="Some type", ... зависит от вашего enum
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title || !startDate || !endDate) {
      alert('Заполните все обязательные поля!');
      return;
    }

    setLoading(true);
    setError(null);

    const newPlan = {
      title,
      startDate,
      endDate,
      type: parseInt(type), 
      description
    };

    try {
      const response = await fetch(API_ENDPOINTS.createBudgetPlan, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlan)
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании плана бюджета');
      }

      alert('План бюджета успешно создан!');
      // Сообщаем родителю, что план создан
      onPlanCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Создать новый план</h3>
        {error && <p className="error">{error}</p>}

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
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="0">None</option>
          <option value="1">Type1</option>
          <option value="2">Type2</option>
          {/* Дополните реальными типами (BudgetPlanType) */}
        </select>

        <label>Описание:</label>
        <textarea
          placeholder="Опционально"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="modal-buttons">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="create-button"
          >
            {loading ? 'Создание...' : 'Создать'}
          </button>
          <button onClick={onClose} className="close-button">Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default CreateBudgetPlanModal;
