import { useState } from "react";
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

  // вычисляем границы месяца на основе monthDate
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  return (
    <div className={styles.container}>
      <MonthSelector label={monthLabel} onJump={changeMonth} />
      <div className={styles.content}>
        <ExpensesTable start={start} end={end} />
      </div>
    </div>
  );
};

export default Expenses;
