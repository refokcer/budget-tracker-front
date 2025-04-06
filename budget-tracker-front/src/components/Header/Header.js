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

  // Определяем название страницы по pathname
  const currentPageTitle = pageTitles[location.pathname] || 'My App';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // --- ЛОГИКА для Budget Plans (если хотим dropdown на /budget-plans):
  const [plans, setPlans] = useState([]);
  const [plansError, setPlansError] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // Загружаем список планов только для /budget-plans
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

  // При выборе плана - меняем query-параметр ?planId=...
  const handlePlanChange = (e) => {
    setSelectedPlanId(e.target.value);
    navigate(`/budget-plans?planId=${e.target.value}`);
  };

  // --- Модалки Expense, Income, Transfer
  const openExpenseModal = () => setIsModalOpen(true);
  const closeExpenseModal = () => setIsModalOpen(false);

  return (
    <header className="header">
      {/* Левая часть: бренд и название страницы */}
      <div className="header-left">
        <h2 className="brand-title">My App</h2>
      </div>

      
      
      {/* Выпадающий список планов – только если текущая страница /budget-plans */}
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

      <div className="header-left">
        <h2 className="page-title">{currentPageTitle}</h2>
      </div>

      {/* Правая часть: кнопки +Expense, +Income, +Transfer, иконки и аватар */}
      <div className="header-right">
        <div className="header-right-buttons">
          <button className="expense" onClick={openExpenseModal}>+ expense</button>
          <button className="income" onClick={() => setIsIncomeModalOpen(true)}>+ income</button>
          <button className="transfer" onClick={() => setIsTransferModalOpen(true)}>+ transfer</button>
        </div>
        <div className="header-right-icons">
          <img src={notificationsIcon} alt="Notifications" className="bell-icon" />
        </div>
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