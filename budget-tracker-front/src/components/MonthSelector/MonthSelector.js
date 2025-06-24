import React from 'react';
import styles from './MonthSelector.module.css';

const MonthSelector = ({ label, onJump, variant = 'overlay' }) => {
  const classNames = [styles['month-selector']];
  if (variant === 'overlay') classNames.push(styles.overlay);
  if (variant === 'spaced') classNames.push(styles.spaced);

  return (
    <div className={classNames.join(' ')}>
      <button onClick={() => onJump(-1)}>&lt;</button>
      <span>{label}</span>
      <button onClick={() => onJump(1)}>&gt;</button>
    </div>
  );
};

export default MonthSelector;
