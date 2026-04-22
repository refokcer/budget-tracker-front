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
    <div className={styles["db-card"]}>
      <h3 className={styles["db-title"]}>Financial Stability</h3>

      <div className={styles["db-stability-score"]}>
        <span className={styles["db-stability-index"]}>{stability.index}</span>
        <span className={styles["db-stability-level"]}>{stability.level}</span>
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
          <span>Goal</span>
          <strong>{percent(metrics.goalAchievementIndex)}</strong>
        </div>
      </div>

      <div className={styles["db-stability-monthly"]}>
        <span>Avg income: {money(metrics.averageMonthlyIncome)}</span>
        <span>Avg expenses: {money(metrics.averageMonthlyExpenses)}</span>
      </div>

      {recommendations.length > 0 && (
        <ul className={styles["db-recommendations"]}>
          {recommendations.slice(0, 2).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FinancialStabilityCard;
