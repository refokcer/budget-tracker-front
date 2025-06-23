// src/components/IncomeModal/IncomeModal.js
import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import styles from './IncomeModal.module.css';

const IncomeModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountTo, setAccountTo] = useState('');
  const [description, setDescription] = useState('');
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    const fetchData = async () => {
      try {
        const [currenciesRes, categoriesRes, accountsRes] = await Promise.all([
          fetch(API_ENDPOINTS.currencies),
          fetch(API_ENDPOINTS.categoriesIncomes),
          fetch(API_ENDPOINTS.accounts),
        ]);

        if (!currenciesRes.ok || !categoriesRes.ok || !accountsRes.ok) {
          throw new Error('Помилка завантаження даних');
        }

        const currenciesData = await currenciesRes.json();
        const categoriesData = await categoriesRes.json();
        const accountsData = await accountsRes.json();

        setCurrencies(currenciesData);
        setCategories(categoriesData);
        setAccounts(accountsData);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();

    document.addEventListener('keydown', handleKeyDown);

    // Видаляємо обробник при розмонтуванні/закритті
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!title || !amount || !currencyId || !categoryId || !accountTo) {
      alert('Заповніть всі поля!');
      return;
    }

    setLoading(true);
    setError(null);

    const newTransaction = {
      title,
      amount: parseFloat(amount),
      currencyId: parseInt(currencyId),
      categoryId: parseInt(categoryId),
      date: new Date().toISOString(),
      accountTo: parseInt(accountTo),
      type: 1, // Income
      description
    };

    try {
        console.log(JSON.stringify(newTransaction, null, 2));

        const response = await fetch(API_ENDPOINTS.createIncome, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });

      if (!response.ok) {
        throw new Error('Помилка при створенні транзакції');
      }

      alert('Транзакцію успішно додано!');
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <h3>Додати дохід</h3>
        {error && <p className={styles.error}>{error}</p>}

        <input
          type="text"
          placeholder="Назва"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Сума"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select value={currencyId} onChange={(e) => setCurrencyId(e.target.value)}>
          <option value="">Оберіть валюту</option>
          {currencies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.symbol} ({c.name})
            </option>
          ))}
        </select>

        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Оберіть категорію</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>

        <select value={accountTo} onChange={(e) => setAccountTo(e.target.value)}>
          <option value="">Оберіть рахунок</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.title}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Опис"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={styles['submit-button']}
        >
          {loading ? 'Створення...' : 'Створити транзакцію'}
        </button>
        <button onClick={onClose} className={styles['close-button']}>
          Скасувати
        </button>
      </div>
    </div>
  );
};

export default IncomeModal;
