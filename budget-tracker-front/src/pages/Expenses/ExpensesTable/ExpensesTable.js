import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import './ExpensesTable.css';

/* util YYYY-MM-DD → {y,m} */
const ymFromStr = (s) => {
  const d = new Date(s);
  return { y: d.getFullYear(), m: d.getMonth() + 1 }; // JS month 0-based
};

const ExpensesTable = ({ startDate, endDate }) => {
  const [transactions, setTransactions] = useState([]);
  const [sortConfig,   setSortConfig]   = useState({ key: null, direction: 'asc' });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [busyId,       setBusyId]       = useState(null); // показник видалення

  /* ───── завантаження при зміні місяця ───── */
  useEffect(() => {
    const { y, m } = ymFromStr(startDate); // визначаємо рік / місяць

    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const url = `https://localhost:7281/api/pages/expensesByMonth/${m}?year=${y}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Помилка завантаження даних');

        const dto = await res.json();         // {start, end, transactions:[…]}
        setTransactions(dto.transactions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  /* ───── сортування ───── */
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let vA = a[sortConfig.key];
    let vB = b[sortConfig.key];

    if (sortConfig.key === 'date')   { vA = new Date(vA); vB = new Date(vB); }
    if (sortConfig.key === 'amount') { vA = +vA;          vB = +vB;          }
    if (sortConfig.key === 'title')  { vA = vA.toLowerCase(); vB = vB.toLowerCase(); }

    if (vA < vB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (vA > vB) return sortConfig.direction === 'asc' ?  1 : -1;
    return 0;
  });

  /* ───── видалення ───── */
  const handleDelete = async (id) => {
    if (!window.confirm('Видалити транзакцію?')) return;
    try {
      setBusyId(id);
      const res = await fetch(API_ENDPOINTS.deleteTransaction(id), { method: 'DELETE' });
      if (!res.ok) throw new Error('Помилка видалення');
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  /* ───── UI ───── */
  if (loading) return <p>Завантаження...</p>;
  if (error)   return <p className="error">Помилка: {error}</p>;

  return (
    <div className="expenses-table-container">
      <table className="expenses-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('title')}>Назва {sortConfig.key==='title'   ? (sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={() => handleSort('amount')}>Сума {sortConfig.key==='amount'   ? (sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={() => handleSort('categoryTitle')}>Категорія {sortConfig.key==='categoryTitle' ? (sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={() => handleSort('accountTitle')}>Рахунок (Звідки) {sortConfig.key==='accountTitle' ? (sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={() => handleSort('date')}>Дата {sortConfig.key==='date'     ? (sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th>Опис</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((t) => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>{t.currencySymbol}&nbsp;{t.amount.toFixed(2)}</td>
              <td>{t.categoryTitle || '—'}</td>
              <td>{t.accountTitle  || '-'}</td>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                {t.description || '-'}
              </td>
              <td>
                <button
                  className="del-btn"
                  disabled={busyId === t.id}
                  onClick={() => handleDelete(t.id)}
                >
                  {busyId === t.id ? '…' : '✕'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpensesTable;
