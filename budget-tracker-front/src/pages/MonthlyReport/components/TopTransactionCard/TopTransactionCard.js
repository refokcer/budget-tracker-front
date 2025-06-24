import React from "react";
import styles from "./TopTransactionCard.module.css";

const TopTransactionCard = ({ transaction, category, account, currency }) => {
  if (!transaction) return null;

  return (
    <div className={styles["toptx-card"]}>
      <div className={styles["accent-bar"]} />

      <h4 className={styles["card-title"]}>Найбільша транзакція місяця</h4>

      <p className={styles["tx-name"]}>{transaction.title}</p>

      <p className={styles.amount}>
        {currency}&nbsp;{transaction.amount.toFixed(2)}
      </p>

      <div className={styles["info-grid"]}>
        <span className={styles.label}>Категорія:</span>
        <span className={styles.value}>{category || "—"}</span>

        <span className={styles.label}>Рахунок:</span>
        <span className={styles.value}>{account || "—"}</span>

        <span className={styles.label}>Дата:</span>
        <span className={styles.value}>
          {new Date(transaction.date).toLocaleDateString()}
        </span>
      </div>

      {transaction.description && (
        <>
          <hr />
          <p className={styles.description}>{transaction.description}</p>
        </>
      )}
    </div>
  );
};

export default TopTransactionCard;
