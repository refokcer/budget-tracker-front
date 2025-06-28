// src/pages/Dashboard/Dashboard.js
import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../../config/apiConfig";
import AccountsCard from "../components/AccountsCard/AccountsCard";
import TopExpensesCard from "../components/TopExpensesCard/TopExpensesCard";
import TopIncomesCard from "../components/TopIncomesCard/TopIncomesCard";
import BiggestTransactionCard from "../components/BiggestTransactionCard/BiggestTransactionCard";
import styles from "./Dashboard.module.css";

/* YYYY-MM-DD */
const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const Dashboard = () => {
  /* стани */
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* межі поточного місяця */
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const startStr = fmt(monthStart);
  const endStr = fmt(monthEnd);

  /* fetch */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          API_ENDPOINTS.dashboardPage(startStr, endStr)
        );
        if (!res.ok) throw new Error("Помилка завантаження");
        const data = await res.json();
        setData(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* агрегати */
  if (!data) return <p className={styles["db-loading"]}>Завантаження…</p>;

  const { accounts, totalBalance, topExpenses, topIncomes, biggestTransaction } = data;

  /* render */
  if (loading) return <p className={styles["db-loading"]}>Завантаження…</p>;
  if (error) return <p className={styles["db-error"]}>{error}</p>;

  return (
    <div className={styles["db-container"]}>
      <div className={styles["db-grid"]}>
        <AccountsCard accounts={accounts} totalBalance={totalBalance} />

        <TopExpensesCard items={topExpenses} />

        <TopIncomesCard items={topIncomes} />

        <BiggestTransactionCard transaction={biggestTransaction} />
      </div>
    </div>
  );
};

export default Dashboard;
// Expected model from API_ENDPOINTS.dashboardPage(start,end):
// {
//   accounts: [{ id, title, amount, currencySymbol }],
//   totalBalance: number,
//   topExpenses: [{ categoryTitle, amount, percent }],
//   topIncomes: [{ categoryTitle, amount, percent }],
//   biggestTransaction: { title, amount, currencySymbol, date }
// }
