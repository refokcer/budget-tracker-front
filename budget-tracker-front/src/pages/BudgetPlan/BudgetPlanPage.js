// src/pages/BudgetPlanPage/BudgetPlanPage.js

import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../config/apiConfig';
import CreateBudgetPlanModal from '../../components/Modals/CreateBudgetPlanModal/CreateBudgetPlanModal';
import './BudgetPlanPage.css';
import { useSearchParams } from 'react-router-dom';


const BudgetPlanPage = () => {
  const [searchParams] = useSearchParams();
  const planIdFromQuery = searchParams.get('planId'); // Считываем planId

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planItems, setPlanItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // При изменении planId, перезапрашиваем детали
  useEffect(() => {
    if (!planIdFromQuery) {
      setSelectedPlan(null);
      setPlanItems([]);
      return;
    }

    const fetchPlanData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) Загружаем сам план
        const planRes = await fetch(API_ENDPOINTS.budgetPlanById(planIdFromQuery));
        if (!planRes.ok) throw new Error('Ошибка при загрузке плана');
        const planData = await planRes.json();
        setSelectedPlan(planData);

        // 2) Загружаем Items
        const itemsRes = await fetch(API_ENDPOINTS.budgetPlanItemsByPlan(planIdFromQuery));
        if (!itemsRes.ok) throw new Error('Ошибка при загрузке пунктов плана');
        const itemsData = await itemsRes.json();
        setPlanItems(itemsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [planIdFromQuery]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="budget-plan-page">
      {!planIdFromQuery && (
        <p>Выберите план из выпадающего списка в шапке...</p>
      )}

      {selectedPlan && (
        <div className="plan-details">
          <h3>{selectedPlan.title}</h3>
          <p>
            Период: {new Date(selectedPlan.startDate).toLocaleDateString()} -{' '}
            {new Date(selectedPlan.endDate).toLocaleDateString()}
          </p>
          <p>Тип: {selectedPlan.type}</p>
          <p>Описание: {selectedPlan.description || '—'}</p>

          <h4>Позиции плана (items):</h4>
          {planItems.length === 0 ? (
            <p>Нет позиций.</p>
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
                    <td>{item.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetPlanPage;