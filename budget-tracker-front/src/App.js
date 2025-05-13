import React from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard/DashboardPage/Dashboard';
import Expenses from './pages/Expenses/ExpensesPage/Expenses';
import Incomes from './pages/Incomes/IncomesPage/Incomes';
import BudgetPlanPage from './pages/BudgetPlan/BudgetPlanPage/BudgetPlanPage';
import './App.css';
import TransfersPage from './pages/Transfers/TransfersPage/TransfersPage';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <div className="main-content">
          <Sidebar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/incomes" element={<Incomes />} />
              <Route path="/budget-plans" element={<BudgetPlanPage />} />
              <Route path="/transfers" element={<TransfersPage />} />
              {/* Добавьте маршруты для других страниц */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
