import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import API_ENDPOINTS from "../../../config/apiConfig";

import PlanDetails from "../../BudgetPlan/PlanDetails/PlanDetails";
import PlanItemsTable from "../../BudgetPlan/PlanItemsTable/PlanItemsTable";
import BudgetPlanExpensesTable from "../../BudgetPlan/BudgetPlanExpensesTable/BudgetPlanExpensesTable";
import CreateEventModal from "../CreateEventModal/CreateEventModal";
import EditEventModal from "../EditEventModal/EditEventModal";

import styles from "./EventsPage.module.css";

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const eventIdFromQuery = searchParams.get("eventId");

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [planItems, setPlanItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [busyDel, setBusyDel] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const r = await fetch(API_ENDPOINTS.eventPlans, { signal: controller.signal });
        if (!r.ok) throw new Error("Ошибка при загрузке событий");
        const data = await r.json();
        setEvents(data);
        if (!eventIdFromQuery && data.length)
          setSearchParams({ eventId: data[0].id });
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message);
      }
    })();
    return () => controller.abort();
  }, [eventIdFromQuery, setSearchParams]);

  const fetchEventData = useCallback(
    async (signal) => {
      if (!eventIdFromQuery) {
        setSelectedEvent(null);
        setPlanItems([]);
        setTransactions([]);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          API_ENDPOINTS.eventPage(eventIdFromQuery),
          signal ? { signal } : {}
        );
        if (!res.ok) throw new Error("Ошибка при загрузке события");
        const data = await res.json();
        setSelectedEvent(data.plan);
        setPlanItems(data.items || []);
        setTransactions(data.transactions || []);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [eventIdFromQuery]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchEventData(controller.signal);
    return () => controller.abort();
  }, [fetchEventData]);

  const reload = () => fetchEventData();

  const deleteEvent = async () => {
    if (!selectedEvent) return;
    if (!window.confirm("Удалить это событие?")) return;
    try {
      setBusyDel(true);
      const r = await fetch(API_ENDPOINTS.deleteBudgetPlan(selectedEvent.id), {
        method: "DELETE",
      });
      if (!r.ok) throw new Error("Ошибка удаления события");
      setEvents((p) => p.filter((ev) => ev.id !== selectedEvent.id));
      setSelectedEvent(null);
      setPlanItems([]);
      setTransactions([]);
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
      {!events.length && (
        <>
          <button
            className={styles["create-btn"]}
            onClick={() => setCreateOpen(true)}
          >
            + новое событие
          </button>
          <p className={styles["no-plan-text"]}>Событий пока нет…</p>
        </>
      )}

      {selectedEvent && (
        <div className={styles.content}>
          <PlanDetails plan={selectedEvent} />
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
              onClick={deleteEvent}
              disabled={busyDel}
            >
              {busyDel ? "…" : "✕ удалить"}
            </button>
            <button
              className={styles["create-btn"]}
              onClick={() => setCreateOpen(true)}
            >
              + новое
            </button>
          </div>
        </div>
      )}

      <div className={styles["plan-transactions"]}>
        <BudgetPlanExpensesTable transactions={transactions} onReload={reload} />
      </div>

      <CreateEventModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => window.location.reload()}
      />
      <EditEventModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        event={selectedEvent}
        items={planItems}
        onSaved={() => window.location.reload()}
      />
    </div>
  );
};

export default EventsPage;
