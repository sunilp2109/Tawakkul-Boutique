import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../lib/api';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Image, Users, Settings,
  LogOut, Bell, Menu, X, Moon, ChevronDown, Store
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/banners', icon: Image, label: 'Banners' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/dashboard/notifications');
      setNotifications(res.data.data);
      setNotifCount(res.data.data.length);
    } catch (_) {}
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const markRead = async (id) => {
    try {
      await API.patch(`/orders/${id}/read`);
      fetchNotifications();
    } catch (_) {}
  };

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 bg-dark-800 border-r border-dark-700 flex flex-col transition-all duration-300 overflow-hidden`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-dark-700 gap-3 flex-shrink-0">
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Store size={16} className="text-dark-900" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-gradient-gold truncate">Tawakkul</p>
              <p className="text-xs text-gray-500 truncate">Boutique Admin</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-2 border-t border-dark-700 flex-shrink-0">
          <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-colors relative">
                <Bell size={20} />
                {notifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-gold-500 text-dark-900 text-xs rounded-full flex items-center justify-center font-bold">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-dark-700 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">New Orders</p>
                    <span className="badge badge-pending">{notifCount} new</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-gray-500 text-sm py-6">No new notifications</p>
                    ) : notifications.map(n => (
                      <div key={n._id} className="flex items-start gap-3 p-3 border-b border-dark-700/50 hover:bg-dark-700/30 cursor-pointer" onClick={() => { markRead(n._id); setNotifOpen(false); navigate('/orders'); }}>
                        <div className="w-2 h-2 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate font-medium">{n['customer']?.name || 'Customer'}</p>
                          <p className="text-xs text-gray-400 truncate">{n.productName}</p>
                          <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-dark-700">
                    <button onClick={() => { setNotifOpen(false); navigate('/orders'); }} className="w-full text-xs text-gold-500 hover:text-gold-400 py-1">View all orders →</button>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-dark-700 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-500 text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <ChevronDown size={14} className="text-gray-500" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-44 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <button onClick={() => { navigate('/settings'); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-white flex items-center gap-2">
                    <Settings size={14} /> Settings
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-dark-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
