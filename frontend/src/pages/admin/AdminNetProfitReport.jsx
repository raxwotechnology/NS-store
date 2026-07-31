import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon,
  BarChart3, FileDown, Calendar, Store as StoreIcon, ShieldCheck, ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { getFinancialDashboard, getStores } from '../../services/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'react-toastify';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { adminNavGroups as navItems } from './adminNavItems';
import { calculateNetProfit } from '../../utils/financeUtils';

const CHART_COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316'];

const AdminNetProfitReport = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly'); // daily | monthly | yearly
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [stores, setStores] = useState([]);

  const loadStores = async () => {
    try {
      const { data } = await getStores();
      setStores(data || []);
    } catch (err) {
      console.warn('Failed to load stores:', err);
    }
  };

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const params = {
        period,
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(selectedStore ? { storeId: selectedStore } : {}),
      };
      const { data } = await getFinancialDashboard(params);
      setDashboardData(data);
    } catch (err) {
      toast.error('Failed to load Net Profit Report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    fetchFinancialData();
  }, [period, startDate, endDate, selectedStore]);

  const d = dashboardData || {};
  const totalRevenue = Number(d.totalRevenue || 0);
  const cogs = Number(d.cogs || 0);
  const grossProfit = Number(d.grossProfit || (totalRevenue - cogs));
  const totalExpenses = Number(d.totalExpenses || 0);
  const totalAdditionalIncome = Number(d.totalAdditionalIncome || 0);
  const netProfit = Number(d.netProfit || (totalRevenue + totalAdditionalIncome - totalExpenses));
  const netProfitWithCogs = Number(d.netProfitWithCogs || (grossProfit + totalAdditionalIncome - totalExpenses));

  const isProfitable = netProfit >= 0;
  const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  // 1. Pie Chart Data: Overall Financial Distribution (Revenue vs Expenses vs Profit)
  const financialDistributionPie = [
    { name: 'Cost of Goods Sold (COGS)', value: cogs, color: '#f59e0b' },
    { name: 'Operating Expenses', value: totalExpenses, color: '#ef4444' },
    { name: 'Net Profit', value: Math.max(0, netProfitWithCogs), color: '#10b981' },
  ].filter(item => item.value > 0);

  // 2. Pie Chart Data: Revenue & Income Sources
  const incomeSourcesPie = [
    { name: 'POS In-Store Sales', value: Number(d.posRevenue || 0), color: '#3b82f6' },
    { name: 'Online Sales', value: Number(d.onlineRevenue || 0), color: '#8b5cf6' },
    { name: 'Additional Income', value: totalAdditionalIncome, color: '#ec4899' },
  ].filter(item => item.value > 0);

  // 3. Pie Chart Data: Expense Categories Breakdown
  const expenseCategoriesPie = d.expenseByCategory
    ? Object.entries(d.expenseByCategory).map(([name, value], idx) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Number(value || 0),
        color: CHART_COLORS[idx % CHART_COLORS.length],
      }))
    : [];

  const handleExport = (format) => {
    const reportData = d.series || d.monthlyData || [];
    const cols = [
      { label: 'Period / Date', accessor: 'label' },
      { label: 'Revenue (Rs.)', accessor: (r) => Number(r.revenue || 0).toLocaleString() },
      { label: 'Other Income (Rs.)', accessor: (r) => Number(r.additionalIncome || 0).toLocaleString() },
      { label: 'Expenses (Rs.)', accessor: (r) => Number(r.expenses || 0).toLocaleString() },
      { label: 'Net Profit (Rs.)', accessor: (r) => Number(r.profit || 0).toLocaleString() },
    ];

    if (format === 'csv') exportToCSV(reportData, cols, 'net-profit-report');
    if (format === 'excel') exportToExcel(reportData, cols, 'net-profit-report');
    if (format === 'pdf') exportToPDF(reportData, cols, 'Net Profit & Financial Report');
  };

  return (
    <DashboardLayout navItems={navItems} title="Net Profit Report">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-card-border shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-dark-navy">📈 Net Profit Analytics & Report</h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">Live Data</span>
            </div>
            <p className="text-muted-text text-sm mt-1">Detailed breakdown of Net Profit, Revenue distribution, COGS, and Expenses</p>
          </div>

          {/* Export Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => handleExport('csv')} className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              CSV
            </button>
            <button onClick={() => handleExport('excel')} className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm">
              📊 Export Excel
            </button>
            <button onClick={() => handleExport('pdf')} className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1.5">
              <FileDown size={14} /> PDF Report
            </button>
            <button onClick={fetchFinancialData} className="p-2.5 rounded-xl border border-card-border hover:bg-gray-50 text-gray-600">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-card-border shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div>
              <label className="block text-[10px] font-bold text-muted-text uppercase mb-1 flex items-center gap-1">
                <StoreIcon size={12} /> Branch / Store
              </label>
              <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} className="border border-card-border rounded-xl py-2 px-3 text-xs bg-white h-9 focus:ring-2 focus:ring-primary-green focus:outline-none">
                <option value="">All Branches</option>
                {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-text uppercase mb-1 flex items-center gap-1">
                <Calendar size={12} /> View Period
              </label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="border border-card-border rounded-xl py-2 px-3 text-xs bg-white h-9 focus:ring-2 focus:ring-primary-green focus:outline-none">
                <option value="daily">Daily View</option>
                <option value="monthly">Monthly View</option>
                <option value="yearly">Yearly View</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-text uppercase mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-card-border rounded-xl py-1.5 px-3 text-xs bg-white h-9 focus:outline-none" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-text uppercase mb-1">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-card-border rounded-xl py-1.5 px-3 text-xs bg-white h-9 focus:outline-none" />
            </div>
          </div>

          {(startDate || endDate || selectedStore) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); setSelectedStore(''); }} className="text-xs text-red-600 font-semibold hover:underline">
              Clear Filters
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* KPI Executive Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Operating Net Profit */}
              <div className={`p-5 rounded-3xl border shadow-sm transition-all ${isProfitable ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-700 text-white border-red-600'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Net Profit (Operating)</p>
                    <h3 className="text-3xl font-extrabold mt-2">
                      Rs. {Math.abs(netProfit).toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                    {isProfitable ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs border-t border-white/20 pt-3">
                  <span>Net Profit Margin</span>
                  <span className="font-bold">{netMargin}%</span>
                </div>
              </div>

              {/* Card 2: True Net Profit (with COGS) */}
              <div className="bg-white p-5 rounded-3xl border border-card-border shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted-text uppercase font-semibold">Net Profit (After COGS)</p>
                    <h3 className={`text-2xl font-bold mt-2 ${netProfitWithCogs >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      Rs. {Math.abs(netProfitWithCogs).toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                    <ShieldCheck size={20} />
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-text border-t border-card-border pt-3 flex justify-between">
                  <span>Gross Margin</span>
                  <span className="font-bold text-dark-navy">{grossMargin}%</span>
                </div>
              </div>

              {/* Card 3: Total Revenue */}
              <div className="bg-white p-5 rounded-3xl border border-card-border shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted-text uppercase font-semibold">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-dark-navy mt-2">
                      Rs. {totalRevenue.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-text border-t border-card-border pt-3 flex justify-between">
                  <span>Other Income</span>
                  <span className="font-bold text-purple-600">+ Rs. {totalAdditionalIncome.toLocaleString()}</span>
                </div>
              </div>

              {/* Card 4: Total Expenses */}
              <div className="bg-white p-5 rounded-3xl border border-card-border shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted-text uppercase font-semibold">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-red-600 mt-2">
                      Rs. {totalExpenses.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                    <ArrowDownRight size={20} />
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-text border-t border-card-border pt-3 flex justify-between">
                  <span>Product Cost (COGS)</span>
                  <span className="font-bold text-amber-600">Rs. {cogs.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* PIE CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pie Chart 1: Financial Allocation */}
              <div className="bg-white rounded-3xl border border-card-border p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-dark-navy text-base flex items-center gap-2 mb-1">
                    <PieChartIcon className="text-primary-green" size={18} /> Financial Breakdown Pie
                  </h3>
                  <p className="text-xs text-muted-text mb-4">Distribution of Revenue into COGS, Expenses & Profit</p>
                </div>

                {financialDistributionPie.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={financialDistributionPie}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {financialDistributionPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `Rs. ${Number(value).toLocaleString()}`} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-56 text-xs text-muted-text">No financial distribution data</div>
                )}
              </div>

              {/* Pie Chart 2: Income Sources */}
              <div className="bg-white rounded-3xl border border-card-border p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-dark-navy text-base flex items-center gap-2 mb-1">
                    <DollarSign className="text-blue-500" size={18} /> Revenue Sources Pie
                  </h3>
                  <p className="text-xs text-muted-text mb-4">POS, Online Orders & Additional Income Ratio</p>
                </div>

                {incomeSourcesPie.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={incomeSourcesPie}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {incomeSourcesPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `Rs. ${Number(value).toLocaleString()}`} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-56 text-xs text-muted-text">No income sources data</div>
                )}
              </div>

              {/* Pie Chart 3: Expenses Breakdown */}
              <div className="bg-white rounded-3xl border border-card-border p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-dark-navy text-base flex items-center gap-2 mb-1">
                    <BarChart3 className="text-purple-500" size={18} /> Expense Categories Pie
                  </h3>
                  <p className="text-xs text-muted-text mb-4">Category-wise Operating Expenses Share</p>
                </div>

                {expenseCategoriesPie.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={expenseCategoriesPie}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {expenseCategoriesPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `Rs. ${Number(value).toLocaleString()}`} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-56 text-xs text-muted-text">No expense category data</div>
                )}
              </div>
            </div>

            {/* NET PROFIT TREND BAR & LINE CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart: Net Profit vs Revenue vs Expenses */}
              <div className="bg-white p-6 rounded-3xl border border-card-border shadow-sm">
                <h3 className="font-bold text-dark-navy text-base mb-4">📊 Net Profit vs Revenue & Expenses Trend</h3>
                {(d.series || d.monthlyData) ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={d.series || d.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => `Rs. ${Number(v).toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="profit" fill="#10b981" name="Net Profit" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-text text-sm">No trend data available</div>
                )}
              </div>

              {/* Line Chart: Cumulative Net Profit Trend */}
              <div className="bg-white p-6 rounded-3xl border border-card-border shadow-sm">
                <h3 className="font-bold text-dark-navy text-base mb-4">📈 Net Profit Growth Curve</h3>
                {(d.series || d.monthlyData) ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={d.series || d.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => `Rs. ${Number(v).toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Net Profit" />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-text text-sm">No growth trend data available</div>
                )}
              </div>
            </div>

            {/* DETAILED SUMMARY TABLE */}
            <div className="bg-white rounded-3xl border border-card-border p-6 shadow-sm">
              <h3 className="font-bold text-dark-navy text-base mb-4">📑 Periodical Net Profit Statement Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-gray-50 text-muted-text uppercase font-semibold">
                      <th className="px-4 py-3">Period</th>
                      <th className="px-4 py-3 text-right">Revenue (Sales)</th>
                      <th className="px-4 py-3 text-right">Other Income</th>
                      <th className="px-4 py-3 text-right">Expenses</th>
                      <th className="px-4 py-3 text-right">Net Profit / Loss</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {(d.series || d.monthlyData || []).map((row, idx) => {
                      const isRowProfitable = (row.profit || 0) >= 0;
                      return (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-bold text-dark-navy">{row.label}</td>
                          <td className="px-4 py-3 text-right">Rs. {Number(row.revenue || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-purple-600">+ Rs. {Number(row.additionalIncome || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-red-600">- Rs. {Number(row.expenses || 0).toLocaleString()}</td>
                          <td className={`px-4 py-3 text-right font-extrabold ${isRowProfitable ? 'text-emerald-600' : 'text-red-600'}`}>
                            Rs. {Math.abs(row.profit || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isRowProfitable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                              {isRowProfitable ? 'Profit' : 'Loss'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminNetProfitReport;
