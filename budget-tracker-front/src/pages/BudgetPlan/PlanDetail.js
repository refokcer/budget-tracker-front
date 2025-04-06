// Пример: PlanDetails.js

import React from 'react';
import './PlanDetails.css';

const PlanDetails = ({ plan }) => {
  if (!plan) return null;

  // Формируем строку периода
  const periodString = `${new Date(plan.startDate).toLocaleDateString()} – ${new Date(plan.endDate).toLocaleDateString()}`;

return (
    <div className="plan-details-inline">
        <span className="plan-title"> <strong>Название:</strong> {plan.title || 'Без названия'}</span>
        <span className="plan-period">
            <strong>Период:</strong> {periodString}
        </span>
        <span className="plan-type">
            <strong>Тип:</strong> {plan.type || 'Не указан'}
        </span>
        <span className="plan-description">
            <strong>Описание:</strong> {plan.description || 'Нет описания'}
        </span>
    </div>
);
};

export default PlanDetails;
