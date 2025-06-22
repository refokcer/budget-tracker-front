import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import DataTable from '../../../components/DataTable/DataTable';

const ExpensesTable = ({ startDate, endDate }) => {
  const [transactions, setTransactions] = useState([]);
  const [currencies, setCurrencies] = useState({});
  const [categories, setCategories] = useState({});
  const [accounts, setAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const url = API_ENDPOINTS.expensesByDate(startDate, endDate);
        const [tr, curr, cat, acc] = await Promise.all([
          fetch(url),
          fetch(API_ENDPOINTS.currencies),
          fetch(API_ENDPOINTS.categories),
          fetch(API_ENDPOINTS.accounts),
        ]);
        if (!tr.ok || !curr.ok || !cat.ok || !acc.ok) throw new Error('Помилка завантаження даних');
        const currencyMap = Object.fromEntries((await curr.json()).map(c => [c.id, c.symbol]));
        const categoryMap = Object.fromEntries((await cat.json()).map(c => [c.id, c.title]));
        const accountMap  = Object.fromEntries((await acc.json()).map(a => [a.id, a.title]));
        setTransactions(await tr.json());
        setCurrencies(currencyMap); setCategories(categoryMap); setAccounts(accountMap);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [startDate, endDate]);

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

  if (loading) return <p>Завантаження...</p>;
  if (error)   return <p className="error">Помилка: {error}</p>;

  const columns = [
    { key: 'title',       label: 'Назва',            sortable: true },
    { key: 'amount',      label: 'Сума',             sortable: true, render: (v,r) => `${currencies[r.currencyId] || ''} ${v.toFixed(2)}` },
    { key: 'categoryId',  label: 'Категорія',        sortable: true, render: v => categories[v] || '—' },
    { key: 'accountFrom', label: 'Рахунок (Звідки)', sortable: true, render: v => accounts[v] || '-' },
    { key: 'date',        label: 'Дата',             sortable: true, render: v => new Date(v).toLocaleDateString() },
    { key: 'type',        label: 'Тип',              sortable: true, render: v => v === 1 ? 'Дохід' : v === 2 ? 'Витрата' : 'Переказ' },
    { key: 'description', label: 'Опис',                            render: v => v || '-' },
  ];

  return <DataTable columns={columns} rows={transactions} onDelete={handleDelete} deletingId={busyId} />;
};

export default ExpensesTable;
