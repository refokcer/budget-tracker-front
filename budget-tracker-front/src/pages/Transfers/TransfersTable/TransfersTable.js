import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import DataTable from '../../../components/DataTable/DataTable';

const TransfersTable = ({ startDate, endDate }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoad] = useState(true);
  const [error, setErr] = useState(null);
  const [busyId, setBusy] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoad(true); setErr(null);
      try {
        const url = API_ENDPOINTS.transfersTable(startDate, endDate);
        const res = await fetch(url);
        if (!res.ok) throw new Error('Помилка завантаження');
        const data = await res.json();
        setRows(data.transactions);
      } catch (e) { setErr(e.message); }
      finally { setLoad(false); }
    };
    load();
  }, [startDate, endDate]);

  const del = async (id) => {
    if (!window.confirm('Видалити?')) return;
    try {
      setBusy(id);
      const r = await fetch(API_ENDPOINTS.deleteTransaction(id), { method: 'DELETE' });
      if (!r.ok) throw new Error('Помилка видалення');
      setRows(p => p.filter(x => x.id !== id));
    } catch (e) { alert(e.message); }
    finally { setBusy(null); }
  };

  if (loading) return <p>Завантаження...</p>;
  if (error)   return <p className="error">Помилка: {error}</p>;

  const columns = [
    { key: 'title',       label: 'Назва',       sortable: true },
    { key: 'amount',      label: 'Сума',        sortable: true, render: (v,r) => `${r.currencySymbol} ${v.toFixed(2)}` },
    { key: 'accountFromTitle', label: 'З рахунку',   sortable: true },
    { key: 'accountToTitle',   label: 'На рахунок',  sortable: true },
    { key: 'date',        label: 'Дата',        sortable: true, render: v => new Date(v).toLocaleDateString() },
    { key: 'description', label: 'Опис',                       render: v => v || '-' },
  ];

  return <DataTable columns={columns} rows={rows} onDelete={del} deletingId={busyId} />;
};

export default TransfersTable;
// Expected model from API_ENDPOINTS.transfersTable(start,end):
// {
//   start: string,
//   end: string,
//   transactions: [
//     {
//       id: number,
//       title: string,
//       amount: number,
//       currencySymbol: string,
//       accountFromTitle: string,
//       accountToTitle: string,
//       date: string,
//       description?: string
//     }
//   ]
// }

