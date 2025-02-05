import React, { useState, useEffect } from 'react';
import './AccountsSummary.css';

import {
  ClientSideRowModelModule,
  ModuleRegistry,
  NumberEditorModule,
  NumberFilterModule,
  TextEditorModule,
  TextFilterModule,
  ValidationModule,
  colorSchemeDarkBlue,
  themeQuartz,
  PinnedRowModule
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

ModuleRegistry.registerModules([
  TextEditorModule,
  TextFilterModule,
  NumberFilterModule,
  NumberEditorModule,
  ClientSideRowModelModule,
  PinnedRowModule,
  ValidationModule /* Development Only */,
]);

const themeDarkBlue = themeQuartz.withPart(colorSchemeDarkBlue);

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

  const columnDefs = [
    { headerName: 'Account', field: 'title', flex: 1 },
    { 
      headerName: 'Amount', 
      field: 'amount', 
      flex: 1,
      cellRenderer: (params) => {
        const symbol = currencies[params.data.currencyId] || '';
        return `${symbol} ${params.value.toFixed(2)}`;
      }
    }
  ];

  const pinnedBottomRowData = [
    { title: 'Total Balance', amount: totalBalance, currencyId: accounts[0]?.currencyId }
  ];

  // Пример возвращаемого JSX
  return (
    <div style={{ height: "400px", width: '600px', display: "flex", flexDirection: "column" }}>
        {
          <AgGridReact
            theme={themeDarkBlue}
            columnDefs={columnDefs}
            rowData={accounts}
            pinnedBottomRowData={pinnedBottomRowData}
            defaultColDef={defaultColDef}
          />
        }
    </div>
  );
};

const defaultColDef = {
  editable: true,
  flex: 1,
  minWidth: 100,
  filter: true,
};

export default AccountsSummary;
