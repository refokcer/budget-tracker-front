import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../../config/apiConfig";
import AccountsCard from "../components/AccountsCard/AccountsCard";
import TopExpensesCard from "../components/TopExpensesCard/TopExpensesCard";
import TopIncomesCard from "../components/TopIncomesCard/TopIncomesCard";
import BiggestTransactionCard from "../components/BiggestTransactionCard/BiggestTransactionCard";
import FinancialStabilityCard from "../components/FinancialStabilityCard/FinancialStabilityCard";
import {
  DASHBOARD_CARDS_EVENT,
  readVisibleDashboardCards,
} from "../dashboardCardConfig";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCards, setVisibleCards] = useState(readVisibleDashboardCards);

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

  useEffect(() => {
    const handleCardsChange = (event) => {
      setVisibleCards(event.detail || readVisibleDashboardCards());
    };

    window.addEventListener(DASHBOARD_CARDS_EVENT, handleCardsChange);
    return () =>
      window.removeEventListener(DASHBOARD_CARDS_EVENT, handleCardsChange);
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
    financialStability,
  } = data;

  const cards = [
    {
      id: "accounts",
      label: "Accounts",
      render: () => (
        <AccountsCard accounts={accounts || []} totalBalance={totalBalance || 0} />
      ),
    },
    {
      id: "topExpenses",
      label: "Top Expenses",
      render: () => <TopExpensesCard items={topExpenses || []} />,
    },
    {
      id: "topIncomes",
      label: "Top Incomes",
      render: () => <TopIncomesCard items={topIncomes || []} />,
    },
    {
      id: "biggestTransaction",
      label: "Biggest Transaction",
      render: () => <BiggestTransactionCard transaction={biggestTransaction} />,
    },
    {
      id: "financialStability",
      label: "Financial Stability",
      render: () => <FinancialStabilityCard stability={financialStability} />,
    },
  ];

  return (
    <div className={styles["db-container"]}>
      <div className={styles["db-grid"]}>
        {cards
          .filter((card) => visibleCards.includes(card.id))
          .map((card) => (
            <div key={card.id}>{card.render()}</div>
          ))}
      </div>
    </div>
  );
};

export default Dashboard;
