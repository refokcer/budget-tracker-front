// src/config/apiConfig.js

const API_BASE_URL = "https://localhost:7281/api";

export const API_ENDPOINTS = {
  // Accounts
  accounts: `${API_BASE_URL}/Accounts`,
  createAccount: `${API_BASE_URL}/Accounts`,
  updateAccount: `${API_BASE_URL}/Accounts`,
  accountById: (id) => `${API_BASE_URL}/Accounts/${id}`,
  deleteAccount: (id) => `${API_BASE_URL}/Accounts/${id}`,

  // Bufget Plan Items
  budgetPlanItems: `${API_BASE_URL}/BudgetPlanItems`,
  createBudgetPlanItem: `${API_BASE_URL}/BudgetPlanItems`,
  updateBudgetPlanItem: `${API_BASE_URL}/BudgetPlanItems`,
  budgetPlanItemById: (id) => `${API_BASE_URL}/BudgetPlanItems/${id}`,
  deleteBudgetPlanItem: (id) => `${API_BASE_URL}/BudgetPlanItems/${id}`,
  budgetPlanItemsByPlan: (planId) => `${API_BASE_URL}/BudgetPlanItems/byPlan/${planId}`,

  // Budget Plans
  budgetPlans: `${API_BASE_URL}/BudgetPlans`,
  createBudgetPlan: `${API_BASE_URL}/BudgetPlans`,
  updateBudgetPlan: `${API_BASE_URL}/BudgetPlans`,
  budgetPlanById: (id) => `${API_BASE_URL}/BudgetPlans/${id}`,
  deleteBudgetPlan: (id) => `${API_BASE_URL}/BudgetPlans/${id}`,

  // Categories
  categories: `${API_BASE_URL}/Categories`,
  createCategory: `${API_BASE_URL}/Categories`,
  updateCategory: `${API_BASE_URL}/Categories`,
  categoryById: (id) => `${API_BASE_URL}/Categories/${id}`,
  deleteCategory: (id) => `${API_BASE_URL}/Categories/${id}`,

  categoriesExpenses: `${API_BASE_URL}/Categories/expenses`,
  categoriesIncomes: `${API_BASE_URL}/Categories/income`,
  categoriesTransfers: `${API_BASE_URL}/Categories/Transfers`,

  // Currencies
  currencies: `${API_BASE_URL}/Currencies`,
  createCurrency: `${API_BASE_URL}/Currencies`,
  updateCurrency: `${API_BASE_URL}/Currencies`,
  currencyById: (id) => `${API_BASE_URL}/Currencies/${id}`,
  deleteCurrency: (id) => `${API_BASE_URL}/Currencies/${id}`,

  // Events
  events: `${API_BASE_URL}/Events`,
  createEvent: `${API_BASE_URL}/Events`,
  updateEvent: `${API_BASE_URL}/Events`,
  eventById: (id) => `${API_BASE_URL}/Events/${id}`,
  deleteEvent: (id) => `${API_BASE_URL}/Events/${id}`,
  eventWithTransactions: (id) => `${API_BASE_URL}/Events/${id}/withTransactions`,

  // Expenses
  expenses: `${API_BASE_URL}/Expenses`,
  createExpense: `${API_BASE_URL}/Expenses`,
  expensesByDate: (start, end) => `${API_BASE_URL}/Expenses/filter?start=${start}&end=${end}`,
  expensesByEvent: (eventId) => `${API_BASE_URL}/Expenses/event/${eventId}`,

  // Incomes
  incomes: `${API_BASE_URL}/Income`,
  createIncome: `${API_BASE_URL}/Income`,
  incomesByDate: (start, end) => `${API_BASE_URL}/Income/filter?start=${start}&end=${end}`,
  incomesByEvent: (eventId) => `${API_BASE_URL}/Income/event/${eventId}`,

  // Transactions
  transactions: `${API_BASE_URL}/Transactions`,
  updateTransaction: `${API_BASE_URL}/Transactions`,
  transactionById: (id) => `${API_BASE_URL}/Transactions/${id}`,
  deleteTransaction: (id) => `${API_BASE_URL}/Transactions/${id}`,
  transactionsByEvent: (eventId) =>
    `${API_BASE_URL}/Transactions/byEvent/${eventId}`,
  transactionsByPlan: (planId) =>
    `${API_BASE_URL}/Transactions/byPlan/${planId}`,
  transactionsByFilter: (params = {}) => {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(
        ([k, v]) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(
            v instanceof Date ? v.toISOString() : v
          )}`
      )
      .join("&");
    return `${API_BASE_URL}/Transactions/filter${query ? "?" + query : ""}`;
  },

// Пример использования:
// Получить транзакции с типом 2:
// import API_ENDPOINTS from 'src/config/apiConfig';
// const url = API_ENDPOINTS.transactionsByFilter({ type: 2 });

// Пример использования с датами от начала текущего месяца до конца:
// import API_ENDPOINTS from 'src/config/apiConfig';
// const now = new Date();
// const start = new Date(now.getFullYear(), now.getMonth(), 1);
// const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
// const url = API_ENDPOINTS.transactionsByFilter({ start, end });

  // Transfers
  transfers: `${API_BASE_URL}/Transfers`,
  createTransfer: `${API_BASE_URL}/Transfers`,
  transfersByDate: (start, end) =>
    `${API_BASE_URL}/Transfers/filter?start=${start}&end=${end}`,
  transfersByEvent: (eventId) => `${API_BASE_URL}/Transfers/event/${eventId}`,

  // Aggregated models for pages
  budgetPlanPage: (planId) => `${API_BASE_URL}/pages/budgetPlanPage/${planId}`,
  expensesTable: (month, year) =>
    `${API_BASE_URL}/pages/expensesByMonth/${month}?year=${year}`,
  incomesTable: (month, year) =>
    `${API_BASE_URL}/pages/incomesByMonth/${month}?year=${year}`,
  transfersTable: (month, year) =>
    `${API_BASE_URL}/pages/transfersByMonth/${month}?year=${year}`,
  dashboardPage: `${API_BASE_URL}/pages/dashboard`,
  monthlyReport: (month, year) =>
    `${API_BASE_URL}/pages/monthlyReport/${month}?year=${year}`,

  // Aggregated models for components
  incomeModal: `${API_BASE_URL}/components/incomeModal`,
  expenseModal: `${API_BASE_URL}/components/expenseModal`,
  transferModal: `${API_BASE_URL}/components/transferModal`,
  editPlanModal: `${API_BASE_URL}/components/editPlanModal`,
  manageAccounts: `${API_BASE_URL}/components/manageAccounts`,
  manageCategories: (type) =>
    `${API_BASE_URL}/components/manageCategories/${type}`,
  header: `${API_BASE_URL}/Components/Header`,
};

export default API_ENDPOINTS;
