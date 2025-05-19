import React from 'react';
import './SummaryCards.css';

const format = n => n.toLocaleString('uk-UA');

const SummaryCards = ({ totalExp, totalInc, balance, defaultCurrency }) => (
  <div className="summary-cards">
    <div className="summary-card red">
      <span className="label">Всього витрачено</span>
      <span className="value">{defaultCurrency} {format(totalExp)}</span>
    </div>
    <div className="summary-card green">
      <span className="label">Всього зароблено</span>
      <span className="value">{defaultCurrency} {format(totalInc)}</span>
    </div>
    <div className="summary-card blue">
      <span className="label">Баланс</span>
      <span className="value">{defaultCurrency} {format(balance)}</span>
    </div>
  </div>
);

export default SummaryCards;
