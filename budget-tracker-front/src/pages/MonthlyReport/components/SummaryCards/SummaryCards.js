import React from 'react';
import './SummaryCards.css';

const format = (n) => n.toLocaleString('uk-UA', { minimumFractionDigits: 2 });

const SummaryCards = ({ totalExp, totalInc, balance, defaultCurrency }) => (
  <div className="sc-wrapper">
    <div className="sc-card sc-red">
      <span className="sc-label">Всього витрачено</span>
      <span className="sc-value">
        {defaultCurrency}&nbsp;{format(totalExp)}
      </span>
    </div>

    <div className="sc-card sc-green">
      <span className="sc-label">Всього зароблено</span>
      <span className="sc-value">
        {defaultCurrency}&nbsp;{format(totalInc)}
      </span>
    </div>

    <div className="sc-card sc-blue">
      <span className="sc-label">Баланс</span>
      <span className="sc-value">
        {defaultCurrency}&nbsp;{format(balance)}
      </span>
    </div>
  </div>
);

export default SummaryCards;
