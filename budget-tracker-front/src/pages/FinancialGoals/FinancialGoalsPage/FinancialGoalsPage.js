import { useCallback, useEffect, useMemo, useState } from "react";
import API_ENDPOINTS from "../../../config/apiConfig";
import styles from "./FinancialGoalsPage.module.css";

const SAVINGS_ACCOUNT_TYPES = new Set([3, 5, 6]);

const emptyForm = {
  title: "",
  targetAmount: "",
  initialAmount: "0",
  targetDate: "",
  linkedAccountId: "",
  description: "",
};

const money = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const percent = (value) => `${Math.round(Number(value || 0) * 100)}%`;

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

const toDateInput = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
};

const getProgress = (goal, forecast) => {
  if (forecast) return Number(forecast.progressRatio || 0);
  if (!goal?.targetAmount) return 0;
  return Math.min(1, Number(goal.initialAmount || 0) / Number(goal.targetAmount));
};

const fetchGoalForecast = async (goalId) => {
  const response = await fetch(API_ENDPOINTS.financialGoalForecast(goalId));
  if (!response.ok) throw new Error("Failed to load goal forecast.");
  return response.json();
};

const GoalModal = ({ goal, accounts, isOpen, onClose, onSaved }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setForm(
      goal
        ? {
            title: goal.title || "",
            targetAmount: String(goal.targetAmount ?? ""),
            initialAmount: String(goal.initialAmount ?? "0"),
            targetDate: toDateInput(goal.targetDate),
            linkedAccountId: goal.linkedAccountId ? String(goal.linkedAccountId) : "",
            description: goal.description || "",
          }
        : emptyForm
    );
  }, [goal, isOpen]);

  if (!isOpen) return null;

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async () => {
    if (!form.title.trim() || !form.targetAmount || !form.targetDate) {
      setError("Title, target amount, and target date are required.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      targetAmount: Number(form.targetAmount),
      initialAmount: Number(form.initialAmount || 0),
      targetDate: new Date(form.targetDate).toISOString(),
      linkedAccountId: form.linkedAccountId ? Number(form.linkedAccountId) : null,
      description: form.description.trim() || null,
    };

    if (payload.targetAmount <= 0) {
      setError("Target amount must be greater than zero.");
      return;
    }

    if (payload.initialAmount < 0 || payload.initialAmount > payload.targetAmount) {
      setError("Initial amount must be between zero and target amount.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(
        goal ? API_ENDPOINTS.updateFinancialGoal : API_ENDPOINTS.createFinancialGoal,
        {
          method: goal ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            goal
              ? {
                  ...payload,
                  id: goal.id,
                  createdAt: goal.createdAt,
                }
              : payload
          ),
        }
      );

      if (!response.ok) {
        throw new Error(goal ? "Failed to update goal." : "Failed to create goal.");
      }

      const savedGoal = await response.json().catch(() => null);
      onSaved(savedGoal);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <div className={styles["modal-header"]}>
          <h3>{goal ? "Edit goal" : "Create goal"}</h3>
          <button type="button" className={styles["icon-button"]} onClick={onClose}>
            x
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles["form-grid"]}>
          <label>
            Title
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </label>

          <label>
            Target amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.targetAmount}
              onChange={(e) => updateField("targetAmount", e.target.value)}
            />
          </label>

          <label>
            Already saved
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.initialAmount}
              onChange={(e) => updateField("initialAmount", e.target.value)}
            />
          </label>

          <label>
            Target date
            <input
              type="date"
              value={form.targetDate}
              onChange={(e) => updateField("targetDate", e.target.value)}
            />
          </label>

          <label className={styles["wide-field"]}>
            Linked savings account
            <select
              value={form.linkedAccountId}
              onChange={(e) => updateField("linkedAccountId", e.target.value)}
            >
              <option value="">Track all savings accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.title} - {money(account.amount)}
                </option>
              ))}
            </select>
          </label>

          <label className={styles["wide-field"]}>
            Description
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </label>
        </div>

        <div className={styles["modal-actions"]}>
          <button type="button" className={styles["secondary-button"]} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles["primary-button"]}
            disabled={saving}
            onClick={submit}
          >
            {saving ? "Saving..." : "Save goal"}
          </button>
        </div>
      </div>
    </div>
  );
};

const FinancialGoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [forecastsByGoalId, setForecastsByGoalId] = useState({});
  const [loading, setLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalGoal, setModalGoal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState(null);

  const savingsAccounts = useMemo(
    () =>
      accounts.filter((account) =>
        SAVINGS_ACCOUNT_TYPES.has(Number(account.type))
      ),
    [accounts]
  );

  const selectedGoal = useMemo(
    () => goals.find((goal) => String(goal.id) === String(selectedGoalId)) || null,
    [goals, selectedGoalId]
  );

  const loadGoalForecasts = useCallback(async (nextGoals) => {
    const entries = await Promise.all(
      nextGoals.map(async (goal) => {
        try {
          return [goal.id, await fetchGoalForecast(goal.id)];
        } catch {
          return [goal.id, null];
        }
      })
    );

    setForecastsByGoalId(
      entries.reduce((acc, [goalId, nextForecast]) => {
        if (nextForecast) acc[goalId] = nextForecast;
        return acc;
      }, {})
    );
  }, []);

  const loadGoals = useCallback(
    async (preferredGoalId, fallbackGoalId) => {
      const response = await fetch(API_ENDPOINTS.financialGoals);
      if (!response.ok) throw new Error("Failed to load goals.");

      const data = await response.json();
      const nextGoals = Array.isArray(data) ? data : [];
      setGoals(nextGoals);

      const nextSelected =
        nextGoals.find((goal) => String(goal.id) === String(preferredGoalId)) ||
        nextGoals.find((goal) => String(goal.id) === String(fallbackGoalId)) ||
        nextGoals[0] ||
        null;

      setSelectedGoalId(nextSelected?.id || null);
      await loadGoalForecasts(nextGoals);
      return nextSelected;
    },
    [loadGoalForecasts]
  );

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [accountsResponse] = await Promise.all([
        fetch(API_ENDPOINTS.accounts),
        loadGoals(),
      ]);

      if (!accountsResponse.ok) throw new Error("Failed to load accounts.");
      const accountsData = await accountsResponse.json();
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [loadGoals]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadForecast = useCallback(async (goalId) => {
    if (!goalId) {
      setForecast(null);
      return;
    }

    try {
      setForecastLoading(true);
      setApplyResult(null);
      const nextForecast = await fetchGoalForecast(goalId);
      setForecast(nextForecast);
      setForecastsByGoalId((current) => ({
        ...current,
        [goalId]: nextForecast,
      }));
    } catch (e) {
      setForecast(null);
      setError(e.message);
    } finally {
      setForecastLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForecast(selectedGoalId);
  }, [loadForecast, selectedGoalId]);

  const openCreate = () => {
    setModalGoal(null);
    setIsModalOpen(true);
  };

  const openEdit = () => {
    if (!selectedGoal) return;
    setModalGoal(selectedGoal);
    setIsModalOpen(true);
  };

  const handleSaved = async (savedGoal) => {
    try {
      setError(null);
      await loadGoals(savedGoal?.id);
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteGoal = async () => {
    if (!selectedGoal) return;
    if (!window.confirm(`Delete goal "${selectedGoal.title}"?`)) return;

    try {
      setDeletingId(selectedGoal.id);
      const response = await fetch(API_ENDPOINTS.deleteFinancialGoal(selectedGoal.id), {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete goal.");
      await loadGoals();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const applyBudgetAdjustments = async () => {
    if (!selectedGoal) return;
    if (
      !window.confirm(
        "Apply suggested limits to the active monthly budget plan?"
      )
    ) {
      return;
    }

    try {
      setApplying(true);
      setApplyResult(null);
      setError(null);
      const response = await fetch(
        API_ENDPOINTS.applyFinancialGoalBudgetAdjustments(selectedGoal.id),
        { method: "POST" }
      );
      if (!response.ok) throw new Error("Failed to apply budget adjustments.");
      const result = await response.json();
      setApplyResult(result);
      await loadForecast(selectedGoal.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setApplying(false);
    }
  };

  const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.targetAmount || 0), 0);
  const totalInitial = goals.reduce((sum, goal) => sum + Number(goal.initialAmount || 0), 0);
  const averageProgress =
    totalTarget > 0 ? Math.min(1, totalInitial / totalTarget) : 0;

  if (loading) return <p className={styles.state}>Loading goals...</p>;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <p className={styles.eyebrow}>Financial goals</p>
          <h2>Plan, forecast, and adjust budgets</h2>
        </div>
        <button type="button" className={styles["primary-button"]} onClick={openCreate}>
          + New goal
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.summary}>
        <div>
          <span>Total target</span>
          <strong>{money(totalTarget)}</strong>
        </div>
        <div>
          <span>Initial saved</span>
          <strong>{money(totalInitial)}</strong>
        </div>
        <div>
          <span>Tracked goals</span>
          <strong>{goals.length}</strong>
        </div>
        <div>
          <span>Initial progress</span>
          <strong>{percent(averageProgress)}</strong>
        </div>
      </div>

      {!goals.length ? (
        <div className={styles.empty}>
          <h3>No goals yet</h3>
          <p>Create the first goal to see progress forecasts and adaptive budget suggestions.</p>
          <button type="button" className={styles["primary-button"]} onClick={openCreate}>
            Create goal
          </button>
        </div>
      ) : (
        <div className={styles.layout}>
          <aside className={styles["goal-list"]}>
            {goals.map((goal) => {
              const isSelected = String(goal.id) === String(selectedGoalId);
              const cardForecast = forecastsByGoalId[goal.id];
              const progress = getProgress(goal, cardForecast);

              return (
                <button
                  type="button"
                  key={goal.id}
                  className={`${styles["goal-card"]} ${
                    isSelected ? styles["goal-card-active"] : ""
                  }`}
                  onClick={() => setSelectedGoalId(goal.id)}
                >
                  <span className={styles["goal-title"]}>{goal.title}</span>
                  <span className={styles["goal-meta"]}>
                    {money(goal.targetAmount)} by {formatDate(goal.targetDate)}
                  </span>
                  <span className={styles["progress-track"]}>
                    <span
                      className={styles["progress-fill"]}
                      style={{ width: percent(progress) }}
                    />
                  </span>
                  <span className={styles["goal-meta"]}>{percent(progress)} funded</span>
                </button>
              );
            })}
          </aside>

          <section className={styles.detail}>
            {selectedGoal && (
              <>
                <div className={styles["detail-header"]}>
                  <div>
                    <p className={styles.eyebrow}>Selected goal</p>
                    <h3>{selectedGoal.title}</h3>
                    <p>{selectedGoal.description || "No description"}</p>
                  </div>
                  <div className={styles["detail-actions"]}>
                    <button
                      type="button"
                      className={styles["secondary-button"]}
                      onClick={openEdit}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={styles["danger-button"]}
                      disabled={deletingId === selectedGoal.id}
                      onClick={deleteGoal}
                    >
                      {deletingId === selectedGoal.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                <div className={styles.metrics}>
                  <div>
                    <span>Target</span>
                    <strong>{money(selectedGoal.targetAmount)}</strong>
                  </div>
                  <div>
                    <span>Current saved</span>
                    <strong>{money(forecast?.currentSavedAmount ?? selectedGoal.initialAmount)}</strong>
                  </div>
                  <div>
                    <span>Remaining</span>
                    <strong>{money(forecast?.remainingAmount)}</strong>
                  </div>
                  <div>
                    <span>Deadline</span>
                    <strong>{formatDate(selectedGoal.targetDate)}</strong>
                  </div>
                </div>

                {forecastLoading ? (
                  <p className={styles.state}>Loading forecast...</p>
                ) : forecast ? (
                  <>
                    <div className={styles.forecast}>
                      <div className={styles["forecast-main"]}>
                        <span
                          className={`${styles.badge} ${
                            styles[`risk-${String(forecast.riskLevel || "low").toLowerCase()}`] ||
                            ""
                          }`}
                        >
                          {forecast.riskLevel}
                        </span>
                        <div className={styles["big-progress"]}>
                          <span
                            style={{
                              width: percent(forecast.progressRatio),
                            }}
                          />
                        </div>
                        <div className={styles["forecast-grid"]}>
                          <div>
                            <span>Required / month</span>
                            <strong>{money(forecast.requiredMonthlyContribution)}</strong>
                          </div>
                          <div>
                            <span>Projected / month</span>
                            <strong>{money(forecast.projectedMonthlyContribution)}</strong>
                          </div>
                          <div>
                            <span>Contribution gap</span>
                            <strong>{money(forecast.contributionGap)}</strong>
                          </div>
                          <div>
                            <span>Projected completion</span>
                            <strong>{formatDate(forecast.projectedCompletionDate)}</strong>
                          </div>
                        </div>
                      </div>

                      <div className={styles["forecast-side"]}>
                        <span className={styles["track-label"]}>
                          {forecast.isAchievable ? "On pace" : "Needs attention"}
                        </span>
                        <span className={styles["track-label"]}>
                          {forecast.isOffTrack ? "Behind schedule" : "Schedule is healthy"}
                        </span>
                        <p>
                          Expected by now: {money(forecast.expectedSavedAmountByNow)}
                        </p>
                        <p>
                          At target date: {money(forecast.forecastedAmountAtTargetDate)}
                        </p>
                      </div>
                    </div>

                    {forecast.warnings?.length > 0 && (
                      <div className={styles.panel}>
                        <h4>Warnings</h4>
                        <ul>
                          {forecast.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className={styles.panel}>
                      <div className={styles["panel-header"]}>
                        <h4>Budget adjustment suggestions</h4>
                        <button
                          type="button"
                          className={styles["secondary-button"]}
                          disabled={
                            applying ||
                            !forecast.suggestedBudgetAdjustments?.length
                          }
                          onClick={applyBudgetAdjustments}
                        >
                          {applying ? "Applying..." : "Apply to budget"}
                        </button>
                      </div>

                      {applyResult && (
                        <p className={styles.success}>
                          Applied {applyResult.appliedAdjustmentsCount} adjustments
                          {applyResult.budgetPlanId
                            ? ` to plan #${applyResult.budgetPlanId}.`
                            : "."}
                        </p>
                      )}

                      {forecast.suggestedBudgetAdjustments?.length ? (
                        <div className={styles["table-wrap"]}>
                          <table>
                            <thead>
                              <tr>
                                <th>Category</th>
                                <th>Average spend</th>
                                <th>Current limit</th>
                                <th>Recommended</th>
                                <th>Reduction</th>
                              </tr>
                            </thead>
                            <tbody>
                              {forecast.suggestedBudgetAdjustments.map((item) => (
                                <tr key={item.categoryId}>
                                  <td>{item.categoryTitle}</td>
                                  <td>{money(item.averageMonthlySpending)}</td>
                                  <td>{money(item.currentBudgetLimit)}</td>
                                  <td>{money(item.recommendedBudgetLimit)}</td>
                                  <td>{money(item.suggestedReduction)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className={styles.muted}>No budget reductions are needed right now.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className={styles.state}>Forecast is not available.</p>
                )}
              </>
            )}
          </section>
        </div>
      )}

      <GoalModal
        goal={modalGoal}
        accounts={savingsAccounts}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
};

export default FinancialGoalsPage;
