import React from 'react';
import './TopTransactionCard.css';

const TopTransactionCard = ({ transaction, category, account, currency }) => {
  if (!transaction) return null;

  return (
    <div className="toptx-card">
      <div className="accent-bar" />

      <h4 className="card-title">Найбільша транзакція місяця</h4>

      <p className="tx-name">{transaction.title}</p>

      <p className="amount">
        {currency}&nbsp;{transaction.amount.toFixed(2)}
      </p>

      <div className="info-grid">
        <span className="label">Категорія:</span>
        <span className="value">{category || '—'}</span>

        <span className="label">Рахунок:</span>
        <span className="value">{account || '—'}</span>

        <span className="label">Дата:</span>
        <span className="value">
          {new Date(transaction.date).toLocaleDateString()}
        </span>
      </div>

      {transaction.description && (
        <>
          <hr />
          <p className="description">{transaction.description}</p>
        </>
      )}
    </div>
  );
};

export default TopTransactionCard;
