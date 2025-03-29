// src/pages/Expenses.js

import React from "react";
import ExpensesTable from "../../components/EXPENSES/ExpensesTable/ExpensesTable";
import "./Expenses.css";

const Expenses = () => {
  return (
    <div className="container">
      <div className="content">
        <h1>Транзакции</h1>
        <ExpensesTable />
      </div>
    </div>
  );
};

export default Expenses;
