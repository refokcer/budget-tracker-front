import React from 'react';
import styles from './MonthSelector.module.css';

const MonthSelector = ({ label, onJump }) => (
  <div className={styles['month-selector']}>
    <button onClick={() => onJump(-1)}>&lt;</button>
    <span>{label}</span>
    <button onClick={() => onJump(1)}>&gt;</button>
  </div>
);

export default MonthSelector;
