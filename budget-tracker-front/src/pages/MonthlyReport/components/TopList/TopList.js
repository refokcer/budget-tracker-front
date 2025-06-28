import React from "react";
import styles from "./TopList.module.css";

const palette = [
  "#ff7043",
  "#ffee58",
  "#66bb6a",
  "#42a5f5",
  "#ab47bc",
  "#26c6da",
  "#8d6e63",
  "#d4e157",
  "#ec407a",
  "#7e57c2",
];

const format = (n) => n.toLocaleString("uk-UA", { minimumFractionDigits: 2 });

const TopList = ({ title, items }) => {

  return (
    <div className={styles["toplist-card"]}>
      <h4>{title}</h4>
      {items.length === 0 ? (
        <p className={styles.empty}>Немає даних</p>
      ) : (
        <ul className={styles.toplist}>
          {items.map((it, i) => (
            <li key={i}>
              <span
                className={styles["color-dot"]}
                style={{ background: palette[i % palette.length] }}
              />
              <span className={styles.name}>{it.label}</span>
              <span className={styles.amount}>{format(it.amount)}</span>
              <span className={styles.percent}>{it.percent}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default TopList;
