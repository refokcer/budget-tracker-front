import React, { useState, useEffect } from 'react';
import data from '../../../data/data.json';
import './TopExpenses.css';

const TopExpenses = () => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    setExpenses(data.expensesCategory);
  }, []);

  const topExpenses = expenses
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return (
    <div className="top-expenses">
      <h3>Top 3 expenses categories</h3>
      <ul>
        {topExpenses.map((expense, index) => (
          <li key={index} className="expense-item">
            <span className="expense-category">● {expense.category}</span>
            <span className="expense-amount">${expense.amount.toFixed(2)}</span>
            <span className="expense-percentage">{expense.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopExpenses;
