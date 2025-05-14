import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API_ENDPOINTS      from '../../../config/apiConfig';

import PlanDetails        from '../PlanDetails/PlanDetails';
import PlanItemsTable     from '../PlanItemsTable/PlanItemsTable';
import CreatePlanModal    from '../CreatePlanModal/CreatePlanModal';
import EditPlanModal      from '../EditPlanModal/EditPlanModal';

import './BudgetPlanPage.css';

const BudgetPlanPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const planIdFromQuery = searchParams.get('planId');

  const [plans, setPlans]             = useState([]);
  const [selectedPlan, setSelectedPlan]= useState(null);
  const [planItems, setPlanItems]     = useState([]);
  const [transactions, setTransactions]= useState([]);

  const [categoryMap, setCategoryMap] = useState({});
  const [currencyMap, setCurrencyMap] = useState({});

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen,   setEditOpen]   = useState(false);
  const [busyDel,    setBusyDel]    = useState(false);

  /* 1. список планов */
  useEffect(() => {
    (async()=>{
      try{
        const r = await fetch(API_ENDPOINTS.budgetPlans);
        if(!r.ok) throw new Error('Ошибка при загрузке планов');
        const data = await r.json();
        setPlans(data);
        if(!planIdFromQuery && data.length) setSearchParams({planId:data[0].id});
      }catch(e){ setError(e.message); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  /* 2. данные по выбранному плану */
  useEffect(()=>{
    if(!planIdFromQuery){ setSelectedPlan(null); return; }

    (async()=>{
      try{
        setLoading(true); setError(null);
        const [planRes,itemsRes] = await Promise.all([
          fetch(API_ENDPOINTS.budgetPlanById(planIdFromQuery)),
          fetch(API_ENDPOINTS.budgetPlanItemsByPlan(planIdFromQuery)),
        ]);
        if(!planRes.ok||!itemsRes.ok) throw new Error('Ошибка при загрузке плана');
        setSelectedPlan(await planRes.json());
        setPlanItems(await itemsRes.json());

        const trx = await fetch(API_ENDPOINTS.transactionsByPlan(planIdFromQuery)).then(r=>r.json());
        setTransactions(trx);

        const [cats,curs] = await Promise.all([
          fetch(API_ENDPOINTS.categories).then(r=>r.json()),
          fetch(API_ENDPOINTS.currencies).then(r=>r.json()),
        ]);
        const cm={}; cats.forEach(c=>cm[c.id]=c.title);
        const curm={}; curs.forEach(c=>curm[c.id]=c.symbol);
        setCategoryMap(cm); setCurrencyMap(curm);
      }catch(e){ setError(e.message); }
      finally{ setLoading(false); }
    })();
  },[planIdFromQuery]);

  /* 3. вычисление таблицы */
  const expenseTrx = transactions.filter(t=>t.type===2);
  const spentMap = expenseTrx.reduce((acc,t)=>{
    acc[t.categoryId]=(acc[t.categoryId]||0)+t.amount; return acc;
  },{});
  const itemsExt = planItems.map(i=>({
    ...i,
    spent: spentMap[i.categoryId]||0,
    remaining: i.amount-(spentMap[i.categoryId]||0)
  }));
  const categoriesInPlan=new Set(planItems.map(i=>i.categoryId));
  const spentOther=expenseTrx.filter(t=>!categoriesInPlan.has(t.categoryId))
        .reduce((s,t)=>s+t.amount,0);
  if(spentOther>0){
    itemsExt.push({
      id:'other',categoryId:'other',amount:'-',currencyId:planItems[0]?.currencyId||1,
      spent:spentOther,remaining:'-',description:'не вошедшие категории'
    });
    categoryMap.other='Остальное';
  }

  const deletePlan = async () => {
    if(!selectedPlan) return;
    if(!window.confirm('Удалить этот план?')) return;
    try{
      setBusyDel(true);
      const r = await fetch(API_ENDPOINTS.deleteBudgetPlan(selectedPlan.id), { method:'DELETE' });
      if(!r.ok) throw new Error('Ошибка удаления плана');
      // убираем из списка и сбрасываем выбор
      setPlans(p=>p.filter(pl=>pl.id!==selectedPlan.id));
      setSelectedPlan(null);
      setPlanItems([]);
      setSearchParams({});
    }catch(e){ alert(e.message); }
    finally{ setBusyDel(false); }
  };

  /* 4. рендер */
  if(loading) return <p className="loading">Загрузка...</p>;
  if(error)   return <p className="error">{error}</p>;

  return(
    <div className="budget-plan-page">
      {!plans.length && (
        <>
          <button className="create-btn" onClick={()=>setCreateOpen(true)}>+ новый план</button>
          <p className="no-plan-text">Планов пока нет…</p>
        </>
      )}

      {selectedPlan && (
        <div className="plan-details-wrapper">
          <PlanDetails plan={selectedPlan}/>
          <PlanItemsTable
            items={itemsExt}
            categoryMap={categoryMap}
            currencyMap={currencyMap}
          />

          {/* ——— действия над планом ——— */}
          <div className="plan-actions">
            <button className="edit-btn"    onClick={()=>setEditOpen(true)}>✎ редактировать</button>
            <button className="delete-btn"  onClick={deletePlan} disabled={busyDel}>
              {busyDel?'…':'✕ удалить'}
            </button>
            <button className="create-btn"  onClick={()=>setCreateOpen(true)}>+ новый</button>
          </div>
        </div>
      )}

      {/* модалки */}
      <CreatePlanModal
        isOpen={createOpen}
        onClose={()=>setCreateOpen(false)}
        onCreated={()=>window.location.reload()}
      />
      <EditPlanModal
        isOpen={editOpen}
        onClose={()=>setEditOpen(false)}
        plan={selectedPlan}
        items={planItems}
        categories={categoryMap}
        currencies={currencyMap}
        onSaved={()=>window.location.reload()}
      />
    </div>
  );
};

export default BudgetPlanPage;
