import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../../config/apiConfig";
import AccountsCard from "../components/AccountsCard/AccountsCard";
import TopExpensesCard from "../components/TopExpensesCard/TopExpensesCard";
import TopIncomesCard from "../components/TopIncomesCard/TopIncomesCard";
import BiggestTransactionCard from "../components/BiggestTransactionCard/BiggestTransactionCard";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.dashboardPage);
        if (!res.ok) throw new Error("Помилка завантаження");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className={styles["db-loading"]}>Завантаження…</p>;
  if (error) return <p className={styles["db-error"]}>{error}</p>;
  if (!data) return null;

  const {
    accounts,
    totalBalance,
    topExpenses,
    topIncomes,
    biggestTransaction,
  } = data;

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
