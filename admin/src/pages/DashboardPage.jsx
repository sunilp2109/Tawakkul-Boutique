import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../lib/api';
import { Package, ShoppingBag, IndianRupee, Clock, TrendingUp, Users, ArrowRight } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const statusColor = {
  Pending: 'badge-pending', Confirmed: 'badge-confirmed',
  Shipped: 'badge-shipped', Delivered: 'badge-delivered', Cancelled: 'badge-cancelled',
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/dashboard');
      setData(res.data.data);
    } catch (_) {} finally { setLoading(false); }
  };

  const chartData = data?.monthlyRevenue?.map(d => ({
    month: MONTHS[d._id.month - 1],
    revenue: d.revenue,
    orders: d.orders,
  })) || [];

  const formatPrice = (v) => `₹${(v/1000).toFixed(1)}k`;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: 'Total Products', value: data?.totalProducts || 0, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10', change: 'Active listings' },
    { label: 'Total Orders', value: data?.totalOrders || 0, icon: ShoppingBag, color: 'text-gold-400', bg: 'bg-gold-500/10', change: `${data?.pendingOrders || 0} pending` },
    { label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-500/10', change: 'All-time' },
    { label: 'Pending Orders', value: data?.pendingOrders || 0, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', change: 'Needs attention' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening at Tawakkul Boutique.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card flex items-start gap-4">
            <div className={`p-2.5 rounded-xl ${s.bg} flex-shrink-0`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-gray-400 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-600 mt-1">{s.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-heading">Revenue (Last 6 months)</h2>
            <TrendingUp size={16} className="text-gold-500" />
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#303030" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatPrice} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid #303030', borderRadius: 10, color: '#fff' }}
                  formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={2.5} dot={{ fill: '#d4af37', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-600 text-sm">No data yet — create some orders!</div>
          )}
        </div>

        {/* Orders by status */}
        <div className="card">
          <h2 className="section-heading mb-4">Orders by Status</h2>
          {data?.ordersByStatus?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.ordersByStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#303030" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="_id" type="category" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} width={65} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid #303030', borderRadius: 10, color: '#fff' }}
                />
                <Bar dataKey="count" fill="#d4af37" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-600 text-sm">No orders yet</div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-heading">Recent Orders</h2>
          <button onClick={() => navigate('/orders')} className="text-sm text-gold-500 hover:text-gold-400 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </button>
        </div>
        {data?.recentOrders?.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map(order => (
                  <tr key={order._id}>
                    <td className="font-mono text-gold-500 text-xs">{order.orderNumber}</td>
                    <td>
                      <p className="font-medium text-white text-sm">{order.customer.name}</p>
                      <p className="text-xs text-gray-500">{order.customer.phone}</p>
                    </td>
                    <td className="text-gray-300 text-sm max-w-xs truncate">
                      {order.items?.map(item => item.name).join(', ') || 'Unknown'}
                    </td>
                    <td className="text-green-400 font-semibold">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${statusColor[order.status]}`}>{order.status}</span></td>
                    <td className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-600">No orders yet. Start by adding orders!</div>
        )}
      </div>
    </div>
  );
}
