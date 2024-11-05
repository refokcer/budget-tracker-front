// src/components/Header.js

import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <h2>My App</h2>
      </div>
      <div className="header-right">
        <div className="header-buttons">
            <button className="expense">+ expense</button>
            <button className="income">+ income</button>
            <button className="transfer">+ transfer</button>
        </div>
        <div className="header-right-bell-icon">
            <i className="bell-icon">🔔</i>
        </div>
        <div className="header-right-avatar">
            <img src="favicon.ico" alt="User Avatar" className="avatar" />
        </div>
      </div>
    </header>
  );
};

export default Header;
