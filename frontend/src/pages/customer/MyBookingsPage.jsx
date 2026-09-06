import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../../api/client';
import BookingCard from '../../components/BookingCard';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    bookingsApi.myBookings()
      .then(res => setBookings(res.data.data || []))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header flex-between" style={{ marginBottom: '32px' }}>
          <div>
            <span className="section-eyebrow">My Account</span>
            <h1 style={{ fontSize: '2rem' }}>My Bookings</h1>
          </div>
          <Link to="/services" className="btn btn-primary btn-sm">+ New Booking</Link>
        </div>

        {loading && <div className="loading-center"><div className="spinner" /></div>}

        {error && <div className="form-alert form-alert-error">{error}</div>}

        {!loading && !error && bookings.length === 0 && (
          <div className="empty-state text-center card-glass" style={{ padding: '64px 32px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📷</div>
            <h3 style={{ marginBottom: '8px' }}>No bookings yet</h3>
            <p className="text-secondary mb-lg">Start your journey — book your first photography session today!</p>
            <Link to="/services" className="btn btn-primary">Browse Services</Link>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
          </div>
        )}
      </div>
    </div>
  );
}
