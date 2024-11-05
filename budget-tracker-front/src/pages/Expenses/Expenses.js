import React from 'react';
import ExpensesTable from './../../components/ExpensesTable/ExpensesTable'; // Ensure this path is correct
import './Expenses.css';

const Expenses = () => {
  return (
    <div class = "container">
      <h1>Expenses</h1>
      <div class = "content">
        <ExpensesTable class = "table" />
      </div>
    </div>
  );
};

export default Expenses;
