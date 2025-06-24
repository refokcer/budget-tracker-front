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

const TopList = ({ title, dataMap, labels, totalIncome }) => {
  const entries = Object.entries(dataMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className={styles["toplist-card"]}>
      <h4>{title}</h4>
      {entries.length === 0 ? (
        <p className={styles.empty}>Немає даних</p>
      ) : (
        <ul className={styles.toplist}>
          {entries.map(([id, sum], i) => (
            <li key={id}>
              <span
                className={styles["color-dot"]}
                style={{ background: palette[i % palette.length] }}
              />
              <span className={styles.name}>{labels[id] || "—"}</span>
              <span className={styles.amount}>{format(sum)}</span>
              <span className={styles.percent}>
                {((sum / totalIncome) * 100).toFixed(1)} %
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default TopList;
