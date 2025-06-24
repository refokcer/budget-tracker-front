import React from "react";
import styles from "../../DashboardPage/Dashboard.module.css";

const BiggestTransactionCard = ({ transaction, currencies }) => (
  <div className={styles["db-card"]}>
    <h3 className={styles["db-title"]}>Найбільша транзакція</h3>
    {transaction ? (
      <>
        <p className={styles["db-big"]}>
          {currencies[transaction.currencyId] || "₴"}&nbsp;
          {transaction.amount.toFixed(2)}
        </p>
        <p className={styles["db-sub"]}>{transaction.title}</p>
        <p className={styles["db-sub"]}>
          {new Date(transaction.date).toLocaleDateString()}
        </p>
      </>
    ) : (
      <p className={styles["db-empty"]}>—</p>
    )}
  </div>
);

export default BiggestTransactionCard;
