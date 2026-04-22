import styles from "../../DashboardPage/Dashboard.module.css";

const percent = (value) => `${(Number(value || 0) * 100).toFixed(1)}%`;
const money = (value) => Number(value || 0).toFixed(2);

const FinancialStabilityCard = ({ stability }) => {
  if (!stability) {
    return (
      <div className={styles["db-card"]}>
        <h3 className={styles["db-title"]}>Financial Stability</h3>
        <p className={styles["db-empty"]}>-</p>
      </div>
    );
  }

  const metrics = stability.metrics || {};
  const recommendations = stability.recommendations || [];

  return (
    <div className={`${styles["db-card"]} ${styles["db-financial-card"]}`}>
      <div className={styles["db-stability-header"]}>
        <h3 className={styles["db-title"]}>Financial Stability</h3>
        <div className={styles["db-stability-score"]}>
          <span className={styles["db-stability-index"]}>{stability.index}</span>
          <span className={styles["db-stability-level"]}>{stability.level}</span>
        </div>
      </div>

      <div className={styles["db-metrics-grid"]}>
        <div>
          <span>Mandatory</span>
          <strong>{percent(metrics.mandatoryExpensesShare)}</strong>
        </div>
        <div>
          <span>Savings</span>
          <strong>{percent(metrics.savingsShare)}</strong>
        </div>
        <div>
          <span>Emergency</span>
          <strong>{money(metrics.emergencyFundMonths)} mo</strong>
        </div>
        <div>
          <span>Overspending</span>
          <strong>{percent(metrics.overspendingFrequency)}</strong>
        </div>
        <div>
          <span>Income stability</span>
          <strong>{percent(metrics.incomeStability)}</strong>
        </div>
        <div>
          <span>Goal</span>
          <strong>{percent(metrics.goalAchievementIndex)}</strong>
        </div>
      </div>

      <div className={styles["db-stability-monthly"]}>
        <div>
          <span>Avg income</span>
          <strong>{money(metrics.averageMonthlyIncome)}</strong>
        </div>
        <div>
          <span>Avg expenses</span>
          <strong>{money(metrics.averageMonthlyExpenses)}</strong>
        </div>
      </div>

      {recommendations.length > 0 && (
        <ul className={styles["db-recommendations"]}>
          {recommendations.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FinancialStabilityCard;
