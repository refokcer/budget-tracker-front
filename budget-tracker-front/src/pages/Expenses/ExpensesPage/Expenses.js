import React, { useState } from 'react';
import ExpensesTable from '../ExpensesTable/ExpensesTable';
import styles from './Expenses.module.css';

/* YYYY-MM-DD */
const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

const Expenses = () => {
  /* перший день активного місяця */
  const [monthDate, setMonthDate] = useState(new Date());

  /* зміщення місяця ±1 */
  const changeMonth = (delta) => {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() + delta);
    setMonthDate(d);
  };

  /* межі місяця */
  const startOfMonth = fmt(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
  const nextMonth    = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
  const endOfMonth   = fmt(nextMonth); // перший день наступного місяця (API ≤ end)

  /* назва місяця українською */
  const monthLabel = monthDate.toLocaleString('uk-UA', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.container}>
      {/* селектор місяця */}
      <div className={styles['month-selector']}>
        <button onClick={() => changeMonth(-1)}>&lt;</button>
        <span>{monthLabel}</span>
        <button onClick={() => changeMonth(1)}>&gt;</button>
      </div>

      <div className={styles.content}>
        <ExpensesTable startDate={startOfMonth} endDate={endOfMonth} />
      </div>
    </div>
  );
};

export default Expenses;
