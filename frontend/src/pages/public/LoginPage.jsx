import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/my-bookings';

  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card-glass animate-fade-in">
        <div className="auth-header">
          <span className="section-eyebrow">Welcome Back</span>
          <h1 className="auth-title">Customer Login</h1>
          <p className="text-secondary text-sm">Sign in to manage your bookings</p>
        </div>

        {error && <div className="form-alert form-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required autoComplete="email" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="form-input" placeholder="••••••••"
              value={form.password} onChange={handleChange} required autoComplete="current-password" />
          </div>

          <button id="login-submit" type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <><span className="spinner spinner-sm" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-secondary text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold">Create one here</Link>
          </p>
          <p className="text-secondary text-sm mt-md">
            Studio owner?{' '}
            <Link to="/owner/login" className="text-gold">Owner login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
