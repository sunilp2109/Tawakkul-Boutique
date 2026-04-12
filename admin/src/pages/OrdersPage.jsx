import { useState, useEffect } from 'react';
import API from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, X, Search, Eye, MessageSquare, Loader2, Send } from 'lucide-react';

const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const statusColor = {
  Pending: 'badge-pending', Confirmed: 'badge-confirmed',
  Shipped: 'badge-shipped', Delivered: 'badge-delivered', Cancelled: 'badge-cancelled',
};

const emptyOrderForm = {
  customerName: '', customerPhone: '', customerAddress: '', customerEmail: '',
  productId: '', productName: '', productPrice: '', quantity: '1',
  customization: '', source: 'WhatsApp', notes: '',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailOrder, setDetailOrder] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState(emptyOrderForm);
  const [saving, setSaving] = useState(false);
  const [sendingWa, setSendingWa] = useState(null); // orderId being sent

  useEffect(() => { fetchOrders(); }, [page, search, filterStatus]);
  useEffect(() => { fetchProducts(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/orders', { params: { page, limit: 15, search: search || undefined, status: filterStatus || undefined } });
      setOrders(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (_) { } finally { setLoading(false); }
  };

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products', { params: { limit: 100 } });
      setProducts(res.data.data);
    } catch (_) { }
  };

  const handleStatusChange = async (orderId, status) => {
    const loadingToast = toast.loading(`Updating status to ${status}...`);
    try {
      const res = await API.patch(`/orders/${orderId}/status`, { status });
      toast.dismiss(loadingToast);
      if (res.data.whatsappStatus === 'failed') {
        toast.error(`Order ${status}, but failed to WhatsApp`);
      } else if (res.data.whatsappStatus === 'sent') {
        toast.success(`Order ${status} & WhatsApp sent ✅`);
      } else {
        toast.success(`Status updated to ${status}`);
      }
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    } catch (_) {
      toast.dismiss(loadingToast);
      toast.error('Failed to update status');
    }
  };

  const handleSendWhatsApp = async (orderId) => {
    setSendingWa(orderId);
    try {
      await API.post(`/orders/${orderId}/whatsapp`);
      toast.success('✅ WhatsApp message sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Failed to send WhatsApp');
    } finally { setSendingWa(null); }
  };

  const handleProductSelect = (e) => {
    const p = products.find(p => p._id === e.target.value);
    if (p) setForm(prev => ({ ...prev, productId: p._id, productName: p.name, productPrice: p.price }));
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.customerAddress || !form.productName || !form.productPrice)
      return toast.error('Fill in required fields');
    const loadingToast = toast.loading('Adding order & sending WhatsApp...');
    try {
      const unitPrice = parseFloat(form.productPrice);
      const qty = parseInt(form.quantity || 1);
      const total = unitPrice * qty;

      const res = await API.post('/orders', {
        customer: {
          name: form.customerName,
          phone: form.customerPhone,
          address: form.customerAddress,
          email: form.customerEmail
        },
        items: [{
          product: form.productId || undefined,
          name: form.productName,
          price: unitPrice,
          quantity: qty,
          customization: form.customization ? { text: form.customization } : {}
        }],
        totalAmount: total,
        source: form.source,
        notes: form.notes,
      });

      toast.dismiss(loadingToast);
      if (res.data.whatsappStatus === 'failed') {
        toast.success('Order added, but failed to send WhatsApp message ❌');
      } else {
        toast.success('Order added & message sent via WhatsApp ✅');
      }

      setAddModal(false);
      setForm(emptyOrderForm);
      fetchOrders();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || 'Failed to add order');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this order?')) return;
    try {
      await API.delete(`/orders/${id}`);
      toast.success('Order deleted');
      fetchOrders();
    } catch (_) { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all customer orders</p>
        </div>
        <button onClick={() => setAddModal(true)} className="btn-gold"><Plus size={16} /> Add Order</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input-field pl-9 pr-8" placeholder="Search by name, phone, order #..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={14} /></button>}
        </div>
        <select className="input-field w-40" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr>
              <th>Order #</th><th>Customer</th><th>Product</th><th>Amount</th><th>Customization</th><th>Status</th><th>Date</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center"><Loader2 size={20} className="animate-spin text-gold-500 mx-auto" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-gray-500">No orders found</td></tr>
              ) : orders.map(order => (
                <tr key={order._id}>
                  <td className="font-mono text-gold-500 text-xs">{order.orderNumber}</td>
                  <td>
                    <p className="font-medium text-white text-sm">{order.customer.name}</p>
                    <p className="text-xs text-gray-500">{order.customer.phone}</p>
                  </td>
                  <td>
                    <p className="text-sm text-gray-200 max-w-[160px] truncate">
                      {order.items?.map(item => item.name).join(', ') || 'Unknown Product'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                    </p>
                  </td>
                  <td className="text-green-400 font-semibold">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                  <td>
                    {order.items?.some(i => i.customization && Object.keys(i.customization).length > 0) ? (
                      <div className="flex items-center gap-1 text-gold-400 text-xs">
                        <MessageSquare size={12} />
                        <span>Customized</span>
                      </div>
                    ) : <span className="text-gray-600 text-xs">—</span>}
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order._id, e.target.value)}
                      className={`text-xs rounded-full px-2 py-1 border bg-transparent cursor-pointer ${order.status === 'Pending' ? 'border-yellow-700 text-yellow-400' :
                        order.status === 'Confirmed' ? 'border-blue-700 text-blue-400' :
                          order.status === 'Shipped' ? 'border-purple-700 text-purple-400' :
                            order.status === 'Delivered' ? 'border-green-700 text-green-400' :
                              'border-red-800 text-red-400'
                        } bg-dark-800`}
                    >
                      {STATUSES.map(s => <option key={s} value={s} className="bg-dark-800 text-gray-200">{s}</option>)}
                    </select>
                  </td>
                  <td className="text-gray-500 text-xs whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setDetailOrder(order)} className="p-1.5 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-blue-400" title="View details"><Eye size={14} /></button>
                      <button
                        onClick={() => handleSendWhatsApp(order._id)}
                        disabled={sendingWa === order._id}
                        className="p-1.5 rounded-lg hover:bg-green-900/30 text-gray-400 hover:text-green-400 disabled:opacity-40"
                        title="Send WhatsApp message"
                      >
                        {sendingWa === order._id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      </button>
                      <button onClick={() => handleDelete(order._id)} className="p-1.5 rounded-lg hover:bg-red-900/20 text-gray-400 hover:text-red-400" title="Delete order"><X size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-dark-700">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded-lg bg-dark-700 text-sm text-gray-300 disabled:opacity-40 hover:bg-dark-600">Prev</button>
            <span className="text-sm text-gray-400">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded-lg bg-dark-700 text-sm text-gray-300 disabled:opacity-40 hover:bg-dark-600">Next</button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailOrder && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDetailOrder(null)}>
          <div className="modal-box max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-dark-700">
              <div>
                <h3 className="text-lg font-semibold text-white">Order Details</h3>
                <p className="text-xs font-mono text-gold-500">{detailOrder.orderNumber}</p>
              </div>
              <button onClick={() => setDetailOrder(null)} className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoBlock label="Customer Name" value={detailOrder.customer.name} />
                <InfoBlock label="Phone" value={detailOrder.customer.phone} />
                <InfoBlock label="Address" value={detailOrder.customer.address} className="col-span-2" />
                {detailOrder.customer.email && <InfoBlock label="Email" value={detailOrder.customer.email} />}
              </div>
              <div className="h-px bg-dark-700" />
              <div>
                <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Order Items</p>
                <div className="space-y-3">
                  {detailOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start bg-dark-800 p-3 rounded-lg border border-dark-700">
                      <div>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                        {item.customization && Object.keys(item.customization).length > 0 && (
                          <div className="mt-1 p-1.5 bg-gold-500/10 rounded border border-gold-500/20 text-[10px] text-gold-400">
                            <strong>Customization:</strong> {Object.entries(item.customization).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-200">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-dark-700" />
              <div className="grid grid-cols-2 gap-4">
                <InfoBlock label="Shipping" value={`₹${(detailOrder.shippingFee || 0).toLocaleString('en-IN')}`} />
                <InfoBlock label="Grand Total" value={`₹${detailOrder.totalAmount.toLocaleString('en-IN')}`} className="text-gold-500" />
                {detailOrder.notes && <InfoBlock label="Notes" value={detailOrder.notes} className="col-span-2" />}
                <InfoBlock label="Source" value={detailOrder.source} />
                <InfoBlock label="Status" value={detailOrder.status} />
                <InfoBlock label="Date" value={new Date(detailOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
              </div>
              <div className="h-px bg-dark-700" />
              <button
                onClick={() => { handleSendWhatsApp(detailOrder._id); }}
                disabled={sendingWa === detailOrder._id}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-green-600/20 border border-green-600/30 text-green-400 hover:bg-green-600/30 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {sendingWa === detailOrder._id
                  ? <><Loader2 size={15} className="animate-spin" /> Sending...</>
                  : <><MessageSquare size={15} /> Send WhatsApp Message</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Order Modal */}
      {addModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setAddModal(false)}>
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between p-5 border-b border-dark-700">
              <h3 className="text-lg font-semibold text-white">Add New Order</h3>
              <button onClick={() => setAddModal(false)} className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddOrder} className="p-5 space-y-4">
              <p className="text-xs text-gold-500/70 font-semibold uppercase tracking-wider">Customer Info</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Name *</label>
                  <input className="input-field" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="Mohammed Ahmed" />
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <input className="input-field" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
                <div className="col-span-2">
                  <label className="label">Address *</label>
                  <input className="input-field" value={form.customerAddress} onChange={e => setForm({ ...form, customerAddress: e.target.value })} placeholder="Full address" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input-field" value={form.customerEmail} onChange={e => setForm({ ...form, customerEmail: e.target.value })} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="label">Order Source</label>
                  <select className="input-field" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Website">Website</option>
                    <option value="Direct">Direct</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-gold-500/70 font-semibold uppercase tracking-wider pt-2">Order Info</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Select Product (optional)</label>
                  <select className="input-field" value={form.productId} onChange={handleProductSelect}>
                    <option value="">— Select from catalog —</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name} — ₹{p.price}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Product Name *</label>
                  <input className="input-field" value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} placeholder="Product name" />
                </div>
                <div>
                  <label className="label">Price (₹) *</label>
                  <input className="input-field" type="number" value={form.productPrice} onChange={e => setForm({ ...form, productPrice: e.target.value })} placeholder="2499" />
                </div>
                <div>
                  <label className="label">Quantity</label>
                  <input className="input-field" type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div>
                  <label className="label">Customization (Name/Message)</label>
                  <input className="input-field" value={form.customization} onChange={e => setForm({ ...form, customization: e.target.value })} placeholder="Add name or message..." />
                </div>
                <div className="col-span-2">
                  <label className="label">Notes</label>
                  <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setAddModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold flex-1 justify-center disabled:opacity-60">
                  {saving ? 'Saving...' : 'Add Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value, className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-white font-medium">{value || '—'}</p>
    </div>
  );
}
