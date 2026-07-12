import { NavLink, useParams } from "react-router-dom";
import { getThesisDemoScenario, thesisDemoScenarios } from "./data";
import styles from "./ThesisDemoPage.module.css";

const ThesisDemoPage = () => {
  const { scenarioId } = useParams();
  const scenario = getThesisDemoScenario(scenarioId);

  return (
    <div className={styles.page}>
      <aside className={styles.nav}>
        <div className={styles.navHeader}>
          <span>Section 4</span>
          <strong>Testing Results</strong>
        </div>
        {thesisDemoScenarios.map((item) => (
          <NavLink
            key={item.id}
            to={`/thesis-demo/${item.id}`}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive || item.id === scenario.id ? styles.active : ""}`
            }
          >
            <span>{item.section}</span>
            <strong>{item.shortTitle}</strong>
          </NavLink>
        ))}
      </aside>

      <main className={styles.content}>
        <section className={styles.hero}>
          <div>
            <span className={styles.kicker}>{scenario.section}</span>
            <h1>{scenario.title}</h1>
            <p>{scenario.objective}</p>
          </div>
          <div className={styles.datasetCard}>
            <span>Input data</span>
            <strong>{scenario.dataset}</strong>
          </div>
        </section>

        <section className={styles.metricsGrid}>
          {scenario.metrics.map((metric) => (
            <article key={metric.label} className={styles.metricCard}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </section>

        <section className={styles.screenshots}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <span>{scenario.inputTitle}</span>
              <b>Input</b>
            </div>
            <DemoTable columns={scenario.tableColumns} rows={scenario.tableRows} />
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <span>{scenario.resultTitle}</span>
              <b>Result</b>
            </div>
            <div className={styles.resultBox}>
              <strong>{scenario.conclusion}</strong>
              <ul>
                {scenario.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
};

const DemoTable = ({ columns, rows }) => (
  <div className={styles.tableWrap}>
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.join("-")}>
            {row.map((cell) => (
              <td key={cell}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ThesisDemoPage;
