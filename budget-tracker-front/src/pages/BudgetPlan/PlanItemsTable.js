// src/pages/BudgetPlanPage/PlanItemsTable.js

import React from 'react';
import './PlanItemsTable.css';

const PlanItemsTable = ({ items, categoryMap, currencyMap }) => {
  if (!items || items.length === 0) {
    return <p>Нет позиций в этом плане.</p>;
  }

  return (
    <div className="plan-items-table-container">
      <table className="plan-items-table">
        <thead>
          <tr>
            <th>Категория</th>
            <th>Сумма</th>
            <th>Описание</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{categoryMap[item.categoryId] || item.categoryId}</td>
              <td>{currencyMap[item.currencyId] || item.currencyId}{item.amount}</td>
              <td>{item.description || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlanItemsTable;
