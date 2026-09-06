import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { servicesApi, bookingsApi } from '../../api/client';
import toast from 'react-hot-toast';
import { WhatsAppInlineButton } from '../../components/WhatsAppButton';

function formatPrice(p) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
}

function formatDuration(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : h ? `${h}h` : `${mins}m`;
}

const today = () => new Date().toISOString().split('T')[0];

export default function BookingPage() {
  const { serviceId } = useParams();
  const navigate      = useNavigate();

  const [service, setService] = useState(null);
  const [svcLoading, setSvcLoading] = useState(true);
  const [svcError, setSvcError]     = useState('');

  const [form, setForm] = useState({
    eventDate: '', startTime: '', endTime: '', location: '', notes: '',
  });

  const [availability, setAvailability] = useState(null); // { available, message }
  const [availLoading, setAvailLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(null); // booking reference on success

  useEffect(() => {
    servicesApi.getById(serviceId)
      .then(res => setService(res.data.data))
      .catch(() => setSvcError('Service not found.'))
      .finally(() => setSvcLoading(false));
  }, [serviceId]);

  const checkAvailability = useCallback(async (date, start, end) => {
    if (!date || !start || !end || start >= end) { setAvailability(null); return; }
    setAvailLoading(true);
    try {
      const res = await bookingsApi.checkAvailability({ date, startTime: start, endTime: end, serviceId });
      setAvailability(res.data.data);
    } catch {
      setAvailability(null);
    } finally {
      setAvailLoading(false);
    }
  }, [serviceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (['eventDate', 'startTime', 'endTime'].includes(name)) {
      checkAvailability(next.eventDate, next.startTime, next.endTime);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!availability?.available) { toast.error('Please select an available time slot.'); return; }
    setSubmitting(true);
    try {
      const res = await bookingsApi.create({ serviceId: parseInt(serviceId), ...form });
      const booking = res.data.data;
      setSuccess(booking.booking_reference);
      toast.success('Booking confirmed! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (svcLoading) return <div className="loading-center"><div className="spinner" /></div>;
  if (svcError)   return (
    <div className="page-container text-center">
      <p className="text-error mb-md">{svcError}</p>
      <Link to="/services" className="btn btn-secondary">Back to Services</Link>
    </div>
  );

  if (success) return (
    <div className="page-container flex-center" style={{ minHeight: '60vh' }}>
      <div className="success-card card-glass text-center animate-fade-in">
        <div className="success-icon">🎉</div>
        <h2 style={{ marginBottom: '8px' }}>Booking Confirmed!</h2>
        <p className="text-secondary mb-md">Your session has been successfully booked.</p>
        <div className="booking-ref-display">
          <span className="text-muted text-sm">Booking Reference</span>
          <span className="booking-ref-code gradient-text">{success}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
          <Link to="/my-bookings" className="btn btn-primary">View My Bookings</Link>
          <WhatsAppInlineButton bookingRef={success} serviceName={service?.name} />
          <Link to="/services" className="btn btn-ghost">Book Another</Link>
        </div>
      </div>
    </div>
  );

  const features = Array.isArray(service.included_features)
    ? service.included_features
    : JSON.parse(service.included_features || '[]');

  return (
    <div className="page-container">
      <div className="container">
        <div className="booking-layout">
          {/* LEFT: Service Summary */}
          <div className="booking-service-summary card">
            <div className="card-body">
              <span className="section-eyebrow">You are booking</span>
              <h2 style={{ marginBottom: '8px' }}>{service.name}</h2>
              <div className="service-meta-row">
                <span className="text-muted text-sm">⏱ {formatDuration(service.duration_minutes)}</span>
                <span className="price-amount gradient-text">{formatPrice(service.price)}</span>
              </div>
              {service.description && <p className="text-secondary" style={{ marginTop: '12px', fontSize: '0.9rem' }}>{service.description}</p>}
              {features.length > 0 && (
                <ul className="service-card-features" style={{ marginTop: '16px' }}>
                  {features.map((f, i) => (
                    <li key={i} className="service-card-feature">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT: Booking Form */}
          <div>
            <div className="card card-glass">
              <div className="card-body">
                <h3 style={{ marginBottom: '20px' }}>Select Date & Time</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="eventDate">Event Date</label>
                    <input id="eventDate" name="eventDate" type="date" className="form-input"
                      min={today()} value={form.eventDate} onChange={handleChange} required />
                  </div>

                  <div className="grid-2" style={{ gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="startTime">Start Time</label>
                      <input id="startTime" name="startTime" type="time" className="form-input"
                        value={form.startTime} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="endTime">End Time</label>
                      <input id="endTime" name="endTime" type="time" className="form-input"
                        value={form.endTime} onChange={handleChange} required />
                    </div>
                  </div>

                  {/* Availability indicator */}
                  {availLoading && <div className="avail-check"><span className="spinner spinner-sm" /> Checking availability…</div>}
                  {!availLoading && availability && (
                    <div className={`avail-result ${availability.available ? 'avail-ok' : 'avail-busy'}`}>
                      {availability.available ? '✅ This time slot is available!' : `❌ ${availability.message}`}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" htmlFor="location">Event Location</label>
                    <input id="location" name="location" type="text" className="form-input"
                      placeholder="e.g. Taj Hotel, Mumbai" value={form.location} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="notes">Additional Notes <span className="text-muted">(optional)</span></label>
                    <textarea id="notes" name="notes" className="form-input" rows={3}
                      placeholder="Any special requirements or details…" value={form.notes} onChange={handleChange} />
                  </div>

                  <button id="confirm-booking" type="submit" className="btn btn-primary w-full btn-lg"
                    disabled={submitting || !availability?.available}>
                    {submitting ? <><span className="spinner spinner-sm" /> Confirming…</> : 'Confirm Booking'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
