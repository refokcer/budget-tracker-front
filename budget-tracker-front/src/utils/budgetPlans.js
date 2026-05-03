export const sortMonthlyPlans = (plans) =>
  [...(plans || [])].sort(
    (left, right) => new Date(right.startDate) - new Date(left.startDate)
  );

export const findCurrentMonthlyPlan = (plans, date = new Date()) => {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const nextMonthStart = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  return sortMonthlyPlans(plans).find((plan) => {
    const planStart = new Date(plan.startDate);
    const planEnd = new Date(plan.endDate);

    return planStart < nextMonthStart && planEnd >= monthStart;
  });
};

export const getDefaultMonthlyPlan = (plans, date = new Date()) => {
  const sortedPlans = sortMonthlyPlans(plans);
  return findCurrentMonthlyPlan(sortedPlans, date) || sortedPlans[0] || null;
};
