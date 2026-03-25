import { useState, useEffect } from 'react';
import API from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';

const emptyForm = { name: '', slug: '', description: '' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get('/categories');
      setCategories(res.data.data);
    } catch (_) {} finally { setLoading(false); }
  };

  const openAdd = () => { setEditCat(null); setForm(emptyForm); setModal(true); };
  const openEdit = (c) => { setEditCat(c); setForm({ name: c.name, slug: c.slug, description: c.description || '' }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Category name is required');
    setSaving(true);
    try {
      if (editCat) {
        await API.put(`/categories/${editCat._id}`, form);
        toast.success('Category updated!');
      } else {
        await API.post('/categories', form);
        toast.success('Category added!');
      }
      setModal(false); fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Products using it may be affected.')) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (_) { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Organize your products into categories</p>
        </div>
        <button onClick={openAdd} className="btn-gold"><Plus size={16} /> Add Category</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <p className="text-gray-500 col-span-4">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500 col-span-4">No categories yet. Add your first!</p>
        ) : categories.map(c => (
          <div key={c._id} className="card hover:border-gold-500/20 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-gold-500/10 rounded-lg">
                <Tag size={18} className="text-gold-500" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-blue-400"><Edit2 size={13} /></button>
                <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg hover:bg-red-900/20 text-gray-400 hover:text-red-400"><Trash2 size={13} /></button>
              </div>
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">{c.name}</h3>
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{c.description || 'No description'}</p>
            <code className="text-xs text-gold-500/70 bg-dark-700 px-2 py-0.5 rounded">{c.slug}</code>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-dark-700">
              <h3 className="text-lg font-semibold text-white">{editCat ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="label">Category Name *</label>
                <input className="input-field" value={form.name} onChange={e => {
                  const slug = e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
                  setForm({...form, name: e.target.value, slug: editCat ? form.slug : slug});
                }} placeholder="Gift Boxes" />
              </div>
              <div>
                <label className="label">Slug</label>
                <input className="input-field font-mono text-sm" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="gift-boxes" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Beautiful Islamic gift hampers..." />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold flex-1 justify-center disabled:opacity-60">
                  {saving ? 'Saving...' : (editCat ? 'Update' : 'Add Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
