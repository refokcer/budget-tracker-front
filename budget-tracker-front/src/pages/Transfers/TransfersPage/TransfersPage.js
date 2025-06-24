import React, { useState } from 'react';
import TransfersTable from '../TransfersTable/TransfersTable';
import MonthSelector from '../../../components/MonthSelector/MonthSelector';
import styles from './TransfersPage.module.css';

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
    <div className={styles.container}>
      <MonthSelector label={label} onJump={jump} />

      <div className={styles.content}>
        <TransfersTable startDate={start} endDate={end} />
      </div>
    </div>
  );
};

export default TransfersPage;
