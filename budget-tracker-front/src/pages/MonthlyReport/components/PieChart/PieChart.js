import styles from "./PieChart.module.css";

const PieChart = ({ title, items }) => {
  const sum = items.reduce((s, it) => s + it.value, 0);

  let acc = 0;
  const sectors = items.map((it, i) => {
    const start = acc;
    const angle = (it.value / sum) * 360;
    acc += angle;
    const large = angle > 180 ? 1 : 0;
    const x1 = 100 + 100 * Math.cos((Math.PI * start) / 180);
    const y1 = 100 + 100 * Math.sin((Math.PI * start) / 180);
    const x2 = 100 + 100 * Math.cos((Math.PI * (start + angle)) / 180);
    const y2 = 100 + 100 * Math.sin((Math.PI * (start + angle)) / 180);
    return (
      <path
        key={i}
        d={`M100,100 L${x1},${y1} A100,100 0 ${large} 1 ${x2},${y2} z`}
        className={`${styles.slice} ${styles["c" + i]}`}
      />
    );
  });

  return (
    <div className={styles["pie-card"]}>
      <h4>{title}</h4>
      {sum === 0 ? (
        <p className={styles.empty}>Немає даних</p>
      ) : (
        <>
          <svg viewBox="0 0 200 200" className={styles["pie-chart"]}>
            {sectors}
          </svg>
          <ul className={styles.legend}>
            {items.map((it, i) => (
              <li key={i}>
                <span className={`${styles.dot} ${styles["c" + i]}`}></span>
                {it.label} — {it.value.toFixed(2)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default PieChart;
