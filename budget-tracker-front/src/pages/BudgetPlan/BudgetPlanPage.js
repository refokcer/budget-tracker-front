// src/pages/BudgetPlanPage/BudgetPlanPage.js

import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../config/apiConfig';
import CreateBudgetPlanModal from '../../components/Modals/CreateBudgetPlanModal/CreateBudgetPlanModal';
import './BudgetPlanPage.css';

const BudgetPlanPage = () => {
  const [plans, setPlans] = useState([]);         // Список планов
  const [selectedPlanId, setSelectedPlanId] = useState(''); 
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null); // Детали плана
  const [planItems, setPlanItems] = useState([]); // Позиции (BudgetPlanItems) выбранного плана
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1) Загрузка списка всех планов
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.budgetPlans);
        if (!response.ok) {
          throw new Error('Ошибка при загрузке списка планов');
        }
        const data = await response.json();
        setPlans(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // 2) Загрузка деталей выбранного плана и его Items
  useEffect(() => {
    if (!selectedPlanId) {
      setSelectedPlanDetails(null);
      setPlanItems([]);
      return;
    }

    const fetchPlanDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Загружаем сам план
        const planRes = await fetch(API_ENDPOINTS.budgetPlanById(selectedPlanId));
        if (!planRes.ok) throw new Error('Ошибка при загрузке данных плана');

        const planData = await planRes.json();
        setSelectedPlanDetails(planData);

        // Загружаем Items для плана
        const itemsRes = await fetch(API_ENDPOINTS.budgetPlanItemsByPlan(selectedPlanId));
        if (!itemsRes.ok) throw new Error('Ошибка при загрузке позиций плана');

        const itemsData = await itemsRes.json();
        setPlanItems(itemsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
  }, [selectedPlanId]);

  const handleSelectChange = (e) => {
    setSelectedPlanId(e.target.value);
  };

  const openCreateModal = () => setIsModalOpen(true);
  const closeCreateModal = () => setIsModalOpen(false);

  // После создания нового плана – обновим список планов
  const onPlanCreated = async () => {
    closeCreateModal();
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.budgetPlans);
      if (!response.ok) {
        throw new Error('Ошибка при обновлении списка планов');
      }
      const data = await response.json();
      setPlans(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !selectedPlanDetails && !plans.length && !error) {
    return <p className="loading">Загрузка...</p>;
  }

  return (
    <div className="budget-plan-page">
      <h2>План Бюджета</h2>
      {error && <p className="error">{error}</p>}

      {/* Селект для выбора плана */}
      <div className="plan-selector">
        <label htmlFor="planSelect">Выберите план: </label>
        <select id="planSelect" value={selectedPlanId} onChange={handleSelectChange}>
          <option value="">-- Не выбрано --</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.title}
            </option>
          ))}
        </select>
        <button onClick={openCreateModal} className="create-button">
          Создать план
        </button>
      </div>

      {/* Если план выбран, покажем детали */}
      {selectedPlanDetails && (
        <div className="plan-details">
          <h3>{selectedPlanDetails.Title}</h3>
          <p>
            <strong>Период:</strong>{' '}
            {new Date(selectedPlanDetails.startDate).toLocaleDateString()} -{' '}
            {new Date(selectedPlanDetails.endDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Тип плана:</strong> {selectedPlanDetails.type}
          </p>
          <p>
            <strong>Описание:</strong>{' '}
            {selectedPlanDetails.description || 'Нет описания'}
          </p>

          <h4>Позиции плана (Items):</h4>
          {planItems.length === 0 ? (
            <p>Нет позиций в этом плане.</p>
          ) : (
            <table className="plan-items-table">
              <thead>
                <tr>
                  <th>Категория</th>
                  <th>Сумма</th>
                  <th>Валюта</th>
                  <th>Описание</th>
                </tr>
              </thead>
              <tbody>
                {planItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.categoryId}</td>
                    <td>{item.amount}</td>
                    <td>{item.currencyId}</td>
                    <td>{item.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Модальное окно для создания нового плана */}
      <CreateBudgetPlanModal
        isOpen={isModalOpen}
        onClose={closeCreateModal}
        onPlanCreated={onPlanCreated}
      />
    </div>
  );
};

export default BudgetPlanPage;
