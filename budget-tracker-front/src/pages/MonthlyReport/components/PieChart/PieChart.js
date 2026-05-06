import styles from "./PieChart.module.css";

const format = (value) =>
  Number(value || 0).toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const PieChart = ({ title, items = [] }) => {
  const safeItems = items.filter((item) => Number(item.value || 0) > 0);
  const sum = safeItems.reduce((s, it) => s + Number(it.value || 0), 0);

  let acc = 0;
  const sectors = safeItems.map((it, i) => {
    const start = acc;
    const angle = (Number(it.value || 0) / sum) * 360;
    acc += angle;
    const large = angle > 180 ? 1 : 0;
    const x1 = 100 + 100 * Math.cos((Math.PI * start) / 180);
    const y1 = 100 + 100 * Math.sin((Math.PI * start) / 180);
    const x2 = 100 + 100 * Math.cos((Math.PI * (start + angle)) / 180);
    const y2 = 100 + 100 * Math.sin((Math.PI * (start + angle)) / 180);

    return (
      <path
        key={`${it.label}-${i}`}
        d={`M100,100 L${x1},${y1} A100,100 0 ${large} 1 ${x2},${y2} z`}
        className={`${styles.slice} ${styles["c" + (i % 10)]}`}
        style={it.color ? { fill: it.color } : undefined}
      />
    );
  });

  return (
    <div className={styles["pie-card"]}>
      <h4>{title}</h4>
      {sum === 0 ? (
        <p className={styles.empty}>No data</p>
      ) : (
        <div className={styles["pie-layout"]}>
          <svg viewBox="0 0 200 200" className={styles["pie-chart"]}>
            {sectors}
          </svg>
          <ul className={styles.legend}>
            {safeItems.map((it, i) => (
              <li key={`${it.label}-${i}`}>
                <span
                  className={`${styles.dot} ${styles["c" + (i % 10)]}`}
                  style={it.color ? { background: it.color } : undefined}
                />
                <span>{it.label}</span>
                <strong>{format(it.value)}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PieChart;
