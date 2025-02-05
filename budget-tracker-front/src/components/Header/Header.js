import React, { useState } from 'react';
import './Header.css';
import ExpenseModal from '../ExpenseModal/ExpenseModal';
import IncomeModal from '../IncomeModal/IncomeModal';

const Header = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <h2>My App</h2>
      </div>
      <div className="header-right">
        <div className="header-right-buttons">
            <button className="expense" onClick={openModal}>+ expense</button>
            <button className="income" onClick={() => setIsIncomeModalOpen(true)}>+ income</button>
            <button className="transfer">+ transfer</button>
        </div>
        <div className="header-right-icons">
            <i className="bell-icon">🔔</i>
        </div>
        <div className="header-right-avatar">
            <img src="favicon.ico" alt="User Avatar" className="avatar" />
        </div>
      </div>

      <IncomeModal isOpen={isIncomeModalOpen} onClose={() => setIsIncomeModalOpen(false)} />
      <ExpenseModal isOpen={isModalOpen} onClose={closeModal} />
    </header>
  );
};

export default Header;
