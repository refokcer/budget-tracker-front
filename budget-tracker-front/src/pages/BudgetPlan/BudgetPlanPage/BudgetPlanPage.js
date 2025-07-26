import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API_ENDPOINTS from "../../../config/apiConfig";

import PlanDetails from "../PlanDetails/PlanDetails";
import PlanItemsTable from "../PlanItemsTable/PlanItemsTable";
import CreatePlanModal from "../CreatePlanModal/CreatePlanModal";
import EditPlanModal from "../EditPlanModal/EditPlanModal";
import BudgetPlanExpensesTable from "../BudgetPlanExpensesTable/BudgetPlanExpensesTable";

import styles from "./BudgetPlanPage.module.css";

const BudgetPlanPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const planIdFromQuery = searchParams.get("planId");

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planItems, setPlanItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [busyDel, setBusyDel] = useState(false);

useEffect(() => {
  const controller = new AbortController();
  (async () => {
    try {
      const r = await fetch(API_ENDPOINTS.budgetPlans, { signal: controller.signal });
      if (!r.ok) throw new Error("Ошибка при загрузке планов");
      const data = await r.json();
      setPlans(data);
      if (!planIdFromQuery && data.length)
        setSearchParams({ planId: data[0].id });
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message);
    }
  })();
  return () => controller.abort();
}, [planIdFromQuery, setSearchParams]);

useEffect(() => {
  if (!planIdFromQuery) {
    setSelectedPlan(null);
    setPlanItems([]);
    return;
  }
  const controller = new AbortController();
  (async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_ENDPOINTS.budgetPlanPage(planIdFromQuery), { signal: controller.signal });
      if (!res.ok) throw new Error("Ошибка при загрузке плана");
      const data = await res.json();
      setSelectedPlan(data.plan);
      setPlanItems(data.items);
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message);
    } finally {
      setLoading(false);
    }
  })();
  return () => controller.abort();
}, [planIdFromQuery]);

  const deletePlan = async () => {
    if (!selectedPlan) return;
    if (!window.confirm("Удалить этот план?")) return;
    try {
      setBusyDel(true);
      const r = await fetch(API_ENDPOINTS.deleteBudgetPlan(selectedPlan.id), {
        method: "DELETE",
      });
      if (!r.ok) throw new Error("Ошибка удаления плана");
      setPlans((p) => p.filter((pl) => pl.id !== selectedPlan.id));
      setSelectedPlan(null);
      setPlanItems([]);
      setSearchParams({});
    } catch (e) {
      alert(e.message);
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
          <p className={styles["no-plan-text"]}>Планов пока нет…</p>
        </>
      )}

      {selectedPlan && (
        <div className={styles.content}>
          <PlanDetails plan={selectedPlan} />
          <PlanItemsTable items={planItems} />
          <div className={styles["plan-actions"]}>
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
          </div>
        </div>
      )}

      <BudgetPlanExpensesTable budgetPlanId={selectedPlan ? selectedPlan.id : planIdFromQuery} />

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
    </div>
  );
};

export default BudgetPlanPage;
