// src/pages/BudgetPlanPage/PlanItemsTable.js
import React from 'react';
import './PlanItemsTable.css';

const PlanItemsTable = ({ items, categoryMap, currencyMap }) => {
  if (!items || items.length === 0) {
    return <p>Нет позиций в этом плане.</p>;
  }

  const renderAmount = (val, curId) =>
    val === '-' ? '-' : `${currencyMap[curId] || ''}${val}`;

  return (
    <div className="plan-items-table-container">
      <table className="plan-items-table">
        <thead>
          <tr>
            <th>Категория</th>
            <th>Выделено</th>
            <th>Потрачено</th>
            <th>Осталось</th>
            <th>Описание</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td>{categoryMap[it.categoryId] || it.categoryId}</td>
              <td>{renderAmount(it.amount, it.currencyId)}</td>
              <td>{renderAmount(it.spent,  it.currencyId)}</td>
              <td>{renderAmount(it.remaining, it.currencyId)}</td>
              <td>{it.description || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlanItemsTable;
