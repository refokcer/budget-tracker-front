// src/components/ExpenseModal/ExpenseModal.js

import React, { useState } from 'react';
import './ExpenseModal.css';

const ExpenseModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');

  const handleConfirm = () => {
    if (amount > 10) {
      // Здесь можно добавить логику для обработки введенной суммы
      alert(`Сумма витрат: ${amount}`);
      onClose(); // Закрыть окно после подтверждения
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Введите сумму витрат</h3>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Введите сумму"
        />
        <button onClick={handleConfirm} disabled={amount <= 10}>
          Подтвердить
        </button>
        <button onClick={onClose} className="close-button">
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default ExpenseModal;
