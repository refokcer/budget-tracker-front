import styles from "./TopTransactionCard.module.css";

const format = (value) =>
  Number(value || 0).toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const TopTransactionCard = ({ transaction }) => {
  if (!transaction) return null;

  return (
    <div className={styles["toptx-card"]}>
      <h4 className={styles["card-title"]}>Largest expense</h4>

      <p className={styles["tx-name"]}>{transaction.title}</p>

      <p className={styles.amount}>
        {transaction.currencySymbol}&nbsp;{format(transaction.amount)}
      </p>

      <div className={styles["info-grid"]}>
        <span className={styles.label}>Category</span>
        <span className={styles.value}>{transaction.categoryTitle || "-"}</span>

        <span className={styles.label}>Account</span>
        <span className={styles.value}>{transaction.accountTitle || "-"}</span>

        <span className={styles.label}>Date</span>
        <span className={styles.value}>
          {new Date(transaction.date).toLocaleDateString()}
        </span>
      </div>

      {transaction.description && (
        <p className={styles.description}>{transaction.description}</p>
      )}
    </div>
  );
};

export default TopTransactionCard;
