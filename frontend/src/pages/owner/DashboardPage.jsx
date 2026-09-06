import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ownerApi } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';

function StatCard({ label, value, icon, accent }) {
  return (
    <div className={`stat-card card ${accent ? 'stat-card-accent' : ''}`}>
      <div className="card-body">
        <div className="stat-card-inner">
          <div>
            <p className="stat-label">{label}</p>
            <p className="stat-value gradient-text">{value ?? '—'}</p>
          </div>
          <div className="stat-icon">{icon}</div>
        </div>
      </div>
    </div>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}
function formatINR(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}

export default function DashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    ownerApi.dashboard()
      .then(res => setData(res.data.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (error)   return <div className="page-container"><div className="form-alert form-alert-error">{error}</div></div>;

  const { stats, upcoming } = data || {};

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header" style={{ marginBottom: '32px' }}>
          <span className="section-eyebrow">Studio Overview</span>
          <h1 style={{ fontSize: '2rem' }}>Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid-4" style={{ marginBottom: '40px' }}>
          <StatCard label="Total Bookings"  value={stats?.total}     icon="📋" />
          <StatCard label="Pending"         value={stats?.pending}   icon="⏳" />
          <StatCard label="Confirmed"       value={stats?.confirmed} icon="✅" />
          <StatCard label="Completed"       value={stats?.completed} icon="🎉" accent />
        </div>

        {stats?.revenue !== undefined && (
          <div className="revenue-banner card-glass" style={{ marginBottom: '40px' }}>
            <div className="card-body flex-between">
              <div>
                <p className="text-muted text-sm">Total Revenue Earned</p>
                <p className="stat-value gradient-text">{formatINR(stats.revenue)}</p>
              </div>
              <div style={{ fontSize: '2.5rem' }}>💰</div>
            </div>
          </div>
        )}

        {/* Upcoming Bookings */}
        <div>
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem' }}>Upcoming Bookings</h2>
            <Link to="/owner/bookings" className="btn btn-ghost btn-sm">View All →</Link>
          </div>

          {!upcoming?.length ? (
            <div className="empty-state text-center card-glass" style={{ padding: '40px' }}>
              <p className="text-muted">No upcoming bookings.</p>
            </div>
          ) : (
            <div className="owner-table-wrapper">
              <table className="owner-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map(b => (
                    <tr key={b.id}>
                      <td><span className="booking-ref">{b.booking_reference}</span></td>
                      <td>{b.customer_name}</td>
                      <td>{b.service_name}</td>
                      <td>{formatDate(b.event_date)}</td>
                      <td className="text-muted text-sm">{formatTime(b.start_time)}</td>
                      <td><StatusBadge status={b.status} /></td>
                      <td>
                        <Link to="/owner/bookings" className="btn btn-ghost btn-sm">Manage</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
