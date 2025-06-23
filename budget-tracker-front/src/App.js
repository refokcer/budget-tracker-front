import React from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard/DashboardPage/Dashboard';
import Expenses from './pages/Expenses/ExpensesPage/Expenses';
import Incomes from './pages/Incomes/IncomesPage/Incomes';
import BudgetPlanPage from './pages/BudgetPlan/BudgetPlanPage/BudgetPlanPage';
import styles from './App.module.css';
import TransfersPage from './pages/Transfers/TransfersPage/TransfersPage';
import SettingsPage from './pages/Settings/SettingsPage/SettingsPage';
import MonthlyReport from './pages/MonthlyReport/MonthlyReport'; // Adjust the path if needed

const App = () => {
  return (
    <Router>
      <div className={styles.app}>
        <Header />
        <div className={styles['main-content']}>
          <Sidebar />
          <main className={styles.content}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/incomes" element={<Incomes />} />
              <Route path="/budget-plans" element={<BudgetPlanPage />} />
              <Route path="/transfers" element={<TransfersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/report" element={<MonthlyReport />} />
              {/* Добавьте маршруты для других страниц */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
