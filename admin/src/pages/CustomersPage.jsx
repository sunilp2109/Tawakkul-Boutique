import { useState, useEffect } from 'react';
import API from '../lib/api';
import { Users, Phone, MapPin, ShoppingBag, IndianRupee, X, ChevronRight } from 'lucide-react';

const statusColor = {
  Pending: 'badge-pending', Confirmed: 'badge-confirmed',
  Shipped: 'badge-shipped', Delivered: 'badge-delivered', Cancelled: 'badge-cancelled',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchCustomers(); }, [page]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/customers', { params: { page, limit: 20 } });
      setCustomers(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (_) {} finally { setLoading(false); }
  };

  const openCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setOrdersLoading(true);
    try {
      const res = await API.get(`/customers/${encodeURIComponent(customer.phone)}/orders`);
      setOrders(res.data.data);
    } catch (_) { setOrders([]); } finally { setOrdersLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">View all customers and their order history</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr>
              <th>Customer</th><th>Phone</th><th>Location</th><th>Orders</th><th>Total Spent</th><th>Last Order</th><th></th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500">Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500">No customers yet. Orders will create customer records.</td></tr>
              ) : customers.map((c, idx) => (
                <tr key={idx} className="cursor-pointer" onClick={() => openCustomer(c)}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 text-xs font-bold flex-shrink-0">
                        {c.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-white text-sm">{c.name}</span>
                    </div>
                  </td>
                  <td className="text-gray-300 text-sm">{c.phone}</td>
                  <td className="text-gray-400 text-sm max-w-[120px] truncate">{c.address || '—'}</td>
                  <td>
                    <span className="flex items-center gap-1 text-blue-400 text-sm font-medium">
                      <ShoppingBag size={13} />{c.totalOrders}
                    </span>
                  </td>
                  <td className="text-green-400 font-semibold text-sm">₹{c.totalSpent.toLocaleString('en-IN')}</td>
                  <td className="text-gray-500 text-xs">{new Date(c.lastOrder).toLocaleDateString('en-IN')}</td>
                  <td><ChevronRight size={16} className="text-gray-600" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-dark-700">
            <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="px-3 py-1 rounded-lg bg-dark-700 text-sm text-gray-300 disabled:opacity-40">Prev</button>
            <span className="text-sm text-gray-400">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p+1)} className="px-3 py-1 rounded-lg bg-dark-700 text-sm text-gray-300 disabled:opacity-40">Next</button>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedCustomer(null)}>
          <div className="modal-box max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 text-sm font-bold">
                  {selectedCustomer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs text-gray-500">{selectedCustomer.phone}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="card py-3 px-4">
                  <p className="text-xs text-gray-500 mb-0.5">Total Orders</p>
                  <p className="text-xl font-bold text-white">{selectedCustomer.totalOrders}</p>
                </div>
                <div className="card py-3 px-4">
                  <p className="text-xs text-gray-500 mb-0.5">Total Spent</p>
                  <p className="text-xl font-bold text-green-400">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</p>
                </div>
              </div>
              {selectedCustomer.address && (
                <div className="flex items-start gap-2 mb-4 text-sm text-gray-400">
                  <MapPin size={14} className="flex-shrink-0 mt-0.5 text-gold-500" />
                  {selectedCustomer.address}
                </div>
              )}
              <h4 className="text-sm font-semibold text-white mb-3">Order History</h4>
              {ordersLoading ? (
                <p className="text-center text-gray-500 text-sm py-4">Loading...</p>
              ) : orders.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-4">No orders found</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {orders.map(o => (
                    <div key={o._id} className="flex items-center justify-between bg-dark-700 rounded-lg px-3 py-2.5">
                      <div>
                        <p className="text-xs font-mono text-gold-500">{o.orderNumber}</p>
                        <p className="text-sm text-white">{o.productName}</p>
                        {o.customization && <p className="text-xs text-gray-500">"{o.customization}"</p>}
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-sm font-semibold text-green-400">₹{o.totalAmount.toLocaleString('en-IN')}</p>
                        <span className={`badge text-xs ${statusColor[o.status]}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
