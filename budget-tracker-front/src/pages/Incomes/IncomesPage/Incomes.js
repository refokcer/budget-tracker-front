import React, { useState } from 'react';
import IncomesTable from '../IncomesTable/IncomesTable';
import MonthSelector from '../../../components/MonthSelector/MonthSelector';
import styles from './Incomes.module.css';

const Incomes = () => {
  /* дата-якір = 1-ше число обраного місяця */
  const [monthDate, setMonthDate] = useState(new Date());

  const jump = (d) => {
    const copy = new Date(monthDate);
    copy.setMonth(copy.getMonth() + d);
    setMonthDate(copy);
  };

  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const start = fmt(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
  const end   = fmt(new Date(monthDate.getFullYear(), monthDate.getMonth()+1, 1));  // початок наступного

  const label = monthDate.toLocaleString('uk-UA',{month:'long',year:'numeric'});

  return (
    <div className={styles.container}>
      {/* селектор місяця під шапкою */}
      <MonthSelector label={label} onJump={jump} />

      <div className={styles.content}>
        <IncomesTable startDate={start} endDate={end} />
      </div>
    </div>
  );
};

export default Incomes;
