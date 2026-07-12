import styles from "./SummaryCards.module.css";

const format = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2 });

const SummaryCards = ({ totalExp, totalInc, balance, defaultCurrency }) => (
  <div className={styles["sc-wrapper"]}>
    <div className={`${styles["sc-card"]} ${styles["sc-red"]}`}>
      <span className={styles["sc-label"]}>Total spent</span>
      <span className={styles["sc-value"]}>
        {defaultCurrency}&nbsp;{format(totalExp)}
      </span>
    </div>

    <div className={`${styles["sc-card"]} ${styles["sc-green"]}`}>
      <span className={styles["sc-label"]}>Total earned</span>
      <span className={styles["sc-value"]}>
        {defaultCurrency}&nbsp;{format(totalInc)}
      </span>
    </div>

    <div className={`${styles["sc-card"]} ${styles["sc-blue"]}`}>
      <span className={styles["sc-label"]}>Balance</span>
      <span className={styles["sc-value"]}>
        {defaultCurrency}&nbsp;{format(balance)}
      </span>
    </div>
  </div>
);

export default SummaryCards;
