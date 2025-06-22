import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import DataTable from '../../../components/DataTable/DataTable';

const TransfersTable = ({ startDate, endDate }) => {
  const [rows, setRows] = useState([]);
  const [currencies, setCurrencies] = useState({});
  const [accounts, setAccounts] = useState({});
  const [loading, setLoad] = useState(true);
  const [error, setErr] = useState(null);
  const [busyId, setBusy] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoad(true); setErr(null);
      try {
        const url = API_ENDPOINTS.transfersByDate(startDate, endDate);
        const [t,c,a] = await Promise.all([
          fetch(url),
          fetch(API_ENDPOINTS.currencies),
          fetch(API_ENDPOINTS.accounts)
        ]);
        if (!t.ok || !c.ok || !a.ok) throw new Error('Помилка завантаження');
        setRows(await t.json());
        setCurrencies(Object.fromEntries((await c.json()).map(x => [x.id, x.symbol])));
        setAccounts(Object.fromEntries((await a.json()).map(x => [x.id, x.title])));
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
    { key: 'amount',      label: 'Сума',        sortable: true, render: (v,r) => `${currencies[r.currencyId] || ''} ${v.toFixed(2)}` },
    { key: 'accountFrom', label: 'З рахунку',   sortable: true, render: v => accounts[v] || '-' },
    { key: 'accountTo',   label: 'На рахунок',  sortable: true, render: v => accounts[v] || '-' },
    { key: 'date',        label: 'Дата',        sortable: true, render: v => new Date(v).toLocaleDateString() },
    { key: 'description', label: 'Опис',                       render: v => v || '-' },
  ];

  return <DataTable columns={columns} rows={rows} onDelete={del} deletingId={busyId} />;
};

export default TransfersTable;
