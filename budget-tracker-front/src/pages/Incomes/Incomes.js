import React from 'react';
import './Incomes.css';
import IncomesTable from '../../components/IncomesTable/IncomesTable';

const Incomes = () => {
  return (
    <div className="container">
    <div className="content">
      <h1>Транзакции</h1>
      <IncomesTable />
    </div>
  </div>
  );
};

export default Incomes;
