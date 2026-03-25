import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Lock, Mail, Eye, EyeOff, Store } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gold-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-dark-800 border border-gold-500/20 rounded-2xl mb-4 shadow-gold">
            <Store size={28} className="text-gold-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Tawakkul Boutique</h1>
          <p className="text-gray-500 text-sm mt-1">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-7 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Sign in</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your admin credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="login-email"
                  type="email"
                  className="input-field pl-9"
                  placeholder="admin@tawakkulboutique.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-9 pr-10"
                  placeholder="············"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full btn-gold justify-center py-2.5 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-dark-700">
            <p className="text-xs text-gray-600 text-center">
              Admin access only. Contact IT for account issues.
            </p>
          </div>
        </div>

        {/* Hint card */}
        <div className="mt-4 bg-gold-500/5 border border-gold-500/10 rounded-xl px-4 py-3">
          <p className="text-xs text-gold-500/70 text-center">
            Default: <span className="font-mono text-gold-400">admin@tawakkulboutique.com</span> / <span className="font-mono text-gold-400">Admin@1234</span>
          </p>
        </div>
      </div>
    </div>
  );
}
