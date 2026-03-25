import { useState, useEffect, useRef } from 'react';
import API from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, X, Upload, ToggleLeft, ToggleRight, Edit2, Trash2, Image } from 'lucide-react';

const emptyForm = { title: '', subtitle: '', ctaText: 'Shop Now', ctaLink: '/products', isActive: true, order: 0 };

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await API.get('/banners');
      setBanners(res.data.data);
    } catch (_) {} finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditBanner(null); setForm(emptyForm);
    setImageFile(null); setImagePreview('');
    setModal(true);
  };

  const openEdit = (b) => {
    setEditBanner(b);
    setForm({ title: b.title, subtitle: b.subtitle, ctaText: b.ctaText, ctaLink: b.ctaLink, isActive: b.isActive, order: b.order });
    setImagePreview(b.imageUrl); setImageFile(null);
    setModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editBanner && !imageFile) return toast.error('Please upload a banner image');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (editBanner) {
        await API.put(`/banners/${editBanner._id}`, fd);
        toast.success('Banner updated!');
      } else {
        await API.post('/banners', fd);
        toast.success('Banner added!');
      }
      setModal(false); fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await API.patch(`/banners/${id}/toggle`);
      setBanners(prev => prev.map(b => b._id === id ? res.data.data : b));
      toast.success('Banner toggled');
    } catch (_) { toast.error('Failed to toggle'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await API.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (_) { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Banners</h1>
          <p className="text-gray-500 text-sm mt-1">Manage homepage hero banners</p>
        </div>
        <button onClick={openAdd} className="btn-gold"><Plus size={16} /> Add Banner</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-gold-500 border-t-transparent animate-spin rounded-full" /></div>
      ) : banners.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">No banners yet. Add your first hero banner!</div>
      ) : (
        <div className="space-y-4">
          {banners.map(b => (
            <div key={b._id} className={`card flex flex-col sm:flex-row gap-4 ${!b.isActive ? 'opacity-60' : ''}`}>
              <div className="w-full sm:w-44 h-24 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0 border border-dark-600">
                {b.imageUrl ? <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image size={24} className="text-gray-600" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{b.title || 'No title'}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">{b.subtitle || 'No subtitle'}</p>
                    <p className="text-xs text-gray-500 mt-1">CTA: <span className="text-gold-500">{b.ctaText}</span> → {b.ctaLink}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleToggle(b._id)} className={`${b.isActive ? 'text-gold-500' : 'text-gray-600'} hover:opacity-80 transition-opacity`}>
                      {b.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-blue-400"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(b._id)} className="p-1.5 rounded-lg hover:bg-red-900/20 text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-dark-700">
              <h3 className="text-lg font-semibold text-white">{editBanner ? 'Edit Banner' : 'Add Banner'}</h3>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Image area */}
              <div>
                <label className="label">Banner Image {!editBanner && '*'}</label>
                <div
                  onClick={() => fileRef.current.click()}
                  className="border-2 border-dashed border-dark-600 hover:border-gold-500 rounded-xl overflow-hidden cursor-pointer transition-colors relative"
                  style={{ height: 130 }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 hover:text-gray-400">
                      <Upload size={22} />
                      <p className="text-xs mt-1">Click to upload (recommended: 1920×600)</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
              <div>
                <label className="label">Title</label>
                <input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Premium Islamic Gifts" />
              </div>
              <div>
                <label className="label">Subtitle</label>
                <input className="input-field" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} placeholder="Discover handcrafted treasures..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">CTA Button Text</label>
                  <input className="input-field" value={form.ctaText} onChange={e => setForm({...form, ctaText: e.target.value})} placeholder="Shop Now" />
                </div>
                <div>
                  <label className="label">CTA Link</label>
                  <input className="input-field" value={form.ctaLink} onChange={e => setForm({...form, ctaLink: e.target.value})} placeholder="/products" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="banner-active" className="w-4 h-4 accent-gold-500" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} />
                <label htmlFor="banner-active" className="text-sm text-gray-300 cursor-pointer">Active (visible on homepage)</label>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold flex-1 justify-center disabled:opacity-60">
                  {saving ? 'Saving...' : (editBanner ? 'Update' : 'Add Banner')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
