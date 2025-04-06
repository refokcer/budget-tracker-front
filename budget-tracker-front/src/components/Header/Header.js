// src/components/Header/Header.js

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import './Header.css';
import notificationsIcon from '../../data/notifications.svg';
import ExpenseModal from '../Modals/ExpenseModal/ExpenseModal';
import IncomeModal from '../Modals/IncomeModal/IncomeModal';
import TransferModal from '../Modals/TransferModal/TransferModal';
import API_ENDPOINTS from '../../config/apiConfig';

const pageTitles = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/budget-plans': 'Budget Plans',
  '/expenses': 'Expenses',
  '/incomes': 'Incomes',
  '/settings': 'Settings',
  // Добавьте другие пути по необходимости
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Список планов
  const [plans, setPlans] = useState([]);
  const [plansError, setPlansError] = useState(null);

  // Выбранный план
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // Загрузим список планов (для выпадающего списка), 
  // но только если мы находимся в /budget-plans, чтобы не грузить зря
  useEffect(() => {
    if (location.pathname === '/budget-plans') {
      const fetchPlans = async () => {
        try {
          const response = await fetch(API_ENDPOINTS.budgetPlans);
          if (!response.ok) {
            throw new Error('Ошибка при загрузке планов');
          }
          const data = await response.json();
          setPlans(data);
        } catch (err) {
          setPlansError(err.message);
        }
      };
      fetchPlans();
    }
  }, [location.pathname]);
  
  // При выборе плана меняем query-параметр ?planId=...
  const handlePlanChange = (e) => {
    setSelectedPlanId(e.target.value);
    // Добавляем в URL: /budget-plans?planId=123
    navigate(`/budget-plans?planId=${e.target.value}`);
  };
  
  // Открыть/закрыть модалки (expense, income, transfer)
  const openExpenseModal = () => setIsModalOpen(true);
  const closeExpenseModal = () => setIsModalOpen(false);
  
  return (
    <header className="header">
      <div className="header-left">
        <h2>My App</h2>
      </div>

      {/* --- Выпадающий список планов --- */}
      {location.pathname === '/budget-plans' && (
        <div className="plans-dropdown">
          {plansError && <p className="error">{plansError}</p>}
          <label htmlFor="planSelect">Выберите план: </label>
          <select
            id="planSelect"
            value={selectedPlanId}
            onChange={handlePlanChange}
          >
            <option value="">-- Не выбрано --</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="header-right">
        {/* Кнопки добавления транзакций */}
        <div className="header-right-buttons">
          <button className="expense" onClick={openExpenseModal}>+ expense</button>
          <button className="income" onClick={() => setIsIncomeModalOpen(true)}>+ income</button>
          <button className="transfer" onClick={() => setIsTransferModalOpen(true)}>+ transfer</button>
        </div>

        {/* Иконка уведомлений */}
        <div className="header-right-icons">
          <img src={notificationsIcon} alt="Notifications" className="bell-icon" />
        </div>

        {/* Аватар */}
        <div className="header-right-avatar">
          <img src="favicon.ico" alt="User Avatar" className="avatar" />
        </div>
      </div>

      {/* Модалки */}
      <IncomeModal isOpen={isIncomeModalOpen} onClose={() => setIsIncomeModalOpen(false)} />
      <ExpenseModal isOpen={isModalOpen} onClose={closeExpenseModal} />
      <TransferModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} />

    </header>
  );
};

export default Header;
