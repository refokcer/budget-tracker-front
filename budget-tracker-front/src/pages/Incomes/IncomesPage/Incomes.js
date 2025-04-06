import React from 'react';
import './Incomes.css';
import IncomesTable from '../IncomesTable/IncomesTable';

const Incomes = () => {
  return (
    <div className="container">
    <div className="content">
      <IncomesTable />
    </div>
  </div>
  );
};

export default Incomes;
