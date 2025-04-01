import React from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Expenses from './pages/Expenses/Expenses';
import Incomes from './pages/Incomes/Incomes';
import BudgetPlanPage from './pages/BudgetPlan/BudgetPlanPage';
import './App.css';

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
              {/* Добавьте маршруты для других страниц */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
