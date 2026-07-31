/**
 * Utility functions for calculating Net Profit and financial metrics on the Frontend.
 */

export const calculateNetProfit = (orders = [], expenses = [], additionalIncomes = []) => {
  const validOrders = orders.filter(o => o.orderStatus !== 'cancelled');

  const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const cogs = validOrders.reduce((sum, o) => {
    const orderCost = (o.items || []).reduce((itemSum, item) => {
      const qty = Number(item.quantity || 0);
      const unitCost = Number(item.unitCostAtSale || item.costPrice || 0);
      return itemSum + (qty * unitCost);
    }, 0);
    return sum + orderCost;
  }, 0);

  const grossProfit = totalRevenue - cogs;
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalAdditionalIncome = additionalIncomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  // Net Profit = Revenue + Additional Income - Total Expenses
  const netProfit = totalRevenue + totalAdditionalIncome - totalExpenses;
  // True Net Profit (with Product Cost / COGS)
  const netProfitWithCogs = grossProfit + totalAdditionalIncome - totalExpenses;

  const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  return {
    totalRevenue,
    cogs,
    grossProfit,
    totalExpenses,
    totalAdditionalIncome,
    netProfit,
    netProfitWithCogs,
    netMargin: `${netMargin}%`,
    isProfitable: netProfit >= 0,
  };
};

export const formatCurrency = (amount) => {
  return `Rs. ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
