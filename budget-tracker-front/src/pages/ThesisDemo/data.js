export const thesisDemoScenarios = [
  {
    id: "4-1",
    section: "4.1",
    shortTitle: "Setup",
    title: "Experimental Study Setup",
    objective:
      "The test verified the structure of the financial history: accounts, categories, planning rules, financial goals, recurring payments and six months of transactions.",
    dataset:
      "Input data: 6 months of financial history, 5 accounts, 21 categories, 7 budget plans, 372 transactions, 9 recurring payments and 2 financial goals.",
    conclusion:
      "The prepared data covers every algorithm tested in section 4.",
    inputTitle: "Input data",
    resultTitle: "Preparation result",
    metrics: [
      { label: "Accounts", value: "5" },
      { label: "Categories", value: "21" },
      { label: "Budget plans", value: "7" },
      { label: "Transactions", value: "372" },
      { label: "Recurring payments", value: "9" },
      { label: "Financial goals", value: "2" },
    ],
    tableColumns: ["Data block", "Value", "Purpose"],
    tableRows: [
      ["Accounts", "Main card, savings, emergency fund, cash, investments", "Balance and transfer checks"],
      ["Categories", "Rent, supermarket, utilities, fuel, gifts, entertainment", "Priority and limit checks"],
      ["History", "November 2025 - May 2026", "Trend and forecast calculation"],
      ["Rules", "Coefficients, minimums, maximums, cut type", "Auto-plan transparency check"],
    ],
    notes: [
      "Analysis period: 01.11.2025 - 31.05.2026.",
      "Average monthly income: UAH 135,000; average expenses: UAH 82,450.",
      "Six full months are available for trends, indexes and forecasts.",
      "Covered 5 core algorithms: auto-plan, stability, behavioral index, goal forecast and budget adjustment.",
    ],
  },
  {
    id: "4-2",
    section: "4.2",
    shortTitle: "Auto-plan",
    title: "Automatic Budget Generation Algorithm Test",
    objective:
      "The test verified how the next monthly plan is recalculated from income, spending history, category priorities, rules, financial goals and current financial state.",
    dataset:
      "Input data: income UAH 138,000, previous budget UAH 108,400, goal reserve UAH 22,000, December gifts coefficient 1.65.",
    conclusion:
      "The algorithm generated a new plan with configured coefficients, protected mandatory categories and reserved money for the financial goal.",
    inputTitle: "Input data",
    resultTitle: "Generated plan",
    metrics: [
      { label: "Income", value: "UAH 138,000" },
      { label: "Previous plan", value: "UAH 108,400" },
      { label: "Goal reserve", value: "UAH 22,000" },
      { label: "Free balance", value: "UAH 7,600" },
    ],
    tableColumns: ["Category", "Before", "Rule", "After"],
    tableRows: [
      ["Rent", "UAH 32,000", "Mandatory, do not cut", "UAH 32,000"],
      ["Utilities", "UAH 7,800", "Winter coefficient 1.35", "UAH 10,530"],
      ["Gifts", "UAH 5,000", "December coefficient 1.65", "UAH 8,250"],
      ["Food delivery", "UAH 9,600", "Optional, reduce", "UAH 5,760"],
      ["Entertainment", "UAH 12,500", "Flexible, goal pressure", "UAH 6,875"],
      ["Other", "UAH 7,500", "Unplanned expense reserve", "UAH 5,250"],
    ],
    notes: [
      "New budget: UAH 101,665; change from previous plan: -UAH 6,735.",
      "Gifts increased by UAH 3,250: 5,000 -> 8,250.",
      "Utilities increased by UAH 2,730: 7,800 -> 10,530.",
      "Entertainment reduced by UAH 5,625: 12,500 -> 6,875.",
      "After the UAH 22,000 reserve, the plan stays within income: 101,665 + 22,000 = 123,665 < 138,000.",
    ],
  },
  {
    id: "4-3",
    section: "4.3",
    shortTitle: "Stability",
    title: "Financial Stability Index Algorithm Test",
    objective:
      "The test verified how reserve, savings share, income stability, mandatory expenses and budget overruns affect financial stability.",
    dataset:
      "Input data: a stable state was compared with a risk state where income is unstable, reserve is low and budget overruns repeat.",
    conclusion:
      "The index dropped when income, reserve, mandatory expenses and overrun frequency worsened.",
    inputTitle: "Input data",
    resultTitle: "Calculated index",
    metrics: [
      { label: "Stable index", value: "82 HIGH" },
      { label: "Risk index", value: "43 LOW" },
      { label: "Reserve", value: "4.8 -> 0.7 mo" },
      { label: "Overspending", value: "3% -> 31%" },
    ],
    tableColumns: ["Factor", "Stable state", "Risk state"],
    tableRows: [
      ["Savings share", "18.5%", "2.0%"],
      ["Income stability", "94%", "48%"],
      ["Mandatory expenses", "52%", "78%"],
      ["Emergency fund", "4.8 months", "0.7 months"],
      ["Budget overspending", "3%", "31%"],
    ],
    notes: [
      "Financial stability: 82 -> 43, a 39 point drop.",
      "Emergency fund decreased 6.9 times: 4.8 mo -> 0.7 mo.",
      "Mandatory expense share increased by 26 p.p.: 52% -> 78%.",
      "Income stability decreased by 46 p.p.: 94% -> 48%.",
      "Budget overrun frequency increased by 28 p.p.: 3% -> 31%.",
    ],
  },
  {
    id: "4-4",
    section: "4.4",
    shortTitle: "Behavior",
    title: "Behavioral Financial Index Algorithm Test",
    objective:
      "The test verified how limit adherence, impulse spending, savings rhythm and warning response affect the behavioral index.",
    dataset:
      "Input data: a disciplined month was compared with a month containing frequent unplanned and large purchases.",
    conclusion:
      "The behavioral index declined because limit control, impulse control and savings regularity worsened.",
    inputTitle: "Input data",
    resultTitle: "Calculated index",
    metrics: [
      { label: "Disciplined", value: "91" },
      { label: "Impulsive", value: "56" },
      { label: "Impulse tx", value: "1 -> 9" },
      { label: "Savings months", value: "6/6 -> 2/6" },
    ],
    tableColumns: ["Behavior factor", "Disciplined month", "Impulsive month"],
    tableRows: [
      ["Limit adherence", "96%", "61%"],
      ["Impulse control", "92%", "34%"],
      ["Savings rhythm", "100%", "33%"],
      ["Warning response", "88%", "41%"],
      ["Transactions outside plan", "2", "17"],
    ],
    notes: [
      "Behavioral index: 91 -> 56, a 35 point drop.",
      "Limit adherence decreased by 35 p.p.: 96% -> 61%.",
      "Impulse control decreased by 58 p.p.: 92% -> 34%.",
      "Transactions outside the plan increased from 2 to 17.",
      "Savings regularity decreased from 6/6 to 2/6 months.",
    ],
  },
  {
    id: "4-5",
    section: "4.5",
    shortTitle: "Goal forecast",
    title: "Financial Goal Achievement Forecast Algorithm Test",
    objective:
      "The test verified how current savings, target amount, deadline and contribution pace affect goal achievement forecast.",
    dataset:
      "Input data: the emergency fund is on schedule, while the laptop purchase is behind the required savings pace.",
    conclusion:
      "The algorithm calculated progress, required monthly contribution, expected completion date and risk level for each goal.",
    inputTitle: "Input data",
    resultTitle: "Forecast result",
    metrics: [
      { label: "Emergency fund", value: "70%" },
      { label: "Laptop", value: "34%" },
      { label: "Required / month", value: "UAH 9,000 -> 17,000" },
      { label: "Forecast", value: "on time / late" },
    ],
    tableColumns: ["Goal", "Saved", "Target", "Forecast"],
    tableRows: [
      ["Emergency fund", "UAH 168,000", "UAH 240,000", "5 days before deadline"],
      ["Laptop", "UAH 27,200", "UAH 80,000", "2 months after deadline"],
      ["Vacation", "UAH 44,000", "UAH 72,000", "On time with UAH 7,000/month"],
    ],
    notes: [
      "Emergency fund: progress 70%, remaining UAH 72,000, required UAH 9,000/month.",
      "Laptop: progress 34%, remaining UAH 52,800, required UAH 17,000/month.",
      "Current forecasted contribution for laptop: UAH 7,400/month.",
      "Contribution deficit: 17,000 - 7,400 = UAH 9,600/month.",
      "Laptop risk level: HIGH; expected delay: 2 months.",
    ],
  },
  {
    id: "4-6",
    section: "4.6",
    shortTitle: "Adjustment",
    title: "Goal-Based Budget Adjustment Algorithm Test",
    objective:
      "The test verified how the system proposes safe budget reductions to free money for a financial goal.",
    dataset:
      "Input data: the Phone goal requires an additional UAH 9,000/month; the current plan contains flexible and optional categories with available reduction reserve.",
    conclusion:
      "The algorithm does not cut mandatory categories, limits reduction size and applies only rows confirmed by the user.",
    inputTitle: "Input data",
    resultTitle: "Applied adjustments",
    metrics: [
      { label: "Deficit / month", value: "UAH 9,000" },
      { label: "Suggested", value: "6 rows" },
      { label: "Applied", value: "4 rows" },
      { label: "Freed", value: "UAH 9,100" },
    ],
    tableColumns: ["Category", "Current limit", "Action", "New limit"],
    tableRows: [
      ["Entertainment", "UAH 12,500", "Reduce by UAH 2,200", "UAH 10,300"],
      ["Food delivery", "UAH 9,600", "Reduce by UAH 1,600", "UAH 8,000"],
      ["Coffee", "UAH 3,200", "Do not apply", "UAH 3,200"],
      ["Shopping", "UAH 14,000", "Reduce by UAH 3,000", "UAH 11,000"],
      ["Taxi", "UAH 7,500", "Reduce by UAH 2,300", "UAH 5,200"],
      ["Rent", "UAH 32,000", "Protected", "UAH 32,000"],
    ],
    notes: [
      "Required additional contribution: UAH 9,000/month.",
      "Applied reduction: 2,200 + 1,600 + 3,000 + 2,300 = UAH 9,100.",
      "Requirement exceeded by: 9,100 - 9,000 = UAH 100.",
      "Rent remained unchanged: 32,000 -> 32,000.",
      "Repeated suggestions for already adjusted categories are not generated in the same plan.",
    ],
  },
  {
    id: "4-7",
    section: "4.7",
    shortTitle: "Efficiency",
    title: "Software Efficiency Evaluation",
    objective:
      "The practical effect of the system was evaluated: fewer manual actions, earlier risk detection, clearer decisions and budget adjustment.",
    dataset:
      "Input data: manual planning was compared with algorithm-assisted planning during one month.",
    conclusion:
      "The software reduced planning time, lowered overspending risk and improved the goal achievement forecast.",
    inputTitle: "Input data",
    resultTitle: "Efficiency evaluation",
    metrics: [
      { label: "Manual actions", value: "28 -> 9" },
      { label: "Planning time", value: "18 -> 6 min" },
      { label: "Overspending risk", value: "HIGH -> MEDIUM" },
      { label: "Goal forecast", value: "late -> on track" },
    ],
    tableColumns: ["Criterion", "Before use", "After use"],
    tableRows: [
      ["Budget creation", "28 manual actions", "9 actions after auto-plan"],
      ["Risk detection", "After overspending", "Before month end by forecast"],
      ["Goal control", "No budget connection", "Budget adjusted for goal"],
      ["User control", "Manual recalculation", "Editable suggestions before applying"],
    ],
    notes: [
      "Manual action count decreased by 19: 28 -> 9.",
      "Planning time decreased by 12 min: 18 min -> 6 min.",
      "Overspending risk decreased from HIGH to MEDIUM.",
      "Goal forecast changed from late to on track after budget adjustment.",
      "Freed budget for the goal: UAH 9,100/month.",
    ],
  },
];

export const getThesisDemoScenario = (id) =>
  thesisDemoScenarios.find((scenario) => scenario.id === id) || thesisDemoScenarios[0];
