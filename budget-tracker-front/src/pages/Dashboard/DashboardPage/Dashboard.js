import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import './Dashboard.css';

const Dashboard = () => {
  /* данные аккаунтов */
  const [accounts, setAccounts]   = useState([]);
  const [currencies, setCurrMap]  = useState({});
  const [loading, setLoading]     = useState(true);
  const [error,   setError]       = useState(null);

  useEffect(()=>{
    const load = async ()=>{
      try{
        const [accRes, curRes] = await Promise.all([
          fetch(API_ENDPOINTS.accounts),
          fetch(API_ENDPOINTS.currencies)
        ]);
        if(!accRes.ok||!curRes.ok) throw new Error('Ошибка загрузки');
        setAccounts(await accRes.json());
        setCurrMap(Object.fromEntries((await curRes.json()).map(c=>[c.id,c.symbol])));
      }catch(e){ setError(e.message); }
      finally  { setLoading(false);    }
    };
    load();
  },[]);

  const total = accounts.reduce((s,a)=>s+a.amount,0);

  return (
    <div className="container-dashboard">
      <div className="dashboard-grid">
        {/* ───── первая карточка: Accounts ───── */}
        <div className="card">
          <h3>Accounts</h3>

          {loading && <p>Загрузка...</p>}
          {error   && <p className="error">{error}</p>}

          {!loading && !error && (
            <>
              <table className="accounts-table">
                <thead>
                  <tr><th>Название</th><th>Сумма</th></tr>
                </thead>
                <tbody>
                  {accounts.map(a=>(
                    <tr key={a.id}>
                      <td>{a.title}</td>
                      <td>{currencies[a.currencyId]||''} {a.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="balance-row">
                <span>Balance:</span>
                <span>{total.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* ───── остальные карточки пока пустые ───── */}
        <div className="card placeholder"></div>
        <div className="card placeholder"></div>
        <div className="card placeholder"></div>
      </div>
    </div>
  );
};

export default Dashboard;
