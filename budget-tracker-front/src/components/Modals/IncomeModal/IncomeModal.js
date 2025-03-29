// src/components/IncomeModal/IncomeModal.js
import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import './IncomeModal.css';

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

    const fetchData = async () => {
      try {
        const [currenciesRes, categoriesRes, accountsRes] = await Promise.all([
          fetch(API_ENDPOINTS.currencies),
          fetch(API_ENDPOINTS.categories),
          fetch(API_ENDPOINTS.accounts)
        ]);

        if (!currenciesRes.ok || !categoriesRes.ok || !accountsRes.ok) {
          throw new Error('Ошибка загрузки данных');
        }

        const currenciesData = await currenciesRes.json();
        const categoriesData = await categoriesRes.json();
        const accountsData = await accountsRes.json();

        // Фильтруем категории только типа Income
        const filteredCategories = categoriesData.filter(cat => cat.type === 1);

        setCurrencies(currenciesData);
        setCategories(filteredCategories);
        setAccounts(accountsData);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!title || !amount || !currencyId || !categoryId || !accountTo) {
      alert('Заполните все поля!');
      return;
    }

    setLoading(true);
    setError(null);

    const newTransaction = {
      title,
      eventId: 2, // пример
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
        throw new Error('Ошибка при создании транзакции');
      }

      alert('Транзакция успешно добавлена!');
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Добавить доход</h3>
        {error && <p className="error">{error}</p>}

        <input
          type="text"
          placeholder="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Сумма"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select value={currencyId} onChange={(e) => setCurrencyId(e.target.value)}>
          <option value="">Выберите валюту</option>
          {currencies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.symbol} ({c.name})
            </option>
          ))}
        </select>

        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Выберите категорию</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>

        <select value={accountTo} onChange={(e) => setAccountTo(e.target.value)}>
          <option value="">Выберите счёт</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.title}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="submit-button"
        >
          {loading ? 'Создание...' : 'Создать транзакцию'}
        </button>
        <button onClick={onClose} className="close-button">
          Отмена
        </button>
      </div>
    </div>
  );
};

export default IncomeModal;
