import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import styles from './ExpenseModal.module.css';

const ExpenseModal = ({ isOpen, onClose }) => {
  const [title,         setTitle]        = useState('');
  const [amount,        setAmount]       = useState('');
  const [currencyId,    setCurrencyId]   = useState('');
  const [categoryId,    setCategoryId]   = useState('');
  const [accountFrom,   setAccountFrom]  = useState('');
  const [budgetPlanId,  setBudgetPlanId] = useState('');  
  const [description,   setDescription]  = useState('');

  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts,   setAccounts]   = useState([]);
  const [plans,      setPlans]      = useState([]);  

  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchJson = async (url) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Помилка при запиті ${url}: ${r.status}`);
    return r.json();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const load = async () => {
      try {
        const [cur, cat, acc, pl] = await Promise.all([
          fetchJson(API_ENDPOINTS.currencies),
          fetchJson(API_ENDPOINTS.categoriesExpenses),
          fetchJson(API_ENDPOINTS.accounts),
          fetchJson(API_ENDPOINTS.budgetPlans), 
        ]);
        setCurrencies(cur);
        setCategories(cat);
        setAccounts(acc);
        setPlans(pl);
      } catch (e) {
        setError(e.message);
      }
    };

    load();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!title || !amount || !currencyId || !categoryId || !accountFrom || !budgetPlanId) {
      alert('Заповніть усі поля!');
      return;
    }

    const newTransaction = {
      title,
      amount:       parseFloat(amount),
      accountFrom:  parseInt(accountFrom),
      budgetPlanId: parseInt(budgetPlanId),
      currencyId:   parseInt(currencyId),
      categoryId:   parseInt(categoryId),
      date:         new Date().toISOString(),
      description,
    };

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.createExpense, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      });
      if (!res.ok) throw new Error(`Статус ${res.status}`);
      alert('Done!');
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <h3>Добавить расход</h3>
        {error && <p className={styles.error}>{error}</p>}

        <input
          type="text"
          placeholder="Назва"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Сума"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />

        <select value={currencyId} onChange={e => setCurrencyId(e.target.value)}>
          <option value="">Оберіть валюту</option>
          {currencies.map(c => (
            <option key={c.id} value={c.id}>
              {c.symbol} ({c.name})
            </option>
          ))}
        </select>

        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">Оберіть категорію</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>

        <select value={accountFrom} onChange={e => setAccountFrom(e.target.value)}>
          <option value="">Оберіть рахунок</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.title}
            </option>
          ))}
        </select>

        <select value={budgetPlanId} onChange={e => setBudgetPlanId(e.target.value)}>
          <option value="">Оберіть план</option>
          {plans.map(pl => (
            <option key={pl.id} value={pl.id}>
              {pl.title}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Опис"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={styles['submit-button']}
        >
          {loading ? 'Creating...' : 'Створити транзакцію'}
        </button>
        <button onClick={onClose} className={styles['close-button']}>
          Відмінити
        </button>
      </div>
    </div>
  );
};

export default ExpenseModal;
