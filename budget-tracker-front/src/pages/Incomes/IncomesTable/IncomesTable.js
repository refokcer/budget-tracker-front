import { useState, useEffect, useRef } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import DataTable from '../../../components/DataTable/DataTable';
import IncomeModal from '../../../components/Modals/IncomeModal/IncomeModal';

const IncomesTable = ({ month, year }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [busyId,       setBusyId]       = useState(null);
  const [editTx, setEditTx] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const reloadRef = useRef(() => {});

  useEffect(()=>{
    const fetchData = async ()=>{
      setLoading(true); setError(null);
      try{
        const url = API_ENDPOINTS.incomesTable(month, year);
        const res = await fetch(url);
        if(!res.ok) throw new Error('Помилка завантаження');
        const data = await res.json();
        setTransactions(data.transactions);
      }catch(e){ setError(e.message); }
      finally{ setLoading(false); }
    };
    fetchData();
    reloadRef.current = fetchData;
  },[month,year]);

  const rows = transactions;

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

  const handleEdit = async (id) => {
    try {
      const res = await fetch(API_ENDPOINTS.transactionById(id));
      if (!res.ok) throw new Error('Помилка завантаження');
      setEditTx(await res.json());
      setEditOpen(true);
    } catch (e) {
      alert(e.message);
    }
  };

  if(loading) return <p>Завантаження...</p>;
  if(error)   return <p className="error">Помилка: {error}</p>;

  const columns = [
    { key: 'title',         label: 'Назва',            sortable: true },
    { key: 'amount',        label: 'Сума',             sortable: true, render: (v,r) => `${r.currencySymbol} ${v.toFixed(2)}` },
    { key: 'categoryTitle', label: 'Категорія',        sortable: true },
    { key: 'accountTitle',  label: 'Рахунок',          sortable: true },
    { key: 'date',          label: 'Дата',             sortable: true, render: v => new Date(v).toLocaleDateString() },
    { key: 'description',   label: 'Опис',             render: v => v || '-' },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        onDelete={del}
        deletingId={busyId}
        onEdit={handleEdit}
      />
      <IncomeModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        transaction={editTx}
        onSaved={() => reloadRef.current()}
      />
    </>
  );
};

export default IncomesTable;
