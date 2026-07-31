/**
 * Utility functions for calculating financial metrics such as Total Revenue, COGS, Gross Profit, Expenses, and Net Profit.
 */

/**
 * Calculates financial metrics based on orders, expenses, and additional income.
 * 
 * @param {Array} orders - Array of Order objects
 * @param {Array} expenses - Array of Expense objects
 * @param {Array} additionalIncomes - Array of AdditionalIncome objects
 * @returns {Object} Calculated financial summary
 */
const calculateNetProfit = (orders = [], expenses = [], additionalIncomes = []) => {
  // Filter out cancelled orders
  const validOrders = orders.filter(o => o.orderStatus !== 'cancelled');

  // 1. Calculate Total Revenue (Order Total Amounts)
  const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  // 2. Calculate Cost of Goods Sold (COGS)
  const cogs = validOrders.reduce((sum, o) => {
    const orderCost = (o.items || []).reduce((itemSum, item) => {
      const qty = Number(item.quantity || 0);
      const unitCost = Number(item.unitCostAtSale || item.costPrice || 0);
      return itemSum + (qty * unitCost);
    }, 0);
    return sum + orderCost;
  }, 0);

  // 3. Calculate Gross Profit
  const grossProfit = totalRevenue - cogs;

  // 4. Calculate Total Expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const paidExpenses = expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const pendingExpenses = expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // 5. Calculate Additional Income
  const totalAdditionalIncome = additionalIncomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  // 6. Net Profit Calculations:
  // Operating Net Profit = Total Revenue + Additional Income - Total Expenses
  const netProfit = totalRevenue + totalAdditionalIncome - totalExpenses;

  // Accurate Net Profit after COGS = Gross Profit + Additional Income - Total Expenses
  const netProfitWithCogs = grossProfit + totalAdditionalIncome - totalExpenses;

  // Margin percentages
  const grossMarginPercentage = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(2) : '0.00';
  const netMarginPercentage = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : '0.00';

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    cogs: Math.round(cogs * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    grossMarginPercentage: Number(grossMarginPercentage),
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    paidExpenses: Math.round(paidExpenses * 100) / 100,
    pendingExpenses: Math.round(pendingExpenses * 100) / 100,
    totalAdditionalIncome: Math.round(totalAdditionalIncome * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    netProfitWithCogs: Math.round(netProfitWithCogs * 100) / 100,
    netMarginPercentage: Number(netMarginPercentage),
    orderCount: validOrders.length,
    isProfitable: netProfit >= 0,
  };
};

module.exports = {
  calculateNetProfit,
};
