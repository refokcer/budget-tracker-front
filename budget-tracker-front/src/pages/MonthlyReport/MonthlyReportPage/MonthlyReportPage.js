import { useState, useEffect } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import MonthSelector from "../../../components/MonthSelector/MonthSelector";

import SummaryCards from "../components/SummaryCards/SummaryCards";
import PieChart from "../components/PieChart/PieChart";
import TopList from "../components/TopList/TopList";
import TopTransactionCard from "../components/TopTransactionCard/TopTransactionCard";

import styles from "./MonthlyReportPage.module.css";

const MonthlyReportPage = () => {
  const [monthDate, setMonthDate] = useState(() => new Date()); 
  const jumpMonth = (delta) => {
    const copy = new Date(monthDate);
    copy.setMonth(copy.getMonth() + delta);
    setMonthDate(copy);
  };

  const month = monthDate.getMonth() + 1; 
  const year = monthDate.getFullYear();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_ENDPOINTS.monthlyReport(month, year)}`
        );
        if (!res.ok) throw new Error("Не вдалося завантажити дані");
        const data = await res.json();
        setReport(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [month, year]);

  if (!report) return <p className={styles.loading}>Завантаження…</p>;

  const {
    totalExp,
    totalInc,
    balance,
    defaultCurrency,
    topExpenseCategories,
    topIncomeCategories,
    expensesByCategory,
    incomesByCategory,
    expensesByAccount,
    topExpenseTransaction,
  } = report;

  if (loading) return <p className={styles.loading}>Завантаження…</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  const monthLabel = monthDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={styles.container}>
      <MonthSelector label={monthLabel} onJump={jumpMonth} />

      <div className={styles.content}>
        <SummaryCards
          totalExp={totalExp}
          totalInc={totalInc}
          balance={balance}
          defaultCurrency={defaultCurrency}
        />

        <div className={styles["charts-grid"]}>
          <TopList title="Топ-10 категорій витрат" items={topExpenseCategories} />

          <PieChart title="Всі категорії витрат" items={expensesByCategory} />

          <TopList title="Топ-10 категорій доходів" items={topIncomeCategories} />

          <PieChart title="Всі категорії доходів" items={incomesByCategory} />

          <PieChart title="Розподіл витрат за рахунками" items={expensesByAccount} />
          {topExpenseTransaction && (
            <TopTransactionCard transaction={topExpenseTransaction} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyReportPage;
