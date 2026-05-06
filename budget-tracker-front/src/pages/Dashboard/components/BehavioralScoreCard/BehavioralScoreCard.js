import styles from "../../DashboardPage/Dashboard.module.css";

const percent = (value) => `${(Number(value || 0) * 100).toFixed(1)}%`;

const BehavioralScoreCard = ({ behavioralScore }) => {
  if (!behavioralScore) {
    return (
      <div className={styles["db-card"]}>
        <h3 className={styles["db-title"]}>Behavioral Score</h3>
        <p className={styles["db-empty"]}>-</p>
      </div>
    );
  }

  const metrics = behavioralScore.metrics || {};
  const insights = behavioralScore.insights || [];

  return (
    <div className={`${styles["db-card"]} ${styles["db-financial-card"]}`}>
      <div className={styles["db-stability-header"]}>
        <h3 className={styles["db-title"]}>Behavioral Score</h3>
        <div className={styles["db-stability-score"]}>
          <span className={styles["db-stability-index"]}>
            {behavioralScore.score}
          </span>
          <span className={styles["db-stability-level"]}>
            {behavioralScore.level}
          </span>
        </div>
      </div>

      <div className={styles["db-metrics-grid"]}>
        <div>
          <span>Limits</span>
          <strong>{percent(metrics.limitAdherence)}</strong>
        </div>
        <div>
          <span>Impulse control</span>
          <strong>{percent(metrics.impulseControl)}</strong>
        </div>
        <div>
          <span>Savings rhythm</span>
          <strong>{percent(metrics.savingsRegularity)}</strong>
        </div>
        <div>
          <span>Warning response</span>
          <strong>{percent(metrics.warningResponse)}</strong>
        </div>
      </div>

      <div className={styles["db-stability-monthly"]}>
        <div>
          <span>Impulse tx</span>
          <strong>{metrics.impulsiveTransactions || 0}</strong>
        </div>
        <div>
          <span>Savings months</span>
          <strong>
            {metrics.savingMonths || 0}/{metrics.activeIncomeMonths || 0}
          </strong>
        </div>
      </div>

      {insights.length > 0 && (
        <ul className={styles["db-recommendations"]}>
          {insights.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BehavioralScoreCard;
