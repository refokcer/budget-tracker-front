// src/components/ExpensesTable/ExpensesTable.js

import React, { useState, useEffect } from 'react';
import data from '../../data/data.json';
import './ExpensesTable.css';

const ExpensesTable = () => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    // Загрузка данных из JSON файла
    setExpenses(data.expenses);
  }, []);

  return (
    <div className="expenses-table-container">
      <table className="expenses-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Additional</th>
            <th>Date</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, index) => (
            <tr key={index}>
              <td>{expense.description}</td>
              <td>${expense.amount.toFixed(2)}</td>
              <td><span className={`category-tag ${expense.category.toLowerCase()}`}>{expense.category}</span></td>
              <td>{expense.additional || '-'}</td>
              <td>{expense.date}</td>
              <td><span className={`type-tag ${expense.type.toLowerCase()}`}>{expense.type}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpensesTable;
