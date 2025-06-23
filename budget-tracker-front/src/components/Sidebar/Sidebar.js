// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';
import starIcon from '../../data/Star.svg'; // Подключаем иконку
import dasbordIcon from '../../data/dashboards.png'; // Подключаем иконку

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <nav className={styles['sidebar-menu']}>
        <Link to="/dashboard" className={styles['sidebar-item']}>
          <img src={dasbordIcon} alt="icon" className={styles['sidebar-icon']} />
          Dashboard
        </Link>
        <Link to="/expenses" className={styles['sidebar-item']}>
          <img src={starIcon} alt="icon" className={styles['sidebar-icon']} />
          Expenses
        </Link>
        <Link to="/incomes" className={styles['sidebar-item']}>
          <img src={starIcon} alt="icon" className={styles['sidebar-icon']} />
          Incomes
        </Link>
        <Link to="/transfers" className={styles['sidebar-item']}>
          <img src={starIcon} alt="icon" className={styles['sidebar-icon']} />
          Transfers 
        </Link>
        <Link to="/budget-plans" className={styles['sidebar-item']}>
          <img src={starIcon} alt="icon" className={styles['sidebar-icon']} />
          Budget Plans
        </Link>
        <Link to="/report" className={styles['sidebar-item']}>
          <img src={starIcon} alt="icon" className={styles['sidebar-icon']} />
          Monthly Report
        </Link>
        {/* Добавьте остальные ссылки */}
      </nav>
      <div className={styles['sidebar-settings']}>
        <Link to="/settings" className={styles['sidebar-item']}>
          <img src={starIcon} alt="icon" className={styles['sidebar-icon']} />
          Settings
        </Link>
      </div>

    </div>
  );
};

export default Sidebar;
