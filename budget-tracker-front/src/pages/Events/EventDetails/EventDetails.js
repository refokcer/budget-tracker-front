import styles from "./EventDetails.module.css";

const EventDetails = ({ event }) => {
  if (!event) return null;

  const periodString =
    event.startDate && event.endDate
      ? `${new Date(event.startDate).toLocaleDateString()} – ${new Date(event.endDate).toLocaleDateString()}`
      : null;

  return (
    <div className={styles["event-details-inline"]}>
      <span className={styles["event-title"]}>
        <strong>Название:</strong> {event.title || "Без названия"}
      </span>
      {periodString && (
        <span className={styles["event-period"]}>
          <strong>Период:</strong> {periodString}
        </span>
      )}
      <span className={styles["event-amount"]}>
        <strong>Сумма:</strong> {event.amount} {event.currencySymbol}
      </span>
      <span className={styles["event-spent"]}>
        <strong>Потрачено:</strong> {event.spent} {event.currencySymbol}
      </span>
      <span className={styles["event-remaining"]}>
        <strong>Осталось:</strong> {event.remaining} {event.currencySymbol}
      </span>
      <span className={styles["event-description"]}>
        <strong>Описание:</strong> {event.description || "Нет описания"}
      </span>
    </div>
  );
};

export default EventDetails;
