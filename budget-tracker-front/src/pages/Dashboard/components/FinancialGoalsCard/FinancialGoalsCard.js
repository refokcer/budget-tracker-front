import { useNavigate } from "react-router-dom";
import styles from "../../DashboardPage/Dashboard.module.css";

const money = (value) => Number(value || 0).toFixed(2);
const percent = (value) => `${Math.round(Number(value || 0) * 100)}%`;

const FinancialGoalsCard = ({ goals }) => {
  const navigate = useNavigate();
  const visibleGoals = (goals || []).slice(0, 3);

  return (
    <div className={`${styles["db-card"]} ${styles["db-goals-card"]}`}>
      <div className={styles["db-card-header"]}>
        <h3 className={styles["db-title"]}>Goals</h3>
        <button type="button" onClick={() => navigate("/goals")}>
          Open
        </button>
      </div>

      {!visibleGoals.length ? (
        <p className={styles["db-empty"]}>No goals yet</p>
      ) : (
        <div className={styles["db-goals-list"]}>
          {visibleGoals.map((goal) => (
            <button
              type="button"
              key={goal.id}
              className={styles["db-goal-row"]}
              onClick={() => navigate("/goals")}
            >
              <span>
                <strong>{goal.title}</strong>
                <small>{goal.riskLevel} risk</small>
              </span>
              <span className={styles["db-goal-amount"]}>
                {money(goal.currentSavedAmount)} / {money(goal.targetAmount)}
              </span>
              <span className={styles["db-goal-progress"]}>
                <span style={{ width: percent(goal.progressRatio) }} />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinancialGoalsCard;
