// src/config/apiConfig.js

const API_BASE_URL = "https://localhost:7281/api";

export const API_ENDPOINTS = {
  // Transactions
  transactions: `${API_BASE_URL}/Transactions`,
  transactionById: (id) => `${API_BASE_URL}/Transactions/${id}`,
  createTransaction: `${API_BASE_URL}/Transactions`,
  updateTransaction: `${API_BASE_URL}/Transactions`,
  deleteTransaction: (id) => `${API_BASE_URL}/Transactions/${id}`,
  createExpense: `${API_BASE_URL}/Expenses`,
  createIncome: `${API_BASE_URL}/Income`,
  createTransfer: `${API_BASE_URL}/Transfers`,
  expenses: `${API_BASE_URL}/Transactions/expense`,
  expensesByDate: (start, end) => `${API_BASE_URL}/Transactions/expense/filter?start=${start}&end=${end}`,
  transactionsByEvent: (eventId) => `${API_BASE_URL}/Transactions/byEvent/${eventId}`,

  // Expenses (если используется отдельный контроллер)
  expensesAll: `${API_BASE_URL}/Expenses`,
  expensesByPeriod: (start, end) => `${API_BASE_URL}/Expenses/filter?start=${start}&end=${end}`,
  expensesByEvent: (eventId) => `${API_BASE_URL}/Expenses/event/${eventId}`,
  createExpenseSeparate: `${API_BASE_URL}/Expenses`,

  // Budget Plan Items
  budgetPlanItems: `${API_BASE_URL}/BudgetPlanItems`,
  budgetPlanItemById: (id) => `${API_BASE_URL}/BudgetPlanItems/${id}`,
  createBudgetPlanItem: `${API_BASE_URL}/BudgetPlanItems`,
  updateBudgetPlanItem: `${API_BASE_URL}/BudgetPlanItems`,
  deleteBudgetPlanItem: (id) => `${API_BASE_URL}/BudgetPlanItems/${id}`,
  budgetPlanItemsByPlan: (planId) => `${API_BASE_URL}/BudgetPlanItems/byPlan/${planId}`,

  // Budget Plans
  budgetPlans: `${API_BASE_URL}/BudgetPlans`,
  budgetPlanById: (id) => `${API_BASE_URL}/BudgetPlans/${id}`,
  createBudgetPlan: `${API_BASE_URL}/BudgetPlans`,
  updateBudgetPlan: (id) => `${API_BASE_URL}/BudgetPlans/${id}`,
  deleteBudgetPlan: (id) => `${API_BASE_URL}/BudgetPlans/${id}`,

  // Events
  events: `${API_BASE_URL}/Events`,
  eventById: (id) => `${API_BASE_URL}/Events/${id}`,
  createEvent: `${API_BASE_URL}/Events`,
  updateEvent: (id) => `${API_BASE_URL}/Events/${id}`,
  deleteEvent: (id) => `${API_BASE_URL}/Events/${id}`,
  eventWithTransactions: (id) => `${API_BASE_URL}/Events/${id}/withTransactions`,

  // Categories
  categories: `${API_BASE_URL}/Categories`,
  categoryById: (id) => `${API_BASE_URL}/Categories/${id}`,
  createCategory: `${API_BASE_URL}/Categories`,
  updateCategory: (id) => `${API_BASE_URL}/Categories/${id}`,
  deleteCategory: (id) => `${API_BASE_URL}/Categories/${id}`,

  // Currencies
  currencies: `${API_BASE_URL}/Currencies`,
  currencyById: (id) => `${API_BASE_URL}/Currencies/${id}`,
  createCurrency: `${API_BASE_URL}/Currencies`,
  updateCurrency: (id) => `${API_BASE_URL}/Currencies/${id}`,
  deleteCurrency: (id) => `${API_BASE_URL}/Currencies/${id}`,

  // Accounts
  accounts: `${API_BASE_URL}/Accounts`,
  accountById: (id) => `${API_BASE_URL}/Accounts/${id}`,
  createAccount: `${API_BASE_URL}/Accounts`,
  updateAccount: (id) => `${API_BASE_URL}/Accounts/${id}`,
  deleteAccount: (id) => `${API_BASE_URL}/Accounts/${id}`,
};

export default API_ENDPOINTS;
