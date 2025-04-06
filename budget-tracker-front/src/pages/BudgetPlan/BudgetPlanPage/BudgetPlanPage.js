// src/pages/BudgetPlanPage/BudgetPlanPage.js

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API_ENDPOINTS from '../../../config/apiConfig';

import PlanDetails from '../PlanDetails/PlanDetails';
import PlanItemsTable from '../PlanItemsTable/PlanItemsTable';

import './BudgetPlanPage.css';

const BudgetPlanPage = () => {
  const [searchParams] = useSearchParams();
  const planIdFromQuery = searchParams.get('planId'); // считываем ?planId=...

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planItems, setPlanItems] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [currencyMap, setCurrencyMap] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загружаем данные, когда меняется planId
  useEffect(() => {
    if (!planIdFromQuery) {
      setSelectedPlan(null);
      setPlanItems([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1) Загрузить сам план
        const planRes = await fetch(API_ENDPOINTS.budgetPlanById(planIdFromQuery));
        if (!planRes.ok) throw new Error('Ошибка при загрузке плана');
        const planData = await planRes.json();
        setSelectedPlan(planData);

        // 2) Загрузить Items
        const itemsRes = await fetch(API_ENDPOINTS.budgetPlanItemsByPlan(planIdFromQuery));
        if (!itemsRes.ok) throw new Error('Ошибка при загрузке позиций плана');
        const itemsData = await itemsRes.json();

        // 3) Загрузить категории и валюты
        const [catRes, curRes] = await Promise.all([
          fetch(API_ENDPOINTS.categories),
          fetch(API_ENDPOINTS.currencies),
        ]);

        if (!catRes.ok || !curRes.ok) {
          throw new Error('Ошибка при загрузке категорий/валют');
        }

        const catData = await catRes.json();
        const curData = await curRes.json();

        // Создаём словари { id: title } и { id: symbol }
        const catMap = {};
        catData.forEach((c) => {
          catMap[c.id] = c.title;
        });

        const curMap = {};
        curData.forEach((c) => {
          curMap[c.id] = c.symbol;
        });

        setCategoryMap(catMap);
        setCurrencyMap(curMap);

        setPlanItems(itemsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [planIdFromQuery]);

  // -- РЕНДЕР --

  if (loading) return <p className="loading">Загрузка...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="budget-plan-page">
      {!planIdFromQuery && (
        <p className="no-plan-text">
          Выберите план в шапке...
        </p>
      )}

      {selectedPlan && (
        <div className="plan-details-wrapper">
          {/* Отдельный компонент для основной информации плана */}
          <PlanDetails plan={selectedPlan} />

          {/* Таблица с позициями плана */}
          <PlanItemsTable
            items={planItems}
            categoryMap={categoryMap}
            currencyMap={currencyMap}
          />
        </div>
      )}
    </div>
  );
};

export default BudgetPlanPage;
