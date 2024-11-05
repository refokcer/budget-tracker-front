import React from 'react';
import TopExpenses from '../../components/TopExpenses/TopExpenses';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div class = "container">
      <h1>Dashboard</h1>
      <div class = "content">
        <TopExpenses class = "table" />
      </div>
    </div>
  );
};

export default Dashboard;
