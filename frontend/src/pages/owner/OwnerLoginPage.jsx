import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function OwnerLoginPage() {
  const { ownerLogin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await ownerLogin(form.email, form.password);
      toast.success('Welcome, Studio Owner!');
      navigate('/owner/dashboard', { replace: true });
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
          <span className="section-eyebrow">Studio Management</span>
          <h1 className="auth-title">Owner Login</h1>
          <p className="text-secondary text-sm">Access your studio dashboard and manage bookings</p>
        </div>

        {error && <div className="form-alert form-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="owner-email">Email Address</label>
            <input id="owner-email" name="email" type="email" className="form-input" placeholder="owner@studio.com"
              value={form.email} onChange={handleChange} required autoComplete="email" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="owner-password">Password</label>
            <input id="owner-password" name="password" type="password" className="form-input" placeholder="••••••••"
              value={form.password} onChange={handleChange} required autoComplete="current-password" />
          </div>

          <button id="owner-login-submit" type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <><span className="spinner spinner-sm" /> Signing in…</> : 'Access Dashboard'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-secondary text-sm">
            Customer?{' '}
            <Link to="/login" className="text-gold">Customer login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
