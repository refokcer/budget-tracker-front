import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import DataTable from '../../../components/DataTable/DataTable';

const ExpensesTable = ({ month, year }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const url = API_ENDPOINTS.expensesTable(month, year);
        const res = await fetch(url);
        if (!res.ok) throw new Error('Помилка завантаження даних');
        const data = await res.json();
        setTransactions(data.transactions);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };

    fetchData();
  }, [month, year]);

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити транзакцію?')) return;
    try {
      setBusyId(id);
      const r = await fetch(API_ENDPOINTS.deleteTransaction(id), { method: 'DELETE' });
      if (!r.ok) throw new Error('Помилка видалення');
      setTransactions(p => p.filter(t => t.id !== id));
    } catch (e) { alert(e.message); }
    finally { setBusyId(null); }
  };

  /* ───── UI ───── */
  if (loading) return <p>Завантаження...</p>;
  if (error)   return <p className="error">Помилка: {error}</p>;

  const columns = [
    { key: 'title',       label: 'Назва',            sortable: true },
    { key: 'amount',      label: 'Сума',             sortable: true, render: (v,r) => `${r.currencySymbol} ${v.toFixed(2)}` },
    { key: 'categoryTitle', label: 'Категорія',      sortable: true },
    { key: 'accountTitle',  label: 'Рахунок',        sortable: true },
    { key: 'date',        label: 'Дата',             sortable: true, render: v => new Date(v).toLocaleDateString() },
    { key: 'description', label: 'Опис',                            render: v => v || '-' },
  ];

  return <DataTable columns={columns} rows={transactions} onDelete={handleDelete} deletingId={busyId} />;
};

export default ExpensesTable;
