// src/components/IncomeModal/IncomeModal.js

import React, { useState, useEffect } from 'react';
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

  // Получение данных с API при открытии окна
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const [currenciesRes, categoriesRes, accountsRes] = await Promise.all([
          fetch('https://localhost:7281/api/Currencies'),
          fetch('https://localhost:7281/api/Categories'),
          fetch('https://localhost:7281/api/Accounts')
        ]);

        if (!currenciesRes.ok || !categoriesRes.ok || !accountsRes.ok) {
          throw new Error('Ошибка загрузки данных');
        }

        const currenciesData = await currenciesRes.json();
        const categoriesData = await categoriesRes.json();
        const accountsData = await accountsRes.json();

        // Фильтруем категории с Type = 1 (Income)
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

  // Обработчик отправки данных
  const handleSubmit = async () => {
    if (!title || !amount || !currencyId || !categoryId || !accountTo) {
      alert('Заполните все поля!');
      return;
    }

    setLoading(true);
    setError(null);

    const newTransaction = {
      title,
      eventId: Number(2), // Временно захардкожено
      amount: parseFloat(amount),
      currencyId: parseInt(currencyId),
      categoryId: parseInt(categoryId),
      date: new Date().toISOString(), // Текущая дата
      accountTo: parseInt(accountTo),
      type: 1, // Тип всегда Income
      description
    };

    try {
        console.log(JSON.stringify(newTransaction, null, 2));

      const response = await fetch('https://localhost:7281/api/Transactions', {
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
          {currencies.map((currency) => (
            <option key={currency.id} value={currency.id}>
              {currency.symbol} ({currency.name})
            </option>
          ))}
        </select>

        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Выберите категорию</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>

        <select value={accountTo} onChange={(e) => setAccountTo(e.target.value)}>
          <option value="">Выберите счет</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.title}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Создание...' : 'Создать транзакцию'}
        </button>
        <button onClick={onClose} className="close-button">Отмена</button>
      </div>
    </div>
  );
};

export default IncomeModal;
