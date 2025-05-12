import React, { useState } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import './CreatePlanModal.css';

const CreatePlanModal = ({ isOpen, onClose, onCreated }) => {
  const [title,       setTitle]       = useState('');
  const [startDate,   setStartDate]   = useState('');
  const [endDate,     setEndDate]     = useState('');
  const [type,        setType]        = useState('0');      // строка '0' | '1'
  const [description, setDescription] = useState('');

  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title || !startDate || !endDate) {
      alert('Введите название и даты!');
      return;
    }

    const newPlan = {
      title,
      startDate,
      endDate,
      type: Number(type),            // отправляем 0 или 1
      description,
    };

    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.createBudgetPlan, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlan),
      });
      if (!res.ok) throw new Error('Ошибка при создании плана');
      onCreated();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Создать план</h3>

        {error && <p className="error">{error}</p>}

        <input
          type="text"
          placeholder="Название"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
        />

        <label>Дата начала:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e)=>setStartDate(e.target.value)}
        />

        <label>Дата окончания:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e)=>setEndDate(e.target.value)}
        />

        <label>Тип плана:</label>
        <select value={type} onChange={(e)=>setType(e.target.value)}>
          <option value="0">Monthly</option>
          <option value="1">Event</option>
        </select>

        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="submit-button"
        >
          {loading ? 'Создание...' : 'Создать план'}
        </button>

        <button onClick={onClose} className="close-button">
          Отмена
        </button>
      </div>
    </div>
  );
};

export default CreatePlanModal;
