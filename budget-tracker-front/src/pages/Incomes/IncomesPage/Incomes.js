import React, { useState } from 'react';
import IncomesTable from '../IncomesTable/IncomesTable';
import './Incomes.css';

const Incomes = () => {
  /* дата-якорь = 1-е число выбранного месяца */
  const [monthDate, setMonthDate] = useState(new Date());

  const jump = (d) => {
    const copy = new Date(monthDate);
    copy.setMonth(copy.getMonth() + d);
    setMonthDate(copy);
  };

  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const start = fmt(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
  const end   = fmt(new Date(monthDate.getFullYear(), monthDate.getMonth()+1, 1));  // начало следующего

  const label = monthDate.toLocaleString('default',{month:'long',year:'numeric'});

  return (
    <div className="container">
      {/* селектор месяца под шапкой */}
      <div className="month-selector">
        <button onClick={()=>jump(-1)}>&lt;</button>
        <span>{label}</span>
        <button onClick={()=>jump(1)}>&gt;</button>
      </div>

      <div className="content">
        <IncomesTable startDate={start} endDate={end} />
      </div>
    </div>
  );
};

export default Incomes;
