export const MAX_VISIBLE_DASHBOARD_CARDS = 4;

export const DEFAULT_VISIBLE_DASHBOARD_CARDS = [
  "accounts",
  "topExpenses",
  "topIncomes",
  "financialStability",
];

export const DASHBOARD_CARD_OPTIONS = [
  { id: "accounts", label: "Accounts" },
  { id: "topExpenses", label: "Top Expenses" },
  { id: "topIncomes", label: "Top Incomes" },
  { id: "biggestTransaction", label: "Biggest Transaction" },
  { id: "financialStability", label: "Financial Stability" },
];

export const DASHBOARD_CARDS_STORAGE_KEY = "dashboard-visible-cards";
export const DASHBOARD_CARDS_EVENT = "dashboard-visible-cards-change";

const validCardIds = new Set(DASHBOARD_CARD_OPTIONS.map(({ id }) => id));

export const normalizeDashboardCards = (cards) => {
  if (!Array.isArray(cards)) {
    return DEFAULT_VISIBLE_DASHBOARD_CARDS;
  }

  return cards
    .filter((id, index) => validCardIds.has(id) && cards.indexOf(id) === index)
    .slice(0, MAX_VISIBLE_DASHBOARD_CARDS);
};

export const readVisibleDashboardCards = () => {
  try {
    const stored = window.localStorage.getItem(DASHBOARD_CARDS_STORAGE_KEY);

    if (!stored) {
      return DEFAULT_VISIBLE_DASHBOARD_CARDS;
    }

    return normalizeDashboardCards(JSON.parse(stored));
  } catch {
    return DEFAULT_VISIBLE_DASHBOARD_CARDS;
  }
};

export const writeVisibleDashboardCards = (cards) => {
  const normalizedCards = normalizeDashboardCards(cards);

  window.localStorage.setItem(
    DASHBOARD_CARDS_STORAGE_KEY,
    JSON.stringify(normalizedCards)
  );
  window.dispatchEvent(
    new CustomEvent(DASHBOARD_CARDS_EVENT, { detail: normalizedCards })
  );

  return normalizedCards;
};
