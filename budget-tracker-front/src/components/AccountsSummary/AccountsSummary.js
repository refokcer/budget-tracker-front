import React, { useState, useEffect } from 'react';
import data from '../../data/data.json';
import './AccountsSummary.css';

const AccountsSummary = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    setAccounts(data.accounts);
  }, []);

  const totalBalance = accounts.reduce((sum, account) => sum + account.amount, 0);

  return (
    <div className="accounts-summary">
      <h3>Accounts</h3>
      <ul className="accounts-list">
        {accounts.map((account, index) => (
          <li key={index} className="account-item">
            <span className="account-name">● {account.name}</span>
            <span className="account-amount">${account.amount.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="balance">
        <span className="balance-label">Balance</span>
        <span className="balance-amount">${totalBalance.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default AccountsSummary;
