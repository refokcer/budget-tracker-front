// src/pages/Expenses.js

import React from "react";
import ExpensesTable from "../../components/EXPENSES/ExpensesTable/ExpensesTable";
import "./Expenses.css";

const Expenses = () => {
  return (
    <div className="container">
      <div className="content">
        <ExpensesTable />
      </div>
    </div>
  );
};

export default Expenses;
