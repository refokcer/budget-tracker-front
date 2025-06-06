// src/pages/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import './Dashboard.css';

/* YYYY-MM-DD */
const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

const Dashboard = () => {
  /* стани */
  const [accounts, setAccounts]   = useState([]);
  const [expenses, setExpenses]   = useState([]);
  const [incomes,  setIncomes]    = useState([]);
  const [transactions, setTrx]    = useState([]);
  const [categories, setCats]     = useState({});
  const [currencies, setCurs]     = useState({});

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  /* межі поточного місяця */
  const today        = new Date();
  const monthStart   = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd     = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const startStr     = fmt(monthStart);
  const endStr       = fmt(monthEnd);

  /* fetch */
  useEffect(() => {
    const load = async () => {
      try {
        const [
          accRes,
          expRes,
          incRes,
          trxRes,
          catRes,
          curRes,
        ] = await Promise.all([
          fetch(API_ENDPOINTS.accounts),
          fetch(API_ENDPOINTS.expensesByDate(startStr, endStr)),
          fetch(API_ENDPOINTS.incomesByDate(startStr, endStr)),
          fetch(API_ENDPOINTS.transactions),                // без фільтра -> фільтруємо локально
          fetch(API_ENDPOINTS.categories),
          fetch(API_ENDPOINTS.currencies),
        ]);

        if (![accRes, expRes, incRes, trxRes, catRes, curRes].every(r => r.ok))
          throw new Error('Помилка завантаження');

        setAccounts(await accRes.json());
        setExpenses(await expRes.json());
        setIncomes (await incRes.json());

        const trxAll  = await trxRes.json();
        const inMonth = trxAll.filter(t => {
          const d = new Date(t.date);
          return d >= monthStart && d <= monthEnd;
        });
        setTrx(inMonth);

        setCats(Object.fromEntries((await catRes.json()).map(c => [c.id, c.title])));
        setCurs(Object.fromEntries((await curRes.json()).map(c => [c.id, c.symbol])));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* агрегати */
  const totalBalance = accounts.reduce((s, a) => s + a.amount, 0);
  const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
  const totalInc = incomes .reduce((s, t) => s + t.amount, 0);

  const groupByCat = (arr) =>
    arr.reduce((m, t) => {
      m[t.categoryId] = (m[t.categoryId] || 0) + t.amount;
      return m;
    }, {});

  const expByCat = Object.entries(groupByCat(expenses))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const incByCat = Object.entries(groupByCat(incomes))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const biggestTx =
    transactions.length > 0
      ? [...transactions].sort((a, b) => b.amount - a.amount)[0]
      : null;

  const percent = (sum, total) =>
    total ? `${((sum / total) * 100).toFixed(1)} %` : '—';

  /* render */
  if (loading) return <p className="db-loading">Завантаження…</p>;
  if (error)   return <p className="db-error">{error}</p>;

  const cur = currencies[1] || '₴';

  return (
    <div className="db-container">
      <div className="db-grid">
        {/* Accounts */}
        <div className="db-card">
          <h3 className="db-title">Accounts</h3>
          <table className="db-table">
            <thead><tr><th>Назва</th><th>Сума</th></tr></thead>
            <tbody>
              {accounts.map(a => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{currencies[a.currencyId] || ''}&nbsp;{a.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="db-balance">
            <span>Balance:</span><span>{totalBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Top-10 Expenses */}
        <div className="db-card">
          <h3 className="db-title">Top 10 Expenses</h3>
          {expByCat.length === 0 ? (
            <p className="db-empty">Немає даних</p>
          ) : (
            <table className="db-small-table">
              <thead><tr><th>Категорія</th><th>Сума</th><th>%</th></tr></thead>
              <tbody>
                {expByCat.map(([id, sum]) => (
                  <tr key={id}>
                    <td>{categories[id] || '—'}</td>
                    <td>{sum.toFixed(2)}</td>
                    <td>{percent(sum, totalExp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top-10 Incomes */}
        <div className="db-card">
          <h3 className="db-title">Top 10 Incomes</h3>
          {incByCat.length === 0 ? (
            <p className="db-empty">Немає даних</p>
          ) : (
            <table className="db-small-table">
              <thead><tr><th>Категорія</th><th>Сума</th><th>%</th></tr></thead>
              <tbody>
                {incByCat.map(([id, sum]) => (
                  <tr key={id}>
                    <td>{categories[id] || '—'}</td>
                    <td>{sum.toFixed(2)}</td>
                    <td>{percent(sum, totalInc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Biggest transaction */}
        <div className="db-card">
          <h3 className="db-title">Найбільша транзакція</h3>
          {biggestTx ? (
            <>
              <p className="db-big">
                {currencies[biggestTx.currencyId] || '₴'}&nbsp;
                {biggestTx.amount.toFixed(2)}
              </p>
              <p className="db-sub">{biggestTx.title}</p>
              <p className="db-sub">
                {new Date(biggestTx.date).toLocaleDateString()}
              </p>
            </>
          ) : (
            <p className="db-empty">—</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
