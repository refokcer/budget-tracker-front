import React from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Incomes from "./pages/Incomes";
import BudgetPlanPage from "./pages/BudgetPlan";
import styles from "./App.module.css";
import TransfersPage from "./pages/Transfers";
import SettingsPage from "./pages/Settings";
import MonthlyReport from "./pages/MonthlyReport";

const App = () => {
  return (
    <Router>
      <div className={styles.app}>
        <Header />
        <div className={styles["main-content"]}>
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
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
