import React, { useState } from "react";
import ExpensesTable from "../ExpensesTable/ExpensesTable";
import MonthSelector from "../../../components/MonthSelector/MonthSelector";
import styles from "./Expenses.module.css";

const Expenses = () => {
  const [monthDate, setMonthDate] = useState(new Date());

  const changeMonth = (delta) => {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() + delta);
    setMonthDate(d);
  };

  const monthLabel = monthDate.toLocaleString("uk-UA", {
    month: "long",
    year: "numeric",
  });

  const month = monthDate.getMonth() + 1;
  const year = monthDate.getFullYear();

  return (
    <div className={styles.container}>
      <MonthSelector label={monthLabel} onJump={changeMonth} />
      <div className={styles.content}>
        <ExpensesTable month={month} year={year} />
      </div>
    </div>
  );
};

export default Expenses;
