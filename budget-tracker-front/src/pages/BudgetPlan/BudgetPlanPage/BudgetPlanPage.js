import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import API_ENDPOINTS from "../../../config/apiConfig";
import { apiFetch, apiJson, getApiErrorMessage } from "../../../services/apiClient";
import { getDefaultMonthlyPlan, sortMonthlyPlans } from "../../../utils/budgetPlans";

import PlanDetails from "../PlanDetails/PlanDetails";
import PlanItemsTable from "../PlanItemsTable/PlanItemsTable";
import CreatePlanModal from "../CreatePlanModal/CreatePlanModal";
import EditPlanModal from "../EditPlanModal/EditPlanModal";
import AutoPlanModal from "../AutoPlanModal/AutoPlanModal";
import BudgetPlanExpensesTable from "../BudgetPlanExpensesTable/BudgetPlanExpensesTable";

import styles from "./BudgetPlanPage.module.css";

const BudgetPlanPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const planIdFromQuery = searchParams.get("planId");

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planItems, setPlanItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [events, setEvents] = useState([]);
  const [monthEndForecast, setMonthEndForecast] = useState(null);
  const [includeEvents, setIncludeEvents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  const [busyDel, setBusyDel] = useState(false);

useEffect(() => {
  const controller = new AbortController();
  (async () => {
    try {
      const data = await apiJson(
        API_ENDPOINTS.monthPlans,
        { signal: controller.signal },
        "Failed to load budget plans"
      );
      const sortedPlans = sortMonthlyPlans(data);
      setPlans(sortedPlans);
      if (!planIdFromQuery) {
        const defaultPlan = getDefaultMonthlyPlan(sortedPlans);
        if (defaultPlan) {
          setSearchParams({ planId: defaultPlan.id }, { replace: true });
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") setError(getApiErrorMessage(e));
    }
  })();
  return () => controller.abort();
}, [planIdFromQuery, setSearchParams]);

const fetchPlanData = useCallback(
  async (signal) => {
    if (!planIdFromQuery) {
      setSelectedPlan(null);
      setPlanItems([]);
      setTransactions([]);
      setEvents([]);
      setMonthEndForecast(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await apiJson(
        API_ENDPOINTS.budgetPlanPage(planIdFromQuery, includeEvents),
        signal ? { signal } : {},
        "Failed to load budget plan"
      );
      setSelectedPlan(data.plan);
      const baseItems = (data.items || []).filter((i) => !i.isEventSummary);
      setPlanItems(baseItems);
      setTransactions(data.transactions);
      setEvents(data.events || []);
      setMonthEndForecast(data.monthEndForecast || null);
    } catch (e) {
      if (e.name !== "AbortError") setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  },
  [planIdFromQuery, includeEvents]
);

useEffect(() => {
  const controller = new AbortController();
  fetchPlanData(controller.signal);
  return () => controller.abort();
}, [fetchPlanData]);

const reload = () => fetchPlanData();

const openGeneratedPlan = (result) => {
  const planId = result?.plan?.id;
  if (!planId) {
    window.location.reload();
    return;
  }

  window.location.href = `/budget-plans?planId=${planId}`;
};

const money = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const deletePlan = async () => {
    if (!selectedPlan) return;
    if (!window.confirm("Удалить этот план?")) return;
    try {
      setBusyDel(true);
      await apiFetch(API_ENDPOINTS.deleteBudgetPlan(selectedPlan.id), {
        method: "DELETE",
      }, "Failed to delete budget plan");
      setPlans((p) => p.filter((pl) => pl.id !== selectedPlan.id));
      setSelectedPlan(null);
      setPlanItems([]);
      setSearchParams({});
    } catch (e) {
      alert(getApiErrorMessage(e));
    } finally {
      setBusyDel(false);
    }
  };

  if (loading) return <p className={styles.loading}>Загрузка...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      {!plans.length && (
        <>
          <button
            className={styles["create-btn"]}
            onClick={() => setCreateOpen(true)}
          >
            + новый план
          </button>
          <button
            className={styles["auto-btn"]}
            onClick={() => setAutoOpen(true)}
          >
            Auto monthly
          </button>
          <p className={styles["no-plan-text"]}>Планов пока нет…</p>
        </>
      )}

      {selectedPlan && (
        <div className={styles.content}>
          <PlanDetails plan={selectedPlan} />
          {monthEndForecast && (
            <section className={styles["forecast-card"]}>
              <div>
                <span className={styles["forecast-label"]}>Projected by month end</span>
                <strong>{money(monthEndForecast.projectedTotalSpent)}</strong>
              </div>
              <div>
                <span className={styles["forecast-label"]}>Budget limit</span>
                <strong>{money(monthEndForecast.budgetLimit)}</strong>
              </div>
              <div>
                <span className={styles["forecast-label"]}>Projected remaining</span>
                <strong
                  className={
                    Number(monthEndForecast.projectedRemaining || 0) < 0
                      ? styles["forecast-danger"]
                      : styles["forecast-ok"]
                  }
                >
                  {money(monthEndForecast.projectedRemaining)}
                </strong>
              </div>
              <div>
                <span className={styles["forecast-label"]}>Recurring left</span>
                <strong>{money(monthEndForecast.futureRecurringSpending)}</strong>
              </div>
              <p>
                Based on {monthEndForecast.elapsedDays} elapsed days and{" "}
                {monthEndForecast.remainingDays} days left. Recurring expenses are added
                separately, so subscriptions, utilities and similar scheduled payments do
                not inflate the daily pace.
              </p>
            </section>
          )}
          <PlanItemsTable items={planItems} onReload={reload} />
          <div className={styles["plan-actions"]}>
            <label className={styles["events-toggle"]}>
              <input
                type="checkbox"
                checked={includeEvents}
                onChange={(e) => setIncludeEvents(e.target.checked)}
              />
              <span>показывать события</span>
            </label>
            <button
              className={styles["edit-btn"]}
              onClick={() => setEditOpen(true)}
            >
              ✎ редактировать
            </button>
            <button
              className={styles["delete-btn"]}
              onClick={deletePlan}
              disabled={busyDel}
            >
              {busyDel ? "…" : "✕ удалить"}
            </button>
            <button
              className={styles["create-btn"]}
              onClick={() => setCreateOpen(true)}
            >
              + новый
            </button>
            <button
              className={styles["auto-btn"]}
              onClick={() => setAutoOpen(true)}
            >
              Auto monthly
            </button>
          </div>
        </div>
      )}

      <div className={styles["plan-transactions"]}>
        <BudgetPlanExpensesTable transactions={transactions} onReload={reload} />
      </div>

      {includeEvents &&
        events.map((ev) => {
          const periodString = `${new Date(
            ev.plan.startDate
          ).toLocaleDateString()} – ${new Date(
            ev.plan.endDate
          ).toLocaleDateString()}`;
          return (
            <div key={ev.plan.id} className={styles["event-block"]}>
              <div className={styles["event-details"]}>
                <span className={styles["event-title"]}>
                  <strong>Название:</strong> {ev.plan.title}
                </span>
                <span className={styles["event-period"]}>
                  <strong>Период:</strong> {periodString}
                </span>
              </div>
              <BudgetPlanExpensesTable
                transactions={ev.transactions}
                onReload={reload}
              />
            </div>
          );
        })}

      <CreatePlanModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => window.location.reload()}
      />
      <EditPlanModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        plan={selectedPlan}
        items={planItems}
        onSaved={() => window.location.reload()}
      />
      <AutoPlanModal
        isOpen={autoOpen}
        onClose={() => setAutoOpen(false)}
        onCreated={openGeneratedPlan}
      />
    </div>
  );
};

export default BudgetPlanPage;
