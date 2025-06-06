import React, { useState } from 'react';
import TransfersTable from '../TransfersTable/TransfersTable';
import './TransfersPage.css';

const TransfersPage = () => {
  const [monthDate, setMonthDate] = useState(new Date());

  const jump = (d) => {
    const tmp = new Date(monthDate);
    tmp.setMonth(tmp.getMonth() + d);
    setMonthDate(tmp);
  };

  const fmt = (d)=>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  const start = fmt(new Date(monthDate.getFullYear(), monthDate.getMonth(),   1));
  const end   = fmt(new Date(monthDate.getFullYear(), monthDate.getMonth()+1, 1));  // початок наступного місяця

  const label = monthDate.toLocaleString('uk',{month:'long',year:'numeric'});

  return (
    <div className="container">
      <div className="month-selector">
        <button onClick={()=>jump(-1)}>&lt;</button>
        <span>{label}</span>
        <button onClick={()=>jump(1)}>&gt;</button>
      </div>

      <div className="content">
        <TransfersTable startDate={start} endDate={end} />
      </div>
    </div>
  );
};

export default TransfersPage;
