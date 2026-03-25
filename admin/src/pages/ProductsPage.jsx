import { useState, useEffect, useRef } from 'react';
import API from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Star, Search, X, Upload, Eye } from 'lucide-react';

const emptyForm = { name: '', price: '', description: '', category: '', isFeatured: false, stock: '', tags: '' };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fileRef = useRef();

  useEffect(() => { fetchProducts(); fetchCategories(); }, [page, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/products', { params: { page, limit: 10, search: search || undefined } });
      setProducts(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (_) {} finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(res.data.data);
    } catch (_) {}
  };

  const openAdd = () => {
    setEditProduct(null); setForm(emptyForm);
    setImageFiles([]); setImagePreviews([]); setExistingImages([]);
    setModal(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, price: p.price, description: p.description, category: p.category?._id || p.category, isFeatured: p.isFeatured, stock: p.stock, tags: p.tags?.join(', ') || '' });
    setExistingImages(p.images || []);
    setImageFiles([]); setImagePreviews([]);
    setModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeExistingImage = (idx) => setExistingImages(prev => prev.filter((_, i) => i !== idx));
  const removeNewImage = (idx) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) return toast.error('Name, price and category are required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      existingImages.forEach(img => fd.append('existingImages', img));
      imageFiles.forEach(f => fd.append('images', f));

      if (editProduct) {
        await API.put(`/products/${editProduct._id}`, fd);
        toast.success('Product updated!');
      } else {
        await API.post('/products', fd);
        toast.success('Product added!');
      }
      setModal(false); fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (_) { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your product catalog</p>
        </div>
        <button onClick={openAdd} className="btn-gold"><Plus size={16} /> Add Product</button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input className="input-field pl-9 pr-8" placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={14} /></button>}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr>
              <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">No products found. Add your first product!</td></tr>
              ) : products.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-dark-700 overflow-hidden flex-shrink-0 border border-dark-600">
                        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-gray-600" /></div>}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{p.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{p.description?.slice(0,40)}...</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="text-xs bg-dark-700 px-2 py-1 rounded-full text-gray-300">{p.category?.name || '—'}</span></td>
                  <td className="text-green-400 font-semibold">₹{p.price.toLocaleString('en-IN')}</td>
                  <td className={p.stock <= 5 ? 'text-red-400 font-semibold' : 'text-gray-300'}>{p.stock}</td>
                  <td>{p.isFeatured ? <Star size={16} className="text-gold-500 fill-gold-500" /> : <Star size={16} className="text-gray-600" />}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-blue-400 transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-900/20 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-dark-700">
            <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="px-3 py-1 rounded-lg bg-dark-700 text-sm text-gray-300 disabled:opacity-40 hover:bg-dark-600">Prev</button>
            <span className="text-sm text-gray-400">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p+1)} className="px-3 py-1 rounded-lg bg-dark-700 text-sm text-gray-300 disabled:opacity-40 hover:bg-dark-600">Next</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between p-5 border-b border-dark-700">
              <h3 className="text-lg font-semibold text-white">{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Product Name *</label>
                  <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Premium Ayatul Kursi Frame" />
                </div>
                <div>
                  <label className="label">Price (₹) *</label>
                  <input className="input-field" type="number" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="2499" />
                </div>
                <div>
                  <label className="label">Stock Quantity</label>
                  <input className="input-field" type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="10" />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input type="checkbox" className="w-4 h-4 accent-gold-500" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} />
                    <span className="text-sm text-gray-300">Mark as Featured</span>
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="label">Description *</label>
                  <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Product description..." />
                </div>
                <div className="col-span-2">
                  <label className="label">Tags (comma-separated)</label>
                  <input className="input-field" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="gift, islamic, personalized" />
                </div>

                {/* Image Upload */}
                <div className="col-span-2">
                  <label className="label">Product Images</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {existingImages.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-dark-600">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center"><X size={10} /></button>
                      </div>
                    ))}
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gold-500/30">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeNewImage(i)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center"><X size={10} /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileRef.current.click()} className="w-16 h-16 rounded-lg border-2 border-dashed border-dark-600 hover:border-gold-500 flex items-center justify-center text-gray-500 hover:text-gold-500 transition-colors">
                      <Upload size={18} />
                    </button>
                  </div>
                  <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                  <p className="text-xs text-gray-600">Upload up to 10 images (max 5MB each)</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold flex-1 justify-center disabled:opacity-60">
                  {saving ? 'Saving...' : (editProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
