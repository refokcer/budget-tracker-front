import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import './EditPlanModal.css';

const EditPlanModal = ({ isOpen, onClose, plan, items, categories, currencies, onSaved }) => {
  /* поля плана */
  const [title, setTitle]         = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [type, setType]           = useState('0');
  const [description, setDesc]    = useState('');

  /* строки-items */
  const [rows, setRows] = useState([]);

  const [allCats, setAllCats] = useState([]);
  const [allCur , setAllCur ] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  /* ───── инициализация при открытии ───── */
  useEffect(()=>{
    if (!isOpen || !plan) return;
    setTitle(plan.title);
    setStartDate(plan.startDate.substring(0,10));
    setEndDate(plan.endDate.substring(0,10));
    setType(String(plan.type));
    setDesc(plan.description||'');
    setRows(items.map(i=>({...i, _status:'old'})));   // _status: old|new|delete

    /* справочники для селектов */
    (async()=>{
      try{
        const [cat,cur] = await Promise.all([
          fetch(API_ENDPOINTS.categories).then(r=>r.json()),
          fetch(API_ENDPOINTS.currencies).then(r=>r.json())
        ]);
        setAllCats(cat);
        setAllCur(cur);
      }catch(e){/* игнор */ }
    })();
  },[isOpen,plan,items]);

  if(!isOpen) return null;

  /* ───── обработчики строк ───── */
  const addRow = ()=> setRows([...rows, {
      id: Date.now(), budgetPlanId:plan.id,
      categoryId:'', amount:'', currencyId:'', description:'',
      _status:'new'
  }]);

  const updateRow = (idx, field, val)=>{
    const updated=[...rows];
    updated[idx]={...updated[idx],[field]:val, _status: updated[idx]._status||'new'};
    setRows(updated);
  };

  const deleteRow = (idx)=>{
    const updated=[...rows];
    updated[idx]._status = updated[idx]._status==='new' ? 'skip' : 'delete';
    setRows(updated);
  };

  /* ───── сохранение ───── */
  const handleSave = async () => {
    try{
      setLoading(true); setError(null);

      /* 1. обновляем сам план */
      await fetch(API_ENDPOINTS.updateBudgetPlan, {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          id:plan.id, title, startDate, endDate, type:Number(type), description
        })
      });

      /* 2. обрабатываем строки */
      for(const row of rows){
        if(row._status==='skip') continue;
        const payload = {
          budgetPlanId: plan.id,
          categoryId:   Number(row.categoryId),
          amount:       Number(row.amount),
          currencyId:   Number(row.currencyId),
          description:  row.description
        };
        if(row._status==='new'){
          await fetch(API_ENDPOINTS.createBudgetPlanItem,{
            method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
          });
        }else if(row._status==='delete'){
          await fetch(API_ENDPOINTS.deleteBudgetPlanItem(row.id),{ method:'DELETE' });
        }else{
          await fetch(API_ENDPOINTS.updateBudgetPlanItem,{
            method:'PUT', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ ...payload, id: row.id })
          });
        }
      }
      onSaved();
    }catch(e){ setError(e.message); }
    finally{ setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <h3>Редактировать план</h3>
        {error && <p className="error">{error}</p>}

        <input placeholder="Название" value={title} onChange={e=>setTitle(e.target.value)} />

        <label>Дата начала:</label>
        <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} />

        <label>Дата окончания:</label>
        <input type="date" value={endDate}   onChange={e=>setEndDate(e.target.value)} />

        <label>Тип плана:</label>
        <select value={type} onChange={e=>setType(e.target.value)}>
          <option value="0">Monthly</option>
          <option value="1">Event</option>
        </select>

        <textarea placeholder="Описание" value={description} onChange={e=>setDesc(e.target.value)} />

        {/* таблица строк */}
        <table className="edit-table">
          <thead>
            <tr><th>Категория</th><th>Сумма</th><th>Валюта</th><th>Описание</th><th></th></tr>
          </thead>
          <tbody>
            {rows.filter(r=>r._status!=='skip').map((r,idx)=>(
              <tr key={r.id}>
                <td>
                  <select value={r.categoryId} onChange={e=>updateRow(idx,'categoryId',e.target.value)}>
                    <option value="">-</option>
                    {allCats.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </td>
                <td><input type="number" value={r.amount} onChange={e=>updateRow(idx,'amount',e.target.value)}/></td>
                <td>
                  <select value={r.currencyId} onChange={e=>updateRow(idx,'currencyId',e.target.value)}>
                    <option value="">-</option>
                    {allCur.map(c=><option key={c.id} value={c.id}>{c.symbol}</option>)}
                  </select>
                </td>
                <td><input value={r.description} onChange={e=>updateRow(idx,'description',e.target.value)}/></td>
                <td><button className="del-row" onClick={()=>deleteRow(idx)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="add-row" onClick={addRow}>+ строка</button>

        <button onClick={handleSave}  disabled={loading} className="submit-button">
          {loading?'Сохранение…':'Сохранить'}
        </button>
        <button onClick={onClose} className="close-button">Отмена</button>
      </div>
    </div>
  );
};

export default EditPlanModal;
