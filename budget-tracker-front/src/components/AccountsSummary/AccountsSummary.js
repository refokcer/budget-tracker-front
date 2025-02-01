import React, { useState, useEffect } from 'react';
import './AccountsSummary.css';

const AccountsSummary = () => {
  const [accounts, setAccounts] = useState([]);
  const [currencies, setCurrencies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('https://localhost:7281/api/Accounts');
        if (!response.ok) {
          throw new Error(`Ошибка загрузки аккаунтов: ${response.status}`);
        }
        const accountsData = await response.json();
        setAccounts(accountsData);

        // Получаем уникальные CurrencyId
        const currencyIds = [...new Set(accountsData.map(account => account.currencyId))];

        // Запрашиваем валютные символы для каждой уникальной валюты
        const currencyPromises = currencyIds.map(async (id) => {
          const currencyResponse = await fetch(`https://localhost:7281/api/Currencies/${id}`);
          if (!currencyResponse.ok) {
            throw new Error(`Ошибка загрузки валюты ${id}: ${currencyResponse.status}`);
          }
          const currencyData = await currencyResponse.json();
          return { id, symbol: currencyData.symbol };
        });

        // Ждем все запросы и формируем объект { currencyId: symbol }
        const currenciesData = await Promise.all(currencyPromises);
        const currencyMap = {};
        currenciesData.forEach(({ id, symbol }) => {
          currencyMap[id] = symbol;
        });

        setCurrencies(currencyMap);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="error">Ошибка: {error}</p>;

  const totalBalance = accounts.reduce((sum, account) => sum + account.amount, 0);

  return (
    <div className="accounts-summary">
      <h3>Accounts</h3>
      <ul className="accounts-list">
        {accounts.map((account) => (
          <li key={account.id} className="account-item">
            <span className="account-name">● {account.title}</span>
            <span className="account-amount">
              {currencies[account.currencyId] || ''} {account.amount.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
      <div className="balance">
        <span className="balance-label">Balance</span>
        <span className="balance-amount">
          {currencies[accounts[0]?.currencyId] || ''} {totalBalance.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default AccountsSummary;
