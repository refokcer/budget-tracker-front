import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../config/apiConfig';

import SummaryCards       from './components/SummaryCards/SummaryCards';
import PieChart           from './components/PieChart/PieChart';
import TopList            from './components/TopList/TopList';
import TopTransactionCard from './components/TopTransactionCard/TopTransactionCard';

import './MonthlyReport.css';

/* утиліта форматування YYYY-MM-DD */
const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

const MonthlyReport = () => {
  /* ───────── вибір місяця ───────── */
  const [monthDate, setMonthDate] = useState(() => new Date()); // сьогодні
  const jumpMonth = (delta) => {
    const copy = new Date(monthDate);
    copy.setMonth(copy.getMonth() + delta);
    setMonthDate(copy);
  };

  const monthStart = React.useMemo(
    () => new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
    [monthDate]
  );
  const nextMonth = React.useMemo(
    () => new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1),
    [monthDate]
  );

  /* ───────── стани даних ───────── */
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const [expenses,    setExpenses]    = useState([]);
  const [incomes,     setIncomes]     = useState([]);
  const [categories,  setCategories]  = useState({});
  const [accounts,    setAccounts]    = useState({});
  const [currencies,  setCurrencies]  = useState({});

  /* ───────── fetch on month change ───────── */
  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const [expRes, incRes, catRes, accRes, curRes] = await Promise.all([
          fetch(API_ENDPOINTS.expensesByDate(fmt(monthStart), fmt(nextMonth))),
          fetch(API_ENDPOINTS.incomesByDate(fmt(monthStart), fmt(nextMonth))),
          fetch(API_ENDPOINTS.categories),
          fetch(API_ENDPOINTS.accounts),
          fetch(API_ENDPOINTS.currencies),
        ]);
        if (![expRes, incRes, catRes, accRes, curRes].every((r) => r.ok))
          throw new Error('Помилка завантаження даних');

        setExpenses(await expRes.json());
        setIncomes(await incRes.json());
        setCategories(Object.fromEntries((await catRes.json()).map((c) => [c.id, c.title])));
        setAccounts(Object.fromEntries((await accRes.json()).map((a) => [a.id, a.title])));
        setCurrencies(Object.fromEntries((await curRes.json()).map((c) => [c.id, c.symbol])));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [monthDate, monthStart, nextMonth]); // ← рефетч при зміні місяця

  /* ───────── агрегати ───────── */
  const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
  const totalInc = incomes.reduce((s, t) => s + t.amount, 0);
  const balance  = totalInc - totalExp;

  const aggregate = (arr, field) =>
    arr.reduce((acc, t) => {
      acc[t[field]] = (acc[t[field]] || 0) + t.amount;
      return acc;
    }, {});
  const expByCat = aggregate(expenses, 'categoryId');
  const incByCat = aggregate(incomes,  'categoryId');
  const expByAcc = aggregate(expenses, 'accountFrom');

  const maxExpense = expenses.sort((a, b) => b.amount - a.amount)[0];

  if (loading) return <p className="loading">Завантаження…</p>;
  if (error)   return <p className="error">{error}</p>;

  const monthLabel = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="monthly-report">
      {/* селектор місяця */}
      <div className="month-selector">
        <button onClick={() => jumpMonth(-1)}>&lt;</button>
        <span>{monthLabel}</span>
        <button onClick={() => jumpMonth(1)}>&gt;</button>
      </div>

      <SummaryCards
        totalExp={totalExp}
        totalInc={totalInc}
        balance={balance}
        defaultCurrency={currencies[1] || '₴'}
      />

      <div className="charts-grid">
        <TopList
          title="Топ-10 категорій витрат"
          dataMap={expByCat}
          labels={categories}
          totalIncome={totalInc}
        />

        <PieChart title="Всі категорії витрат"  data={expByCat} labels={categories} />

        <TopList
          title="Топ-10 категорій доходів"
          dataMap={incByCat}
          labels={categories}
          totalIncome={totalInc}
        />

        <PieChart title="Всі категорії доходів" data={incByCat} labels={categories} />
        
        <PieChart
          title="Розподіл витрат за рахунками"
          data={expByAcc}
          labels={accounts}
        />
        {maxExpense && (
          <TopTransactionCard
            transaction={maxExpense}
            category={categories[maxExpense.categoryId]}
            account={accounts[maxExpense.accountFrom]}
            currency={currencies[maxExpense.currencyId]}
          />
        )}
      </div>
    </div>
  );
};

export default MonthlyReport;
