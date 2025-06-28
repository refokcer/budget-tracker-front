import React from "react";
import styles from "../../DashboardPage/Dashboard.module.css";

const TopExpensesCard = ({ items }) => (
  <div className={styles["db-card"]}>
    <h3 className={styles["db-title"]}>Top 10 Expenses</h3>
    {items.length === 0 ? (
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
          {items.map((it, i) => (
            <tr key={i}>
              <td>{it.categoryTitle}</td>
              <td>{it.amount.toFixed(2)}</td>
              <td>{it.percent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default TopExpensesCard;
