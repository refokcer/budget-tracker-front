import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Incomes from "./pages/Incomes";
import BudgetPlanPage from "./pages/BudgetPlan";
import TransfersPage from "./pages/Transfers";
import SettingsPage from "./pages/Settings";
import MonthlyReport from "./pages/MonthlyReport";
import { LoginPage, RegisterPage } from "./pages/Auth";
import ProtectedLayout from "./components/ProtectedLayout/ProtectedLayout";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/incomes" element={<Incomes />} />
          <Route path="/budget-plans" element={<BudgetPlanPage />} />
          <Route path="/transfers" element={<TransfersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/report" element={<MonthlyReport />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
