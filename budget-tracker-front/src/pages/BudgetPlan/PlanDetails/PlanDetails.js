import React from 'react';
import './PlanDetails.css';

const PlanDetails = ({ plan }) => {
  if (!plan) return null;

  /* период в формате дд.мм.гггг – дд.мм.гггг */
  const periodString = `${new Date(plan.startDate).toLocaleDateString()} – ${new Date(plan.endDate).toLocaleDateString()}`;

  /* человекочитаемый тип */
  const typeString =
    plan.type === 0 ? 'Monthly' :
    plan.type === 1 ? 'Event'   :
    'Не указан';

  return (
    <div className="plan-details-inline">
      <span className="plan-title">
        <strong>Название:</strong> {plan.title || 'Без названия'}
      </span>

      <span className="plan-period">
        <strong>Период:</strong> {periodString}
      </span>

      <span className="plan-type">
        <strong>Тип:</strong> {typeString}
      </span>

      <span className="plan-description">
        <strong>Описание:</strong> {plan.description || 'Нет описания'}
      </span>
    </div>
  );
};

export default PlanDetails;
