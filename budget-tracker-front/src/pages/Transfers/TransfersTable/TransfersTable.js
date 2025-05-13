import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import './TransfersTable.css';

const TransfersTable = ({ startDate, endDate }) => {
  const [rows,        setRows]    = useState([]);
  const [currencies,  setCurr]    = useState({});
  const [accounts,    setAcc]     = useState({});
  const [sortConfig,  setSort]    = useState({ key:null, direction:'asc' });
  const [loading,     setLoad]    = useState(true);
  const [error,       setErr]     = useState(null);
  const [busyId,      setBusy]    = useState(null);

  useEffect(()=>{
    const load=async()=>{
      setLoad(true); setErr(null);
      try{
        const url=API_ENDPOINTS.transfersByDate(startDate,endDate); // endpoint должен существовать
        const [t,c,a]=await Promise.all([
          fetch(url),
          fetch(API_ENDPOINTS.currencies),
          fetch(API_ENDPOINTS.accounts)
        ]);
        if(!t.ok||!c.ok||!a.ok) throw new Error('Ошибка загрузки');
        setRows(await t.json());
        setCurr(Object.fromEntries((await c.json()).map(x=>[x.id,x.symbol])));
        setAcc (Object.fromEntries((await a.json()).map(x=>[x.id,x.title])));
      }catch(e){setErr(e.message);}
      finally{setLoad(false);}
    };
    load();
  },[startDate,endDate]);

  const sort = (k)=> setSort(s=>({ key:k,direction:s.key===k&&s.direction==='asc'?'desc':'asc'}));

  const data=[...rows].sort((A,B)=>{
    if(!sortConfig.key) return 0;
    let a=A[sortConfig.key],b=B[sortConfig.key];
    if(sortConfig.key==='date'){a=new Date(a);b=new Date(b);}
    if(sortConfig.key==='amount'){a=+a;b=+b;}
    if(a<b) return sortConfig.direction==='asc'?-1:1;
    if(a>b) return sortConfig.direction==='asc'? 1:-1;
    return 0;
  });

  const del=async(id)=>{
    if(!window.confirm('Удалить?')) return;
    try{
      setBusy(id);
      const r=await fetch(API_ENDPOINTS.deleteTransaction(id),{method:'DELETE'});
      if(!r.ok) throw new Error('Ошибка удаления');
      setRows(p=>p.filter(x=>x.id!==id));
    }catch(e){alert(e.message);}
    finally{setBusy(null);}
  };

  if(loading) return <p>Загрузка...</p>;
  if(error)   return <p className="error">Ошибка: {error}</p>;

  return(
    <div className="transfers-table-container">
      <table className="transfers-table">
        <thead>
          <tr>
            <th onClick={()=>sort('title')}>Название {sortConfig.key==='title'?(sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={()=>sort('amount')}>Сумма {sortConfig.key==='amount'?(sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={()=>sort('accountFrom')}>Со счёта {sortConfig.key==='accountFrom'?(sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={()=>sort('accountTo')}>На счёт {sortConfig.key==='accountTo'?(sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={()=>sort('date')}>Дата {sortConfig.key==='date'?(sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th>Описание</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map(r=>(
            <tr key={r.id}>
              <td>{r.title}</td>
              <td>{currencies[r.currencyId]||''} {r.amount.toFixed(2)}</td>
              <td>{accounts[r.accountFrom]||'-'}</td>
              <td>{accounts[r.accountTo]||'-'}</td>
              <td>{new Date(r.date).toLocaleDateString()}</td>
              <td style={{maxWidth:'200px',wordWrap:'break-word'}}>{r.description||'-'}</td>
              <td>
                <button className="del-btn" disabled={busyId===r.id} onClick={()=>del(r.id)}>
                  {busyId===r.id?'…':'✕'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransfersTable;
