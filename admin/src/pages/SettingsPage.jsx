import { useState, useEffect } from 'react';
import API from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Lock, Store, Save, Eye, EyeOff } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'store', label: 'Store Settings', icon: Store },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [storeForm, setStoreForm] = useState({ storeName: '', storeEmail: '', storePhone: '', storeAddress: '', whatsappNumber: '', socialLinks: { instagram: '', facebook: '', whatsapp: '' } });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchStoreSettings(); }, []);

  const fetchStoreSettings = async () => {
    try {
      const res = await API.get('/settings/store');
      const d = res.data.data;
      setStoreForm({
        storeName: d.storeName || '',
        storeEmail: d.storeEmail || '',
        storePhone: d.storePhone || '',
        storeAddress: d.storeAddress || '',
        whatsappNumber: d.whatsappNumber || '',
        socialLinks: d.socialLinks || { instagram: '', facebook: '', whatsapp: '' },
      });
    } catch (_) {}
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email) return toast.error('Name and email required');
    setSaving(true);
    try {
      const res = await API.patch('/settings/profile', profileForm);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword) return toast.error('Fill in all password fields');
    if (passForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await API.patch('/settings/password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const saveStore = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/settings/store', storeForm);
      toast.success('Store settings saved!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and store configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 border border-dark-700 rounded-xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 flex-1 justify-center py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-white'}
            `}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={saveProfile} className="card space-y-4">
          <h2 className="section-heading">Admin Profile</h2>
          <div className="flex items-center gap-4 pb-4 border-b border-dark-700">
            <div className="w-16 h-16 rounded-full bg-gold-500/10 border-2 border-gold-500/30 flex items-center justify-center text-gold-500 text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-white">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="badge bg-gold-500/10 text-gold-400 border border-gold-500/20 mt-1 capitalize">{user?.role}</span>
            </div>
          </div>
          <div>
            <label className="label">Full Name</label>
            <input className="input-field" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} placeholder="Admin Name" />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input className="input-field" type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} placeholder="admin@example.com" />
          </div>
          <button type="submit" disabled={saving} className="btn-gold disabled:opacity-60">
            <Save size={15} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={savePassword} className="card space-y-4">
          <h2 className="section-heading">Change Password</h2>
          {[
            { key: 'current', label: 'Current Password', field: 'currentPassword' },
            { key: 'new', label: 'New Password', field: 'newPassword' },
            { key: 'confirm', label: 'Confirm New Password', field: 'confirmPassword' },
          ].map(({ key, label, field }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <div className="relative">
                <input
                  className="input-field pr-10"
                  type={showPass[key] ? 'text' : 'password'}
                  value={passForm[field]}
                  onChange={e => setPassForm({...passForm, [field]: e.target.value})}
                  placeholder="············"
                />
                <button type="button" onClick={() => setShowPass(p => ({...p, [key]: !p[key]}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={saving} className="btn-gold disabled:opacity-60">
            <Lock size={15} /> {saving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}

      {/* Store Tab */}
      {activeTab === 'store' && (
        <form onSubmit={saveStore} className="card space-y-4">
          <h2 className="section-heading">Store Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Store Name</label>
              <input className="input-field" value={storeForm.storeName} onChange={e => setStoreForm({...storeForm, storeName: e.target.value})} placeholder="Tawakkul Boutique" />
            </div>
            <div>
              <label className="label">Contact Email</label>
              <input className="input-field" type="email" value={storeForm.storeEmail} onChange={e => setStoreForm({...storeForm, storeEmail: e.target.value})} />
            </div>
            <div>
              <label className="label">Contact Phone</label>
              <input className="input-field" value={storeForm.storePhone} onChange={e => setStoreForm({...storeForm, storePhone: e.target.value})} />
            </div>
            <div>
              <label className="label">WhatsApp Number</label>
              <input className="input-field" value={storeForm.whatsappNumber} onChange={e => setStoreForm({...storeForm, whatsappNumber: e.target.value})} placeholder="+91 98765 43210" />
            </div>
            <div className="col-span-2">
              <label className="label">Store Address</label>
              <input className="input-field" value={storeForm.storeAddress} onChange={e => setStoreForm({...storeForm, storeAddress: e.target.value})} placeholder="Full store address" />
            </div>
          </div>
          <div className="pt-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Social Links</p>
            <div className="space-y-3">
              {['instagram', 'facebook', 'whatsapp'].map(social => (
                <div key={social}>
                  <label className="label capitalize">{social}</label>
                  <input className="input-field" value={storeForm.socialLinks?.[social] || ''} onChange={e => setStoreForm(prev => ({...prev, socialLinks: {...prev.socialLinks, [social]: e.target.value}}))} placeholder={`${social}.com/tawakkulboutique`} />
                </div>
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-gold disabled:opacity-60">
            <Save size={15} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      )}
    </div>
  );
}
