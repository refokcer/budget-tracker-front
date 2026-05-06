import { useEffect, useState } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import MonthSelector from "../../../components/MonthSelector/MonthSelector";

import PieChart from "../components/PieChart/PieChart";
import TopList from "../components/TopList/TopList";
import TopTransactionCard from "../components/TopTransactionCard/TopTransactionCard";

import styles from "./MonthlyReportPage.module.css";

const formatAmount = (value, currency = "") =>
  `${currency ? `${currency} ` : ""}${Number(value || 0).toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatPercent = (value) =>
  `${Math.round(Number(value || 0) * 1000) / 10}%`;

const asPercent = (part, total) => {
  if (!total || total <= 0) return 0;
  return Math.max(0, Math.min(1, Number(part || 0) / Number(total)));
};

const toTopValueItems = (items = [], limit = 6) =>
  [...items]
    .filter((item) => Number(item.value || 0) > 0)
    .sort((left, right) => Number(right.value || 0) - Number(left.value || 0))
    .slice(0, limit);

const buildInsights = ({
  totalExp,
  totalInc,
  balance,
  topExpense,
  topIncome,
  expenseLoad,
  savingsRate,
  largestExpenseShare,
  accountConcentration,
  expensesByAccount,
}) => {
  const insights = [];

  if (totalInc <= 0 && totalExp > 0) {
    insights.push("No income is recorded for this month, so every expense lowers liquidity directly.");
  } else if (savingsRate >= 0.2) {
    insights.push("Savings rate is strong: more than 20% of income remains after expenses.");
  } else if (savingsRate >= 0.05) {
    insights.push("Savings rate is positive, but there is limited room for larger goals or emergencies.");
  } else if (balance < 0) {
    insights.push("Expenses exceed income this month. Next plan should reduce flexible categories first.");
  } else {
    insights.push("Income covers expenses, but the retained amount is thin.");
  }

  if (topExpense && largestExpenseShare >= 0.35) {
    insights.push(`${topExpense.label} dominates expenses with ${formatPercent(largestExpenseShare)} of category spending.`);
  } else if (topExpense) {
    insights.push(`Largest expense category is ${topExpense.label}, but spending is reasonably distributed.`);
  }

  if (expenseLoad > 0.85) {
    insights.push("Expense load is high: most income is consumed during the month.");
  } else if (expenseLoad < 0.65 && totalInc > 0) {
    insights.push("Expense load is controlled, leaving useful planning space.");
  }

  if (topIncome) {
    insights.push(`Main income source is ${topIncome.label}.`);
  }

  if (expensesByAccount.length > 1 && accountConcentration >= 0.7) {
    insights.push("One account carries most expenses; account-level budgeting may be useful.");
  }

  return insights.slice(0, 5);
};

const MetricCard = ({ label, value, detail, tone = "neutral" }) => (
  <div className={`${styles["metric-card"]} ${styles[`metric-${tone}`]}`}>
    <span>{label}</span>
    <strong>{value}</strong>
    {detail && <small>{detail}</small>}
  </div>
);

const ProgressMetric = ({ label, value, amount, tone = "neutral" }) => (
  <div className={styles["progress-metric"]}>
    <div>
      <span>{label}</span>
      <strong>{amount}</strong>
    </div>
    <div className={styles["progress-track"]}>
      <span
        className={styles[`progress-${tone}`]}
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
    <small>{formatPercent(value)}</small>
  </div>
);

const ValueBreakdown = ({ title, items, total, currency }) => (
  <section className={styles.panel}>
    <div className={styles["panel-header"]}>
      <h3>{title}</h3>
      <span>{formatAmount(total, currency)}</span>
    </div>

    {items.length === 0 ? (
      <p className={styles.empty}>No data</p>
    ) : (
      <div className={styles["breakdown-list"]}>
        {items.map((item, index) => {
          const share = asPercent(item.value, total);
          return (
            <div className={styles["breakdown-row"]} key={`${item.label}-${index}`}>
              <div className={styles["breakdown-main"]}>
                <span>{item.label}</span>
                <strong>{formatAmount(item.value, currency)}</strong>
              </div>
              <div className={styles["progress-track"]}>
                <span
                  style={{
                    width: `${Math.round(share * 100)}%`,
                    ...(item.color ? { background: item.color } : {}),
                  }}
                />
              </div>
              <small>{formatPercent(share)}</small>
            </div>
          );
        })}
      </div>
    )}
  </section>
);

const MonthlyReportPage = () => {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const jumpMonth = (delta) => {
    const copy = new Date(monthDate);
    copy.setMonth(copy.getMonth() + delta);
    setMonthDate(copy);
  };

  const month = monthDate.getMonth() + 1;
  const year = monthDate.getFullYear();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_ENDPOINTS.monthlyReport(month, year));
        if (!res.ok) throw new Error("Failed to load monthly analytics");
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

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!report) return <p className={styles.loading}>No report data</p>;

  const {
    totalExp = 0,
    totalInc = 0,
    balance = 0,
    defaultCurrency = "",
    topExpenseCategories = [],
    topIncomeCategories = [],
    expensesByCategory = [],
    incomesByCategory = [],
    expensesByAccount = [],
    topExpenseTransaction,
  } = report;

  const monthLabel = monthDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const topExpense = topExpenseCategories[0];
  const topIncome = topIncomeCategories[0];
  const savingsRate = asPercent(balance, totalInc);
  const expenseLoad = asPercent(totalExp, totalInc);
  const largestExpenseShare = asPercent(topExpense?.amount, totalExp);
  const accountItems = toTopValueItems(expensesByAccount, 5);
  const accountConcentration = asPercent(accountItems[0]?.value, totalExp);
  const expenseItems = toTopValueItems(expensesByCategory, 7);
  const incomeItems = toTopValueItems(incomesByCategory, 5);
  const hasActivity = totalExp > 0 || totalInc > 0;
  const insights = buildInsights({
    totalExp,
    totalInc,
    balance,
    topExpense,
    topIncome,
    expenseLoad,
    savingsRate,
    largestExpenseShare,
    accountConcentration,
    expensesByAccount: accountItems,
  });

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Monthly analytics</span>
          <h2>{monthLabel}</h2>
        </div>
        <MonthSelector label={monthLabel} onJump={jumpMonth} />
      </div>

      {!hasActivity ? (
        <div className={styles["empty-state"]}>
          <h3>No transactions for this month</h3>
          <p>Create income and expense transactions to see analytics.</p>
        </div>
      ) : (
        <div className={styles.content}>
          <section className={styles["metric-grid"]}>
            <MetricCard
              label="Income"
              value={formatAmount(totalInc, defaultCurrency)}
              detail={topIncome ? `Main: ${topIncome.label}` : "No income categories"}
              tone="income"
            />
            <MetricCard
              label="Expenses"
              value={formatAmount(totalExp, defaultCurrency)}
              detail={topExpense ? `Main: ${topExpense.label}` : "No expense categories"}
              tone="expense"
            />
            <MetricCard
              label="Net cashflow"
              value={formatAmount(balance, defaultCurrency)}
              detail={balance >= 0 ? "Positive month" : "Deficit month"}
              tone={balance >= 0 ? "income" : "expense"}
            />
            <MetricCard
              label="Savings rate"
              value={formatPercent(savingsRate)}
              detail={`${formatAmount(Math.max(balance, 0), defaultCurrency)} retained`}
              tone={savingsRate >= 0.15 ? "income" : savingsRate > 0 ? "warning" : "expense"}
            />
          </section>

          <section className={styles["overview-grid"]}>
            <div className={styles.panel}>
              <div className={styles["panel-header"]}>
                <h3>Month structure</h3>
                <span>{defaultCurrency}</span>
              </div>
              <div className={styles["progress-list"]}>
                <ProgressMetric
                  label="Income used"
                  value={expenseLoad}
                  amount={formatAmount(totalExp, defaultCurrency)}
                  tone={expenseLoad > 0.85 ? "expense" : "income"}
                />
                <ProgressMetric
                  label="Retained"
                  value={savingsRate}
                  amount={formatAmount(Math.max(balance, 0), defaultCurrency)}
                  tone={savingsRate >= 0.15 ? "income" : "warning"}
                />
                <ProgressMetric
                  label="Largest category"
                  value={largestExpenseShare}
                  amount={topExpense?.label || "No data"}
                  tone={largestExpenseShare >= 0.35 ? "warning" : "neutral"}
                />
                <ProgressMetric
                  label="Account concentration"
                  value={accountConcentration}
                  amount={accountItems[0]?.label || "No data"}
                  tone={accountConcentration >= 0.7 ? "warning" : "neutral"}
                />
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles["panel-header"]}>
                <h3>Insights</h3>
                <span>{insights.length}</span>
              </div>
              <ul className={styles.insights}>
                {insights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className={styles["analytics-grid"]}>
            <ValueBreakdown
              title="Expense breakdown"
              items={expenseItems}
              total={totalExp}
              currency={defaultCurrency}
            />
            <ValueBreakdown
              title="Income breakdown"
              items={incomeItems}
              total={totalInc}
              currency={defaultCurrency}
            />
          </section>

          <section className={styles["charts-grid"]}>
            <TopList title="Top expense categories" items={topExpenseCategories} />
            <TopList title="Top income categories" items={topIncomeCategories} />
            <PieChart title="Expenses by category" items={expensesByCategory} />
            <PieChart title="Income by category" items={incomesByCategory} />
            <PieChart title="Expenses by account" items={expensesByAccount} />
            {topExpenseTransaction && (
              <TopTransactionCard transaction={topExpenseTransaction} />
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default MonthlyReportPage;
