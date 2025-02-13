import React from 'react';
import ExpensesTable from './../../components/ExpensesTable/ExpensesTable'; // Ensure this path is correct
import './Expenses.css';

const Expenses = () => {
  return (
    <div class = "container">
      <div class = "content">
        <ExpensesTable class = "table" />
      </div>
    </div>
  );
};

export default Expenses;
