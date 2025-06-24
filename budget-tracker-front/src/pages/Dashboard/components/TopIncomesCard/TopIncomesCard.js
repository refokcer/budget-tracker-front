import React from "react";
import styles from "../../DashboardPage/Dashboard.module.css";

const TopIncomesCard = ({ incByCat, categories, totalInc, percent }) => (
  <div className={styles["db-card"]}>
    <h3 className={styles["db-title"]}>Top 10 Incomes</h3>
    {incByCat.length === 0 ? (
      <p className={styles["db-empty"]}>Немає даних</p>
    ) : (
      <table className={styles["db-small-table"]}>
        <thead>
          <tr>
            <th>Категорія</th>
            <th>Сума</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {incByCat.map(([id, sum]) => (
            <tr key={id}>
              <td>{categories[id] || "—"}</td>
              <td>{sum.toFixed(2)}</td>
              <td>{percent(sum, totalInc)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default TopIncomesCard;
