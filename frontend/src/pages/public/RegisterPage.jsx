import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.phone, form.password);
      toast.success('Account created! Welcome to LensCraft 🎉');
      navigate('/my-bookings', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card-glass animate-fade-in">
        <div className="auth-header">
          <span className="section-eyebrow">Join LensCraft</span>
          <h1 className="auth-title">Create Your Account</h1>
          <p className="text-secondary text-sm">Start booking your perfect photography session</p>
        </div>

        {error && <div className="form-alert form-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" className="form-input" placeholder="Priya Sharma"
              value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input id="reg-email" name="email" type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required autoComplete="email" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number <span className="text-muted">(optional)</span></label>
            <input id="phone" name="phone" type="tel" className="form-input" placeholder="+91 98765 43210"
              value={form.phone} onChange={handleChange} />
          </div>

          <div className="grid-2" style={{ gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input id="reg-password" name="password" type="password" className="form-input" placeholder="••••••••"
                value={form.password} onChange={handleChange} required autoComplete="new-password" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="confirm">Confirm Password</label>
              <input id="confirm" name="confirm" type="password" className="form-input" placeholder="••••••••"
                value={form.confirm} onChange={handleChange} required autoComplete="new-password" />
            </div>
          </div>

          <button id="register-submit" type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? <><span className="spinner spinner-sm" /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-secondary text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-gold">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
