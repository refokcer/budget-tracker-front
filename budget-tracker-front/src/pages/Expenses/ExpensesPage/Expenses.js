import React, { useState } from 'react';
import ExpensesTable from '../ExpensesTable/ExpensesTable';
import './Expenses.css';

const Expenses = () => {
  /* дата, представляющая «первый день выбранного месяца» */
  const [monthDate, setMonthDate] = useState(new Date());

  /* сдвиг месяца на ±1 */
  const changeMonth = (delta) => {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() + delta);
    setMonthDate(d);
  };

  const fmt = (d)=>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  /* начало текущего месяца */
  const startOfMonth = fmt(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));

  /* *** конец = первый день СЛЕДУЮЩЕГО месяца *** */
  const nextMonthStart = new Date(monthDate.getFullYear(), monthDate.getMonth()+1, 1);
  const endOfMonth = fmt(nextMonthStart);      // <- передаём сюда


  /* название месяца для заголовка */
  const monthLabel = monthDate.toLocaleString('default', { month:'long', year:'numeric' });

  return (
    <div className="container">
      {/* селектор месяца */}
      <div className="month-selector">
        <button onClick={()=>changeMonth(-1)}>&lt;</button>
        <span>{monthLabel}</span>
        <button onClick={()=>changeMonth(1)}>&gt;</button>
      </div>

      <div className="content">
        <ExpensesTable startDate={startOfMonth} endDate={endOfMonth} />
      </div>
    </div>
  );
};

export default Expenses;
