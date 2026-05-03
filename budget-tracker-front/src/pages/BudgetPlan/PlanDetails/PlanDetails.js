import styles from "./PlanDetails.module.css";

const PlanDetails = ({ plan }) => {
  if (!plan) return null;

  const periodString = `${new Date(
    plan.startDate
  ).toLocaleDateString()} - ${new Date(plan.endDate).toLocaleDateString()}`;
  const typeString =
    plan.type === 0 ? "Monthly" : plan.type === 1 ? "Event" : "Not set";

  return (
    <div className={styles["plan-details-inline"]}>
      <div className={styles["plan-meta-row"]}>
        <span className={styles["plan-title"]}>
          <strong>Name:</strong> {plan.title || "Untitled"}
        </span>
        <span className={styles["plan-period"]}>
          <strong>Period:</strong> {periodString}
        </span>
        <span className={styles["plan-type"]}>
          <strong>Type:</strong> {typeString}
        </span>
      </div>
      {plan.description && (
        <p className={styles["plan-description"]}>
          <strong>Description:</strong> {plan.description}
        </p>
      )}
    </div>
  );
};

export default PlanDetails;
