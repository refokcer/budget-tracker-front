import { useEffect, useMemo, useState } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import styles from "./AutoPlanModal.module.css";

const monthName = (month, year) =>
  new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

const money = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const AutoPlanModal = ({ isOpen, onClose, onCreated }) => {
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [title, setTitle] = useState("");
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [applySeasonality, setApplySeasonality] = useState(true);
  const [overspendCarryRate, setOverspendCarryRate] = useState("0.5");
  const [underspendCarryRate, setUnderspendCarryRate] = useState("0.25");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setResult(null);
    setError(null);
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
    setTitle("");
    setReplaceExisting(false);
    setApplySeasonality(true);
    setOverspendCarryRate("0.5");
    setUnderspendCarryRate("0.25");
  }, [isOpen, now]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch(API_ENDPOINTS.createAutoMonthlyBudgetPlan, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: Number(month),
          year: Number(year),
          title: title.trim() || null,
          replaceExisting,
          applySeasonality,
          overspendCarryRate: Number(overspendCarryRate),
          underspendCarryRate: Number(underspendCarryRate),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create automatic budget plan.");
      }

      setResult(await response.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <div className={styles["modal-header"]}>
          <h3>Auto-create monthly plan</h3>
          <button type="button" onClick={onClose} className={styles["close-icon"]}>
            x
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {!result ? (
          <>
            <div className={styles["form-grid"]}>
              <label>
                Month
                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => (
                    <option key={item} value={item}>
                      {monthName(item, year)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Year
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </label>

              <label className={styles["wide-field"]}>
                Title
                <input
                  type="text"
                  placeholder={`Auto plan ${monthName(Number(month), Number(year))}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <label>
                Overspend carry
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overspendCarryRate}
                  onChange={(e) => setOverspendCarryRate(e.target.value)}
                />
              </label>

              <label>
                Remaining carry
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={underspendCarryRate}
                  onChange={(e) => setUnderspendCarryRate(e.target.value)}
                />
              </label>
            </div>

            <div className={styles.toggles}>
              <label>
                <input
                  type="checkbox"
                  checked={applySeasonality}
                  onChange={(e) => setApplySeasonality(e.target.checked)}
                />
                <span>Apply seasonal coefficients</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                />
                <span>Replace existing monthly plan</span>
              </label>
            </div>

            <div className={styles["rules-panel"]}>
              <strong>Seasonality</strong>
              <span>December: gifts, holidays, food, entertainment.</span>
              <span>Winter: utilities, heating, fuel, transport.</span>
              <span>Summer: travel and vacation. September: school and education.</span>
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles["secondary-button"]} onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className={styles["submit-button"]}
                disabled={loading}
                onClick={submit}
              >
                {loading ? "Creating..." : "Create plan"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.summary}>
              <div>
                <span>Created</span>
                <strong>{result.plan.title}</strong>
              </div>
              <div>
                <span>Source</span>
                <strong>{result.sourcePlanTitle}</strong>
              </div>
              <div>
                <span>Previous total</span>
                <strong>{money(result.previousTotal)}</strong>
              </div>
              <div>
                <span>New total</span>
                <strong>{money(result.newTotal)}</strong>
              </div>
            </div>

            <div className={styles["table-wrap"]}>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Previous</th>
                    <th>Spent</th>
                    <th>Carry</th>
                    <th>Season</th>
                    <th>New</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={item.categoryId}>
                      <td>{item.categoryTitle}</td>
                      <td>{money(item.previousLimit)}</td>
                      <td>{money(item.spentAmount)}</td>
                      <td>{money(item.carryAdjustment)}</td>
                      <td>x{Number(item.seasonalityMultiplier).toFixed(2)}</td>
                      <td>{money(item.recommendedAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles["secondary-button"]} onClick={onClose}>
                Close
              </button>
              <button
                type="button"
                className={styles["submit-button"]}
                onClick={() => onCreated(result)}
              >
                Open plan
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AutoPlanModal;
