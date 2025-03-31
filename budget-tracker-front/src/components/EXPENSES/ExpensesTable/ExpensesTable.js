import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import './ExpensesTable.css';

const ExpensesTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [currencies, setCurrencies] = useState({});
  const [categories, setCategories] = useState({});
  const [accounts, setAccounts] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsRes, currenciesRes, categoriesRes, accountsRes] = await Promise.all([
          fetch(API_ENDPOINTS.expenses),
          fetch(API_ENDPOINTS.currencies),
          fetch(API_ENDPOINTS.categories),
          fetch(API_ENDPOINTS.accounts),
        ]);

        if (!transactionsRes.ok || !currenciesRes.ok || !categoriesRes.ok || !accountsRes.ok) {
          throw new Error('Ошибка загрузки данных');
        }

        const transactionsData = await transactionsRes.json();
        const currenciesData = await currenciesRes.json();
        const categoriesData = await categoriesRes.json();
        const accountsData = await accountsRes.json();

        const currencyMap = Object.fromEntries(currenciesData.map(c => [c.id, c.symbol]));
        const categoryMap = Object.fromEntries(categoriesData.map(c => [c.id, c.title]));
        const accountMap = Object.fromEntries(accountsData.map(a => [a.id, a.title]));

        setTransactions(transactionsData);
        setCurrencies(currencyMap);
        setCategories(categoryMap);
        setAccounts(accountMap);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Функция сортировки
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Применяем сортировку к данным
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valueA = a[sortConfig.key];
    let valueB = b[sortConfig.key];

    if (sortConfig.key === 'date') {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    } else if (sortConfig.key === 'amount') {
      valueA = parseFloat(valueA);
      valueB = parseFloat(valueB);
    } else if (sortConfig.key === 'title') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="error">Ошибка: {error}</p>;

  return (
    <div className="expenses-table-container">
      <table className="expenses-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('title')}>Название {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
            <th onClick={() => handleSort('amount')}>Сумма {sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
            <th onClick={() => handleSort('categoryId')}>Категория {sortConfig.key === 'categoryId' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
            <th onClick={() => handleSort('accountFrom')}>Счет (Откуда) {sortConfig.key === 'accountFrom' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
            <th onClick={() => handleSort('date')}>Дата {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
            <th onClick={() => handleSort('type')}>Тип {sortConfig.key === 'type' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
            <th>Описание</th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.title}</td>
              <td>
                {currencies[transaction.currencyId] || ''} {transaction.amount.toFixed(2)}
              </td>
              <td>{categories[transaction.categoryId] || 'Неизвестно'}</td>
              <td>{accounts[transaction.accountFrom] || '-'}</td>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>{transaction.type === 1 ? 'Income' : transaction.type === 2 ? 'Expense' : 'Transaction'}</td>
              <td style={{ maxWidth: '200px', wordWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                {transaction.description || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpensesTable;
