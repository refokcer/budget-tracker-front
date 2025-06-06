import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import './ExpensesTable.css';

const ExpensesTable = ({ startDate, endDate }) => {
  const [transactions, setTransactions] = useState([]);
  const [currencies,   setCurrencies]   = useState({});
  const [categories,   setCategories]   = useState({});
  const [accounts,     setAccounts]     = useState({});
  const [sortConfig,   setSortConfig]   = useState({ key: null, direction: 'asc' });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [busyId,       setBusyId]       = useState(null);         // ← для індикації видалення

  /* завантаження даних при зміні місяця */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const trxUrl = API_ENDPOINTS.expensesByDate(startDate, endDate);
        const [transactionsRes, currenciesRes, categoriesRes, accountsRes] = await Promise.all([
          fetch(trxUrl),
          fetch(API_ENDPOINTS.currencies),
          fetch(API_ENDPOINTS.categories),
          fetch(API_ENDPOINTS.accounts),
        ]);

        if (!transactionsRes.ok || !currenciesRes.ok || !categoriesRes.ok || !accountsRes.ok) {
          throw new Error('Помилка завантаження даних');
        }

        const transactionsData = await transactionsRes.json();
        const currencyMap = Object.fromEntries((await currenciesRes.json()).map(c => [c.id, c.symbol]));
        const categoryMap = Object.fromEntries((await categoriesRes.json()).map(c => [c.id, c.title]));
        const accountMap  = Object.fromEntries((await accountsRes.json()).map(a => [a.id, a.title]));

        setTransactions(transactionsData);
        setCurrencies(currencyMap);
        setCategories(categoryMap);
        setAccounts(accountMap);
      } catch (err) { setError(err.message); }
      finally       { setLoading(false);    }
    };
    fetchData();
  }, [startDate, endDate]);

  /* сортування */
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valueA = a[sortConfig.key]; let valueB = b[sortConfig.key];
    if (sortConfig.key === 'date')   { valueA = new Date(valueA); valueB = new Date(valueB); }
    if (sortConfig.key === 'amount') { valueA = +valueA; valueB = +valueB; }
    if (sortConfig.key === 'title')  { valueA = valueA.toLowerCase(); valueB = valueB.toLowerCase(); }
    if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === 'asc' ?  1 : -1;
    return 0;
  });

  /* видалення транзакції */
  const handleDelete = async (id) => {
    if (!window.confirm('Видалити транзакцію?')) return;
    try {
      setBusyId(id);
      const res = await fetch(API_ENDPOINTS.deleteTransaction(id), { method:'DELETE' });
      if (!res.ok) throw new Error('Помилка видалення');
      setTransactions((prev)=>prev.filter(t=>t.id!==id));
    } catch (e) { alert(e.message); }
    finally { setBusyId(null); }
  };

  if (loading) return <p>Завантаження...</p>;
  if (error)   return <p className="error">Помилка: {error}</p>;

  return (
    <div className="expenses-table-container">
      <table className="expenses-table">
        <thead>
          <tr>
            <th onClick={()=>handleSort('title')}>Назва {sortConfig.key==='title'   ? (sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={()=>handleSort('amount')}>Сума {sortConfig.key==='amount'   ? (sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={()=>handleSort('categoryId')}>Категорія {sortConfig.key==='categoryId' ? (sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={()=>handleSort('accountFrom')}>Рахунок (Звідки) {sortConfig.key==='accountFrom' ? (sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={()=>handleSort('date')}>Дата {sortConfig.key==='date'     ? (sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th onClick={()=>handleSort('type')}>Тип {sortConfig.key==='type'     ? (sortConfig.direction==='asc'?'▲':'▼'):''}</th>
            <th>Опис</th>
            <th></th> {/* колонка видалення */}
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((t) => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>{currencies[t.currencyId] || ''} {t.amount.toFixed(2)}</td>
              <td>{categories[t.categoryId] || '—'}</td>
              <td>{accounts[t.accountFrom] || '-'}</td>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td>{t.type === 1 ? 'Дохід' : t.type === 2 ? 'Витрата' : 'Переказ'}</td>
              <td style={{maxWidth:'200px',wordWrap:'break-word'}}>{t.description || '-'}</td>
              <td>
                <button
                  className="del-btn"
                  disabled={busyId===t.id}
                  onClick={()=>handleDelete(t.id)}
                >
                  {busyId===t.id ? '…' : '✕'}
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
