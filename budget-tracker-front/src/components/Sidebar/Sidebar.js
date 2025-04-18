// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import starIcon from '../../data/Star.svg'; // Подключаем иконку

const Sidebar = () => {
  return (
    <div className="sidebar">
      <nav className="sidebar-menu">
        <Link to="/dashboard" className="sidebar-item">
          <img src={starIcon} alt="icon" className="sidebar-icon" />
          Dashboard
        </Link>
        <Link to="/expenses" className="sidebar-item">
          <img src={starIcon} alt="icon" className="sidebar-icon" />
          Expenses
        </Link>
        <Link to="/incomes" className="sidebar-item">
          <img src={starIcon} alt="icon" className="sidebar-icon" />
          Incomes
        </Link>
        <Link to="/budget-plans" className="sidebar-item">
          <img src={starIcon} alt="icon" className="sidebar-icon" />
          Budget Plans
        </Link>
        {/* Добавьте остальные ссылки */}
      </nav>
      <div className="sidebar-settings">
        <Link to="/settings" className="sidebar-item">
          <img src={starIcon} alt="icon" className="sidebar-icon" />
          Settings
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
