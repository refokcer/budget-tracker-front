import React from "react";
import styles from "../../DashboardPage/Dashboard.module.css";

const AccountsCard = ({ accounts, currencies, totalBalance }) => (
  <div className={styles["db-card"]}>
    <h3 className={styles["db-title"]}>Accounts</h3>
    <table className={styles["db-table"]}>
      <thead>
        <tr>
          <th>Назва</th>
          <th>Сума</th>
        </tr>
      </thead>
      <tbody>
        {accounts.map((a) => (
          <tr key={a.id}>
            <td>{a.title}</td>
            <td>
              {currencies[a.currencyId] || ""}&nbsp;{a.amount.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className={styles["db-balance"]}>
      <span>Balance:</span>
      <span>{totalBalance.toFixed(2)}</span>
    </div>
  </div>
);

export default AccountsCard;
