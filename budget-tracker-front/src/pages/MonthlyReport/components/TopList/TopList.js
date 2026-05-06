import styles from "./TopList.module.css";

const palette = [
  "#ff6b5f",
  "#35b978",
  "#4aa3ff",
  "#f7b731",
  "#a78bfa",
  "#5fb3a7",
  "#f472b6",
  "#94a3b8",
  "#fb923c",
  "#22d3ee",
];

const format = (value) =>
  Number(value || 0).toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const TopList = ({ title, items = [] }) => (
  <div className={styles["toplist-card"]}>
    <h4>{title}</h4>
    {items.length === 0 ? (
      <p className={styles.empty}>No data</p>
    ) : (
      <ul className={styles.toplist}>
        {items.map((it, i) => (
          <li key={`${it.label}-${i}`}>
            <span
              className={styles["color-dot"]}
              style={{ background: it.color || palette[i % palette.length] }}
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

export default TopList;
