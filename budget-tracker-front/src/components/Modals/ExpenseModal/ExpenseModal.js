// ExpenseModal.js
import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../config/apiConfig';
import './ExpenseModal.css'; // Подключаем стили для модалки

// Жёстко прописанные эндпоинты (без отдельного файла конфигурации)
const CURRENCIES_ENDPOINT   = API_ENDPOINTS.currencies;
const CATEGORIES_ENDPOINT   = API_ENDPOINTS.categoriesExpenses;
const ACCOUNTS_ENDPOINT     = API_ENDPOINTS.accounts;
const Expense_ENDPOINT = API_ENDPOINTS.createExpense;

const ExpenseModal = ({ isOpen, onClose }) => {
  // Состояния для полей формы
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountFrom, setAccountFrom] = useState('');
  const [description, setDescription] = useState('');

  // Списки, которые будем загружать с бэкенда
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Служебные состояния
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Функция-обёртка для fetch-запросов, чтобы избежать дубликации кода
  const fetchJson = async (url) => {
    try {
      const response = await fetch(url);
      // Проверяем статус ответа: если он не в пределах 2xx, бросаем ошибку
      if (!response.ok) {
        throw new Error(`Ошибка при запросе: ${url}, статус: ${response.status}`);
      }
      // Распарсим тело ответа как JSON
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  // Загружаем данные, когда модалка открывается
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    const loadData = async () => {
      try {
        // Загружаем списки валют, категорий и счетов параллельно
        const [currenciesData, categoriesData, accountsData] = await Promise.all([
          fetchJson(CURRENCIES_ENDPOINT),
          fetchJson(CATEGORIES_ENDPOINT),
          fetchJson(ACCOUNTS_ENDPOINT),
        ]);

        // Запоминаем полученные данные в состояниях
        setCurrencies(currenciesData);
        setCategories(categoriesData);
        setAccounts(accountsData);
      } catch (err) {
        setError(err.message);
      }
    };

    loadData();

    document.addEventListener('keydown', handleKeyDown);

    // Удаляем обработчик при размонтировании/закрытии
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Отправка формы на создание новой транзакции (расхода)
  const handleSubmit = async () => {
    // Проверяем, что все нужные поля заполнены
    if (!title || !amount || !currencyId || !categoryId || !accountFrom) {
      alert('Заполните все поля!');
      return;
    }

    // Формируем объект новой транзакции
    const newTransaction = {
      title,
      amount: parseFloat(amount),
      accountFrom: parseInt(accountFrom),
      eventId: 2,          // Пример, подставьте своё значение, если нужно
      currencyId: parseInt(currencyId),
      categoryId: parseInt(categoryId),
      date: new Date().toISOString(), // Текущая дата
      type: 2,            // Предположим, что для расходов type = 2
      description
    };

    setLoading(true);
    setError(null);

    try {
      // Отправляем POST-запрос на сервер для создания транзакции
      const response = await fetch(Expense_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });

      // Если пришёл не «хороший» статус, сообщаем об ошибке
      if (!response.ok) {
        throw new Error(`Ошибка при создании транзакции. Статус: ${response.status}`);
      }

      // Если всё успешно, сообщаем об этом
      alert('Расход успешно добавлен!');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Если модалка не открыта, ничего не рендерим
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Добавить расход</h3>
        {/* Если есть ошибка, отображаем её текст */}
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

        <select
          value={currencyId}
          onChange={(e) => setCurrencyId(e.target.value)}
        >
          <option value="">Выберите валюту</option>
          {currencies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.symbol} ({c.name})
            </option>
          ))}
        </select>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Выберите категорию</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>

        <select
          value={accountFrom}
          onChange={(e) => setAccountFrom(e.target.value)}
        >
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

export default ExpenseModal;
