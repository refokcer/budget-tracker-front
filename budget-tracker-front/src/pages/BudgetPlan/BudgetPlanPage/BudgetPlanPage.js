// src/pages/BudgetPlanPage/BudgetPlanPage.js

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API_ENDPOINTS from '../../../config/apiConfig';

import PlanDetails from '../PlanDetails/PlanDetails';
import PlanItemsTable from '../PlanItemsTable/PlanItemsTable';

import './BudgetPlanPage.css';

const BudgetPlanPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const planIdFromQuery = searchParams.get('planId'); // считываем ?planId=...

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planItems, setPlanItems] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [currencyMap, setCurrencyMap] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1) При первом рендере грузим ВСЕ планы, чтобы понять, что выбрать
  useEffect(() => {
    const fetchAllPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.budgetPlans);
        if (!response.ok) {
          throw new Error('Ошибка при загрузке списка планов');
        }
        const data = await response.json();
        setPlans(data);

        // Если в query ещё НЕ указан planId и есть планы
        if (!planIdFromQuery && data.length > 0) {
          // Ставим в query-параметр первый план
          setSearchParams({ planId: data[0].id });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 
  // Пустой массив зависимостей => эта логика выполняется один раз при загрузке страницы

  // 2) Когда меняется planId (или мы только что его выставили) — грузим детали конкретного плана
  useEffect(() => {
    // Если planId ещё не определился (например, нет планов вообще)
    if (!planIdFromQuery) {
      setSelectedPlan(null);
      setPlanItems([]);
      return;
    }

    const fetchDataForSelectedPlan = async () => {
      try {
        setLoading(true);
        setError(null);

        // 2.1) Загрузить сам план
        const planRes = await fetch(API_ENDPOINTS.budgetPlanById(planIdFromQuery));
        if (!planRes.ok) throw new Error('Ошибка при загрузке плана');
        const planData = await planRes.json();
        setSelectedPlan(planData);

        // 2.2) Загрузить Items (пункты плана)
        const itemsRes = await fetch(API_ENDPOINTS.budgetPlanItemsByPlan(planIdFromQuery));
        if (!itemsRes.ok) throw new Error('Ошибка при загрузке позиций плана');
        const itemsData = await itemsRes.json();

        // 2.3) Загрузить категории и валюты (для отображения названий вместо Id)
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

    fetchDataForSelectedPlan();
  }, [planIdFromQuery]);

  // --- РЕНДЕР ---

  // Если идёт загрузка — покажем индикатор
  if (loading) return <p className="loading">Загрузка...</p>;
  // Если произошла ошибка — покажем ошибку
  if (error) return <p className="error">{error}</p>;

  // Если нет планов вообще
  if (plans.length === 0) {
    return (
      <div className="budget-plan-page">
        <p className="no-plan-text">Пока нет ни одного плана бюджета...</p>
      </div>
    );
  }

  return (
    <div className="budget-plan-page">
      {/* Если planId ещё не выставлен (хотя планы есть) — ждём, 
          пока setSearchParams поставит первый план в query */}
      {!planIdFromQuery && (
        <p className="no-plan-text">Подбираем первый план...</p>
      )}

      {/* Если уже выбрали planId и загрузили план */}
      {selectedPlan && (
        <div className="plan-details-wrapper">
          <PlanDetails plan={selectedPlan} />
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
