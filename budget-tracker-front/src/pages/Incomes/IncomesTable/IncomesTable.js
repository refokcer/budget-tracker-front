import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import './IncomesTable.css';

const IncomesTable = ({ startDate, endDate }) => {
  const [transactions, setTransactions] = useState([]);
  const [currencies,   setCurrencies]   = useState({});
  const [categories,   setCategories]   = useState({});
  const [accounts,     setAccounts]     = useState({});
  const [sortConfig,   setSortConfig]   = useState({ key:null, direction:'asc' });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [busyId,       setBusyId]       = useState(null);

  /* завантаження при зміні місяця */
  useEffect(()=>{
    const fetchData = async ()=>{
      setLoading(true); setError(null);
      try{
        const url = API_ENDPOINTS.incomesByDate(startDate, endDate);
        const [tr,curr,cat,acc] = await Promise.all([
          fetch(url),
          fetch(API_ENDPOINTS.currencies),
          fetch(API_ENDPOINTS.categories),
          fetch(API_ENDPOINTS.accounts)
        ]);
        if(!tr.ok||!curr.ok||!cat.ok||!acc.ok) throw new Error('Помилка завантаження');
        const currencyMap = Object.fromEntries((await curr.json()).map(c=>[c.id,c.symbol]));
        const categoryMap = Object.fromEntries((await cat.json()).map(c=>[c.id,c.title]));
        const accountMap  = Object.fromEntries((await acc.json()).map(a=>[a.id,a.title]));
        setTransactions(await tr.json());
        setCurrencies(currencyMap); setCategories(categoryMap); setAccounts(accountMap);
      }catch(e){ setError(e.message); }
      finally{ setLoading(false); }
    };
    fetchData();
  },[startDate,endDate]);

  /* сортування */
  const handleSort = (k)=>{
    setSortConfig(s=>({ key:k, direction: s.key===k && s.direction==='asc' ? 'desc':'asc' }));
  };

  const rows=[...transactions].sort((a,b)=>{
    if(!sortConfig.key) return 0;
    let A=a[sortConfig.key], B=b[sortConfig.key];
    if(sortConfig.key==='date'){A=new Date(A);B=new Date(B);}
    if(sortConfig.key==='amount'){A=+A;B=+B;}
    if(sortConfig.key==='title'){A=A.toLowerCase();B=B.toLowerCase();}
    return A<B ? (sortConfig.direction==='asc'?-1:1) : A>B ? (sortConfig.direction==='asc'?1:-1) : 0;
  });

  /* видалення */
  const del = async (id)=>{
    if(!window.confirm('Видалити транзакцію?')) return;
    try{
      setBusyId(id);
      const r=await fetch(API_ENDPOINTS.deleteTransaction(id),{method:'DELETE'});
      if(!r.ok) throw new Error('Помилка видалення');
      setTransactions(p=>p.filter(t=>t.id!==id));
    }catch(e){ alert(e.message); }
    finally{ setBusyId(null); }
  };

  if(loading) return <p>Завантаження...</p>;
  if(error)   return <p className="error">Помилка: {error}</p>;

  return(
    <div className="incomes-table-container">
      <table className="incomes-table">
        <thead>
          <tr>
            <th onClick={()=>handleSort('title')}>Назва {sortConfig.key==='title'?(sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={()=>handleSort('amount')}>Сума {sortConfig.key==='amount'?(sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={()=>handleSort('categoryId')}>Категорія {sortConfig.key==='categoryId'?(sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={()=>handleSort('accountTo')}>Рахунок (Куди) {sortConfig.key==='accountTo'?(sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={()=>handleSort('date')}>Дата {sortConfig.key==='date'?(sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={()=>handleSort('type')}>Тип {sortConfig.key==='type'?(sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th>Опис</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(t=>(
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>{currencies[t.currencyId]||''} {t.amount.toFixed(2)}</td>
              <td>{categories[t.categoryId]||'—'}</td>
              <td>{accounts[t.accountTo]||'-'}</td>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td>{t.type===1?'Income':t.type===2?'Expense':'Transfer'}</td>
              <td style={{maxWidth:'200px',wordWrap:'break-word'}}>{t.description||'-'}</td>
              <td>
                <button className="del-btn" disabled={busyId===t.id} onClick={()=>del(t.id)}>
                  {busyId===t.id?'…':'✕'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncomesTable;
