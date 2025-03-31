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
  categoriesIncomes: `${API_BASE_URL}/Categories/incomes`,
  categoriesTransfers: `${API_BASE_URL}/Categories/transfers`,

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
  transactiosnByEvent: (eventId) => `${API_BASE_URL}/Transactions/byEvent/${eventId}`,

  // Transfers
  transfers: `${API_BASE_URL}/Transfers`,
  createTransfer: `${API_BASE_URL}/Transfers`,
  transfersByDate: (start, end) => `${API_BASE_URL}/Transfers/filter?start=${start}&end=${end}`,
  transfersByEvent: (eventId) => `${API_BASE_URL}/Transfers/event/${eventId}`,
};

export default API_ENDPOINTS;
