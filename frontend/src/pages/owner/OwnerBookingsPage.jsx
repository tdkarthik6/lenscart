import { useEffect, useState, useCallback } from 'react';
import { ownerApi } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ status: '', dateFrom: '', dateTo: '' });
  const [acting, setActing]     = useState({}); // { [id]: true } while updating

  const fetch = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.status)   params.status   = filters.status;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo)   params.dateTo   = filters.dateTo;
    ownerApi.allBookings(params)
      .then(res => setBookings(res.data.data?.bookings || res.data.data || []))
      .catch(() => toast.error('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id, status) => {
    setActing(p => ({ ...p, [id]: true }));
    try {
      await ownerApi.updateStatus(id, status);
      toast.success(`Booking ${status.toLowerCase()}`);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setActing(p => ({ ...p, [id]: false }));
    }
  };

  const validActions = {
    PENDING:   [['CONFIRMED', 'btn-success', 'Confirm'], ['CANCELLED', 'btn-danger', 'Cancel']],
    CONFIRMED: [['COMPLETED', 'btn-primary', 'Complete'], ['CANCELLED', 'btn-danger', 'Cancel']],
    COMPLETED: [],
    CANCELLED: [],
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header" style={{ marginBottom: '28px' }}>
          <span className="section-eyebrow">Studio Management</span>
          <h1 style={{ fontSize: '2rem' }}>All Bookings</h1>
        </div>

        {/* Filters */}
        <div className="filters-row card" style={{ marginBottom: '24px' }}>
          <div className="card-body" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0, minWidth: '160px' }}>
              <label className="form-label">Status</label>
              <select className="form-input" value={filters.status}
                onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">From</label>
              <input type="date" className="form-input" value={filters.dateFrom}
                onChange={e => setFilters(p => ({ ...p, dateFrom: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To</label>
              <input type="date" className="form-input" value={filters.dateTo}
                onChange={e => setFilters(p => ({ ...p, dateTo: e.target.value }))} />
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status: '', dateFrom: '', dateTo: '' })}>
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : bookings.length === 0 ? (
          <div className="empty-state card-glass text-center" style={{ padding: '48px' }}>
            <p className="text-muted">No bookings found for the selected filters.</p>
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
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td><span className="booking-ref">{b.booking_reference}</span></td>
                    <td>
                      <div>{b.customer_name}</div>
                      {b.customer_email && <div className="text-muted text-xs">{b.customer_email}</div>}
                    </td>
                    <td>{b.service_name}</td>
                    <td>{formatDate(b.event_date)}</td>
                    <td className="text-sm text-muted">{formatTime(b.start_time)} – {formatTime(b.end_time)}</td>
                    <td className="text-sm">{b.location || '—'}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {(validActions[b.status] || []).map(([st, cls, label]) => (
                          <button key={st} className={`btn ${cls} btn-sm`}
                            disabled={acting[b.id]}
                            onClick={() => updateStatus(b.id, st)}>
                            {acting[b.id] ? '…' : label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
