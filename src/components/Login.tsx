import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { login } from '../lib/auth';
import { cn } from '../lib/utils';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      localStorage.setItem('vita_user', JSON.stringify(user));
      onLoginSuccess(user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 pt-32">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel border border-white/10 rounded-2xl p-8"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm">Login to your VistaRent account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2">
                Gmail Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@gmail.com"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-400 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-400 transition-colors"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-3 rounded-lg font-semibold uppercase tracking-widest transition-all duration-300",
                loading ? "bg-slate-600 text-slate-400 cursor-not-allowed" : "bg-brand-400 hover:bg-brand-500 text-slate-950"
              )}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-center text-slate-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-semibold">
                Sign up here
              </Link>
            </p>

            {/* Demo Login Options */}
            <div className="border-t border-slate-700 pt-6">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Demo Accounts</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ email: 'demo@gmail.com', password: 'demo123' });
                    setError('');
                  }}
                  className="w-full text-left px-3 py-2 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  👤 Demo Customer (demo@gmail.com)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ email: 'admin@gmail.com', password: 'admin123' });
                    setError('');
                  }}
                  className="w-full text-left px-3 py-2 text-sm bg-slate-900/50 border border-amber-700/50 rounded-lg text-amber-300 hover:bg-slate-800 transition-colors"
                >
                  ⚙️ Demo Admin (admin@gmail.com)
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
