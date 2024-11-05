// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">My App</h2>
      <nav className="sidebar-menu">
        <Link to="/dashboard" className="sidebar-item">Dashboard</Link>
        <Link to="/expenses" className="sidebar-item">Expenses</Link>
        <Link to="/incomes" className="sidebar-item">Incomes</Link>
        {/* Добавьте остальные ссылки */}
      </nav>
      <div className="sidebar-settings">
        <Link to="/settings" className="sidebar-item">Settings</Link>
      </div>
    </div>
  );
};

export default Sidebar;
