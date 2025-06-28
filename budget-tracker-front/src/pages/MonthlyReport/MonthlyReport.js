import React, { useState, useEffect } from "react";
import API_ENDPOINTS from "../../config/apiConfig";
import MonthSelector from "../../components/MonthSelector/MonthSelector";

import SummaryCards from "./components/SummaryCards/SummaryCards";
import PieChart from "./components/PieChart/PieChart";
import TopList from "./components/TopList/TopList";
import TopTransactionCard from "./components/TopTransactionCard/TopTransactionCard";

import styles from "./MonthlyReport.module.css";

const MonthlyReport = () => {
  /* ───────── вибір місяця ───────── */
  const [monthDate, setMonthDate] = useState(() => new Date()); // сьогодні
  const jumpMonth = (delta) => {
    const copy = new Date(monthDate);
    copy.setMonth(copy.getMonth() + delta);
    setMonthDate(copy);
  };

  const month = monthDate.getMonth() + 1; // 1-based
  const year = monthDate.getFullYear();

  /* ───────── стани даних ───────── */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  /* ───────── fetch on month change ───────── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_ENDPOINTS.monthlyReport(month, year)}`
        );
        if (!res.ok) throw new Error("Помилка завантаження даних");
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
      {/* селектор місяця */}
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

export default MonthlyReport;
// Expected model from API_ENDPOINTS.monthlyReport(start,end):
// {
//   totalExp: number,
//   totalInc: number,
//   balance: number,
//   defaultCurrency: string,
//   topExpenseCategories: [{ label: string, amount: number, percent: string }],
//   topIncomeCategories: [{ label: string, amount: number, percent: string }],
//   expensesByCategory: [{ label: string, value: number }],
//   incomesByCategory: [{ label: string, value: number }],
//   expensesByAccount: [{ label: string, value: number }],
//   topExpenseTransaction: { title: string, amount: number, currencySymbol: string, categoryTitle: string, accountTitle: string, date: string, description?: string }
// }
