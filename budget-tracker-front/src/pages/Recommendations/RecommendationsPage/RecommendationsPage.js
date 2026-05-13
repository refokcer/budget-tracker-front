import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API_ENDPOINTS from "../../../config/apiConfig";
import { apiJson, getApiErrorMessage } from "../../../services/apiClient";
import styles from "./RecommendationsPage.module.css";

const priorityClass = (priority) => {
  if (priority === "High") return styles.high;
  if (priority === "Medium") return styles.medium;
  return styles.low;
};

const deltaText = (value) => {
  const number = Number(value || 0);
  if (number === 0) return "0";
  return number > 0 ? `+${number}` : String(number);
};

const statusClass = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("high attention") || normalized.includes("low") || normalized.includes("needs")) {
    return styles.attention;
  }
  if (normalized.includes("medium") || normalized.includes("tracked")) return styles.watch;
  return styles.healthy;
};

const RecommendationsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const json = await apiJson(
          API_ENDPOINTS.recommendationsPage,
          {},
          "Failed to load recommendations"
        );
        if (alive) setData(json);
      } catch (e) {
        if (alive) setError(getApiErrorMessage(e));
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const groupedActions = useMemo(() => {
    const groups = new Map();
    (data?.priorityActions || []).forEach((action) => {
      const key = action.source || "General";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(action);
    });
    return Array.from(groups.entries());
  }, [data]);

  if (loading) {
    return (
      <main className={styles.page}>
        <section className={styles.statePanel}>Loading recommendations...</section>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <section className={`${styles.statePanel} ${styles.error}`}>{error}</section>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={`${styles.statusBadge} ${statusClass(data.overallStatus)}`}>
            {data.overallStatus}
          </span>
          <h1>{data.headline}</h1>
          <p>{data.explanation}</p>
        </div>

        <div className={styles.scorePanel}>
          <div className={styles.scoreItem}>
            <span>Stability</span>
            <strong>{data.financialStabilityIndex}</strong>
            <em className={Number(data.financialStabilityDelta) < 0 ? styles.down : styles.up}>
              {deltaText(data.financialStabilityDelta)}
            </em>
          </div>
          <div className={styles.scoreItem}>
            <span>Behavior</span>
            <strong>{data.behavioralScore}</strong>
            <em className={Number(data.behavioralScoreDelta) < 0 ? styles.down : styles.up}>
              {deltaText(data.behavioralScoreDelta)}
            </em>
          </div>
        </div>
      </section>

      <section className={styles.signalsGrid}>
        {(data.signals || []).map((signal) => (
          <article key={signal.title} className={styles.signalCard}>
            <div className={styles.signalTop}>
              <span>{signal.title}</span>
              <b className={statusClass(signal.level)}>{signal.level}</b>
            </div>
            <div className={styles.signalValue}>
              <strong>{signal.value}</strong>
              {signal.previousValue && <em>prev {signal.previousValue}</em>}
            </div>
            <p>{signal.explanation}</p>
          </article>
        ))}
      </section>

      <section className={styles.layout}>
        <div className={styles.actionsColumn}>
          <div className={styles.sectionHeader}>
            <h2>Priority actions</h2>
            <span>{data.priorityActions?.length || 0} items</span>
          </div>

          {groupedActions.length === 0 && (
            <article className={styles.actionCard}>
              <h3>No urgent actions</h3>
              <p>Your current metrics do not require immediate correction.</p>
            </article>
          )}

          {groupedActions.map(([source, actions]) => (
            <div key={source} className={styles.actionGroup}>
              <h3>{source}</h3>
              {actions.map((action, index) => (
                <article key={`${source}-${index}-${action.title}`} className={styles.actionCard}>
                  <div className={styles.actionTop}>
                    <span className={`${styles.priority} ${priorityClass(action.priority)}`}>
                      {action.priority}
                    </span>
                    {action.actionLink && <Link to={action.actionLink}>Open</Link>}
                  </div>
                  <h4>{action.title}</h4>
                  <dl>
                    <div>
                      <dt>Why</dt>
                      <dd>{action.why}</dd>
                    </div>
                    <div>
                      <dt>What to do</dt>
                      <dd>{action.whatToDo}</dd>
                    </div>
                    <div>
                      <dt>Impact</dt>
                      <dd>{action.impact}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          ))}
        </div>

        <aside className={styles.explainColumn}>
          <div className={styles.sectionHeader}>
            <h2>What changed</h2>
          </div>

          {(data.sections || []).map((section) => (
            <article key={section.title} className={styles.sectionCard}>
              <div className={styles.sectionTitle}>
                <h3>{section.title}</h3>
                <span className={statusClass(section.status)}>{section.status}</span>
              </div>
              <p>{section.summary}</p>
              {section.actions?.length > 0 && (
                <ul>
                  {section.actions.map((action, index) => (
                    <li key={`${section.title}-${index}`}>{action.title}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </aside>
      </section>
    </main>
  );
};

export default RecommendationsPage;
