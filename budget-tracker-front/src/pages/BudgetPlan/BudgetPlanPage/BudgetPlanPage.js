// src/pages/BudgetPlanPage/BudgetPlanPage.js
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API_ENDPOINTS from '../../../config/apiConfig';

import PlanDetails    from '../PlanDetails/PlanDetails';
import PlanItemsTable from '../PlanItemsTable/PlanItemsTable';

import './BudgetPlanPage.css';

const BudgetPlanPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const planIdFromQuery = searchParams.get('planId');

  /* данные */
  const [plans,        setPlans]        = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planItems,    setPlanItems]    = useState([]);
  const [transactions, setTransactions] = useState([]);

  /* справочники */
  const [categoryMap,  setCategoryMap]  = useState({});
  const [currencyMap,  setCurrencyMap]  = useState({});

  /* ui */
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  /* ---------- 1. список планов ---------- */
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.budgetPlans);
        if (!res.ok) throw new Error('Ошибка при загрузке планов');
        const data = await res.json();
        setPlans(data);

        if (!planIdFromQuery && data.length) {
          setSearchParams({ planId: data[0].id });
        }
      } catch (e) {
        setError(e.message);
      }
    };
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- 2. всё по выбранному planId ---------- */
  useEffect(() => {
    if (!planIdFromQuery) {
      setSelectedPlan(null);
      setPlanItems([]);
      setTransactions([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        /* план + items */
        const [planRes, itemsRes] = await Promise.all([
          fetch(API_ENDPOINTS.budgetPlanById(planIdFromQuery)),
          fetch(API_ENDPOINTS.budgetPlanItemsByPlan(planIdFromQuery)),
        ]);
        if (!planRes.ok || !itemsRes.ok) throw new Error('Ошибка при загрузке плана');
        const planData  = await planRes.json();
        const itemsData = await itemsRes.json();
        setSelectedPlan(planData);
        setPlanItems(itemsData);

        /* все транзакции по плану */
        const trxRes = await fetch(API_ENDPOINTS.transactionsByPlan(planIdFromQuery));
        if (!trxRes.ok) throw new Error('Ошибка при загрузке транзакций');
        setTransactions(await trxRes.json());

        /* справочники */
        const [catRes, curRes] = await Promise.all([
          fetch(API_ENDPOINTS.categories),
          fetch(API_ENDPOINTS.currencies),
        ]);
        if (!catRes.ok || !curRes.ok) throw new Error('Ошибка при загрузке справочников');
        const catData = await catRes.json();
        const curData = await curRes.json();

        const catMap = {};
        catData.forEach((c) => (catMap[c.id] = c.title));
        setCategoryMap(catMap);

        const curMap = {};
        curData.forEach((c) => (curMap[c.id] = c.symbol));
        setCurrencyMap(curMap);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [planIdFromQuery]);

  /* ---------- 3. готовим данные таблицы ---------- */
  const expenseTrx = transactions.filter((t) => t.type === 2); // 2 = Expense
  const spentMap   = expenseTrx.reduce((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {});

  /* itemsExtended с полями spent / remaining */
  const itemsExtended = planItems.map((it) => ({
    ...it,
    spent:     spentMap[it.categoryId] || 0,
    remaining: it.amount - (spentMap[it.categoryId] || 0),
  }));

  /* сумма расходов по категориям, которых нет в плане */
  const categoriesInPlan = new Set(planItems.map((i) => i.categoryId));
  const spentOther = expenseTrx
    .filter((t) => !categoriesInPlan.has(t.categoryId))
    .reduce((s, t) => s + t.amount, 0);

  if (spentOther > 0) {
    itemsExtended.push({
      id: 'other-row',
      categoryId: 'other',
      amount: '-',
      currencyId: planItems[0]?.currencyId || 1, // берём любую валюту плана
      spent: spentOther,
      remaining: '-',
      description: 'не вошедшие категории',
    });
    categoryMap.other = 'Остальное';
  }

  /* ---------- 4. рендер ---------- */
  if (loading) return <p className="loading">Загрузка...</p>;
  if (error)   return <p className="error">{error}</p>;

  if (!plans.length)
    return <p className="no-plan-text">Планов пока нет…</p>;

  return (
    <div className="budget-plan-page">
      {!planIdFromQuery && <p className="no-plan-text">Выберите план…</p>}

      {selectedPlan && (
        <div className="plan-details-wrapper">
          <PlanDetails plan={selectedPlan} />
          <PlanItemsTable
            items={itemsExtended}
            categoryMap={categoryMap}
            currencyMap={currencyMap}
          />
        </div>
      )}
    </div>
  );
};

export default BudgetPlanPage;
