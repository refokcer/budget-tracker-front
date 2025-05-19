import React from 'react';
import './TopTransactionCard.css';

const TopTransactionCard = ({ transaction, category, account, currency }) => (
  <div className="top-transaction card">
    <h4>Найбільша транзакція місяця</h4>
    <p className="title">{transaction.title}</p>
    <p><strong>Сума:</strong> {currency} {transaction.amount.toFixed(2)}</p>
    <p><strong>Категорія:</strong> {category}</p>
    <p><strong>Рахунок:</strong> {account}</p>
    <p><strong>Дата:</strong> {new Date(transaction.date).toLocaleDateString()}</p>
    {transaction.description && <p><strong>Опис:</strong> {transaction.description}</p>}
  </div>
);

export default TopTransactionCard;
