import React from 'react';
import TopExpenses from '../TopExpenses/TopExpenses';
import './Dashboard.css';
import AccountsSummary from '../AccountsSummary/AccountsSummary';

const Dashboard = () => {
  return (
    <div class = "container">
      <div class = "dashboard-content">
        <AccountsSummary />
        <TopExpenses class = "table" />
      </div>
    </div>
  );
};

export default Dashboard;
