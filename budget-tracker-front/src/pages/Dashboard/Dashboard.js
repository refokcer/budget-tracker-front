import React from 'react';
import TopExpenses from '../../components/DASHBOARD/TopExpenses/TopExpenses';
import './Dashboard.css';
import AccountsSummary from '../../components/DASHBOARD/AccountsSummary/AccountsSummary';

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
