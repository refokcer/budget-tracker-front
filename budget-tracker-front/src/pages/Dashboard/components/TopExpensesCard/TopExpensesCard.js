import React from "react";
import styles from "../../DashboardPage/Dashboard.module.css";

const TopExpensesCard = ({ expByCat, categories, totalExp, percent }) => (
  <div className={styles["db-card"]}>
    <h3 className={styles["db-title"]}>Top 10 Expenses</h3>
    {expByCat.length === 0 ? (
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
          {expByCat.map(([id, sum]) => (
            <tr key={id}>
              <td>{categories[id] || "—"}</td>
              <td>{sum.toFixed(2)}</td>
              <td>{percent(sum, totalExp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default TopExpensesCard;
