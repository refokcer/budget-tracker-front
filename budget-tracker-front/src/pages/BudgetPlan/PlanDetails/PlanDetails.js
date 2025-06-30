import styles from "./PlanDetails.module.css";

const PlanDetails = ({ plan }) => {
  if (!plan) return null;

  const periodString = `${new Date(
    plan.startDate
  ).toLocaleDateString()} – ${new Date(plan.endDate).toLocaleDateString()}`;
  const typeString =
    plan.type === 0 ? "Monthly" : plan.type === 1 ? "Event" : "Не указан";

  return (
    <div className={styles["plan-details-inline"]}>
      <span className={styles["plan-title"]}>
        <strong>Название:</strong> {plan.title || "Без названия"}
      </span>
      <span className={styles["plan-period"]}>
        <strong>Период:</strong> {periodString}
      </span>
      <span className={styles["plan-type"]}>
        <strong>Тип:</strong> {typeString}
      </span>
      <span className={styles["plan-description"]}>
        <strong>Описание:</strong> {plan.description || "Нет описания"}
      </span>
    </div>
  );
};

export default PlanDetails;
