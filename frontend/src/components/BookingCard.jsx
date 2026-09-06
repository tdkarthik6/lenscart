import StatusBadge from './StatusBadge';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayH = hour % 12 || 12;
  return `${displayH}:${m} ${ampm}`;
}

/* ── bright gold SVG icons ── */
const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const NoteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

export default function BookingCard({ booking }) {
  return (
    <div className="booking-card card">
      <div className="booking-card-accent-bar" />
      <div className="card-body">
        <div className="booking-card-top">
          <div>
            <span className="booking-ref">{booking.booking_reference}</span>
            <h3 className="booking-service-name">{booking.service_name}</h3>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="booking-details">
          <div className="booking-detail">
            <span className="booking-detail-icon booking-detail-icon--calendar"><CalendarIcon /></span>
            <span className="booking-detail-text">{formatDate(booking.event_date)}</span>
          </div>
          <div className="booking-detail">
            <span className="booking-detail-icon booking-detail-icon--clock"><ClockIcon /></span>
            <span className="booking-detail-text">
              {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
            </span>
          </div>
          {booking.location && (
            <div className="booking-detail">
              <span className="booking-detail-icon booking-detail-icon--location"><LocationIcon /></span>
              <span className="booking-detail-text">{booking.location}</span>
            </div>
          )}
          {booking.customer_name && (
            <div className="booking-detail">
              <span className="booking-detail-icon booking-detail-icon--user"><UserIcon /></span>
              <span className="booking-detail-text">{booking.customer_name}</span>
            </div>
          )}
        </div>

        {booking.notes && (
          <div className="booking-notes">
            <span className="booking-notes-icon"><NoteIcon /></span>
            <p>{booking.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
