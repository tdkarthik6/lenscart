import { Link } from 'react-router-dom';

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
}

function formatDuration(mins) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function ServiceCard({ service }) {
  const features = Array.isArray(service.included_features)
    ? service.included_features
    : (typeof service.included_features === 'string'
        ? JSON.parse(service.included_features || '[]')
        : []);

  return (
    <div className="service-card card">
      <div className="service-card-image img-overlay">
        {service.image_url ? (
          <img src={service.image_url} alt={service.name} loading="lazy" />
        ) : (
          <div className="service-card-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        )}
      </div>

      <div className="card-body">
        <div className="service-card-header">
          <h3 className="service-card-title">{service.name}</h3>
          <div className="service-card-meta">
            <ClockIcon />
            <span>{formatDuration(service.duration_minutes)}</span>
          </div>
        </div>

        {service.description && (
          <p className="service-card-desc">{service.description}</p>
        )}

        {features.length > 0 && (
          <ul className="service-card-features">
            {features.slice(0, 4).map((f, i) => (
              <li key={i} className="service-card-feature">
                <CheckIcon /> <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="service-card-footer">
          <div className="service-card-price">
            <span className="price-label">Starting from</span>
            <span className="price-amount gradient-text">{formatPrice(service.price)}</span>
          </div>
          <Link to={`/book/${service.id}`} className="btn btn-primary btn-sm">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
