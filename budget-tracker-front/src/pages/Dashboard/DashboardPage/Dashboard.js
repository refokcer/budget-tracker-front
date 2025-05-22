import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import './Dashboard.css';

const Dashboard = () => {
  /* ───────── стани ───────── */
  const [accounts, setAccounts]   = useState([]);
  const [expenses, setExpenses]   = useState([]);
  const [incomes,  setIncomes]    = useState([]);
  const [categories, setCatMap]   = useState({});
  const [currencies, setCurMap]   = useState({});
  const [biggestTx, setBiggest]   = useState(null);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  /* ───────── завантаження ───────── */
  useEffect(() => {
    const load = async () => {
      try {
        const [
          accRes, expRes, incRes, catRes, curRes, trxRes,
        ] = await Promise.all([
          fetch(API_ENDPOINTS.accounts),
          fetch(API_ENDPOINTS.expenses),
          fetch(API_ENDPOINTS.incomes),
          fetch(API_ENDPOINTS.categories),
          fetch(API_ENDPOINTS.currencies),
          fetch(API_ENDPOINTS.transactions),
        ]);

        if (![accRes, expRes, incRes, catRes, curRes, trxRes].every(r => r.ok))
          throw new Error('Помилка завантаження');

        setAccounts(await accRes.json());
        setExpenses(await expRes.json());
        setIncomes (await incRes.json());
        setCatMap( Object.fromEntries((await catRes.json()).map(c => [c.id, c.title])));
        setCurMap( Object.fromEntries((await curRes.json()).map(c => [c.id, c.symbol])));

        const trxAll = await trxRes.json();
        trxAll.sort((a, b) => b.amount - a.amount);
        setBiggest(trxAll[0] ?? null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ───────── агрегати ───────── */
  const totalBalance = accounts.reduce((s, a) => s + a.amount, 0);
  const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
  const totalInc = incomes .reduce((s, t) => s + t.amount, 0);

  const groupByCat = (arr) =>
    arr.reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {});

  const expByCat = Object.entries(groupByCat(expenses))
    .sort(([,a],[,b]) => b - a)
    .slice(0, 10);

  const incByCat = Object.entries(groupByCat(incomes))
    .sort(([,a],[,b]) => b - a)
    .slice(0, 10);

  /* ───────── утиліта відсоток ───────── */
  const perc = (sum, total) =>
    total ? `${(sum / total * 100).toFixed(1)} %` : '—';

  /* ───────── рендер ───────── */
  if (loading) return <p className="db-loading">Завантаження…</p>;
  if (error)   return <p className="db-error">{error}</p>;

  return (
    <div className="db-container">
      <div className="db-grid">
        {/* ───── 1. Accounts ───── */}
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

        {/* ───── 2. Top-10 Expenses ───── */}
        <div className="db-card">
          <h3 className="db-title">Top 10 Expenses</h3>
          {expByCat.length === 0
            ? <p className="db-empty">Немає даних</p>
            : (
              <table className="db-small-table">
                <thead><tr><th>Категорія</th><th>Сума</th><th>Percent</th></tr></thead>
                <tbody>
                  {expByCat.map(([id,sum]) => (
                    <tr key={id}>
                      <td>{categories[id] || '—'}</td>
                      <td>{sum.toFixed(2)}</td>
                      <td>{perc(sum, totalExp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>

        {/* ───── 3. Top-10 Incomes ───── */}
        <div className="db-card">
          <h3 className="db-title">Top 10 Incomes</h3>
          {incByCat.length === 0
            ? <p className="db-empty">Немає даних</p>
            : (
              <table className="db-small-table">
                <thead><tr><th>Категорія</th><th>Сума</th><th>Percent</th></tr></thead>
                <tbody>
                  {incByCat.map(([id,sum]) => (
                    <tr key={id}>
                      <td>{categories[id] || '—'}</td>
                      <td>{sum.toFixed(2)}</td>
                      <td>{perc(sum, totalInc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>

        {/* ───── 4. Biggest Transaction ───── */}
        <div className="db-card">
          <h3 className="db-title">Найбільша транзакція</h3>
          {biggestTx ? (
            <>
              <p className="db-big">
                {currencies[biggestTx.currencyId] || '₴'}&nbsp;
                {biggestTx.amount.toFixed(2)}
              </p>
              <p className="db-sub">{biggestTx.title}</p>
              <p className="db-sub">{new Date(biggestTx.date).toLocaleDateString()}</p>
            </>
          ) : <p className="db-empty">—</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
