import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import './ExpenseModal.css';

const ExpenseModal = ({ isOpen, onClose }) => {
  // Поля формы
  const [title,         setTitle]        = useState('');
  const [amount,        setAmount]       = useState('');
  const [currencyId,    setCurrencyId]   = useState('');
  const [categoryId,    setCategoryId]   = useState('');
  const [accountFrom,   setAccountFrom]  = useState('');
  const [budgetPlanId,  setBudgetPlanId] = useState('');  // ← новое
  const [description,   setDescription]  = useState('');

  // Списки для селектов
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts,   setAccounts]   = useState([]);
  const [plans,      setPlans]      = useState([]);      // ← новое

  // Служебные состояния
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  // Обёртка fetch → JSON
  const fetchJson = async (url) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Ошибка при запросе ${url}: ${r.status}`);
    return r.json();
  };

  // Загрузка справочников при открытии модалки
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
          fetchJson(API_ENDPOINTS.budgetPlans),    // ← план бюджета
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

  // Отправка формы
  const handleSubmit = async () => {
    if (!title || !amount || !currencyId || !categoryId || !accountFrom || !budgetPlanId) {
      alert('Заполните все поля!');
      return;
    }

    const newTransaction = {
      title,
      amount:       parseFloat(amount),
      accountFrom:  parseInt(accountFrom),
      budgetPlanId: parseInt(budgetPlanId), // ← используем выбранный план
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
      alert('Расход успешно добавлен!');
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Добавить расход</h3>
        {error && <p className="error">{error}</p>}

        <input
          type="text"
          placeholder="Название"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Сумма"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />

        <select value={currencyId} onChange={e => setCurrencyId(e.target.value)}>
          <option value="">Выберите валюту</option>
          {currencies.map(c => (
            <option key={c.id} value={c.id}>
              {c.symbol} ({c.name})
            </option>
          ))}
        </select>

        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">Выберите категорию</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>

        <select value={accountFrom} onChange={e => setAccountFrom(e.target.value)}>
          <option value="">Выберите счёт</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.title}
            </option>
          ))}
        </select>

        <select value={budgetPlanId} onChange={e => setBudgetPlanId(e.target.value)}>
          <option value="">Выберите план бюджета</option>
          {plans.map(pl => (
            <option key={pl.id} value={pl.id}>
              {pl.title}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Описание"
          value={description}
          onChange={e => setDescription(e.target.value)}
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

export default ExpenseModal;
