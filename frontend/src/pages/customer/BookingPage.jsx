import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
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
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h), ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
}
const today = () => new Date().toISOString().split('T')[0];

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

export default function BookingPage() {
  const { serviceId } = useParams();

  const [service, setService]       = useState(null);
  const [svcLoading, setSvcLoading] = useState(true);
  const [svcError, setSvcError]     = useState('');

  const [form, setForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '',
    eventDate: '', startTime: '', endTime: '', location: '', notes: '',
  });

  const [availability, setAvailability] = useState(null);
  const [availLoading, setAvailLoading] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [success, setSuccess]           = useState(null); // booking object on success

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
    } catch { setAvailability(null); }
    finally { setAvailLoading(false); }
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
    if (!form.customerName.trim()) { toast.error('Please enter your name.'); return; }
    if (!form.customerEmail.trim()) { toast.error('Please enter your email.'); return; }
    setSubmitting(true);
    try {
      const res = await bookingsApi.create({
        serviceId: parseInt(serviceId),
        eventDate: form.eventDate,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location,
        notes: form.notes,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
      });
      setSuccess(res.data.data);
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

  /* ── Success screen ── */
  if (success) return (
    <div className="page-container flex-center" style={{ minHeight: '70vh' }}>
      <div className="card-luxury text-center animate-slide-up" style={{ padding: '48px 40px', maxWidth: '520px', width: '100%' }}>
        {/* Checkmark icon */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 24px',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))',
          border: '2px solid rgba(34,197,94,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.2rem',
        }}>✅</div>

        <h2 style={{ marginBottom: '8px', fontSize: '1.8rem' }}>Booking Confirmed!</h2>
        <p className="text-secondary mb-lg">We have received your booking. Our team will contact you shortly.</p>

        {/* Reference box */}
        <div style={{
          background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)',
          borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: '28px',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
            Booking Reference
          </div>
          <div className="text-shimmer" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '0.05em' }}>
            {success.booking_reference}
          </div>
        </div>

        {/* Details */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {[
            ['📋', 'Service', success.service_name || service?.name],
            ['📅', 'Date', formatDate(success.event_date)],
            ['🕐', 'Time', `${formatTime(success.start_time)} – ${formatTime(success.end_time)}`],
            success.location && ['📍', 'Venue', success.location],
          ].filter(Boolean).map(([icon, label, value]) => (
            <div key={label} style={{ display: 'flex', gap: '10px', fontSize: '0.9rem' }}>
              <span>{icon}</span>
              <span style={{ color: 'var(--color-text-muted)', minWidth: '60px' }}>{label}</span>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/services" className="btn btn-ghost btn-sm">Browse More</Link>
          <WhatsAppInlineButton bookingRef={success.booking_reference} serviceName={success.service_name || service?.name} />
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
        {/* Page title */}
        <div className="text-center mb-xl animate-slide-up">
          <span className="section-eyebrow">Step 1 of 1</span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginBottom: '8px' }}>
            Book <span className="gradient-text">{service.name}</span>
          </h2>
          <p className="text-secondary">Fill in your details — no account required.</p>
        </div>

        <div className="booking-layout">
          {/* LEFT: Service summary */}
          <div className="booking-service-summary">
            <div className="card-luxury" style={{ padding: '28px' }}>
              {service.image_url && (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '20px', height: '180px' }}>
                  <img src={service.image_url} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <span className="tag mb-md" style={{ display: 'inline-block' }}>Photography</span>
              <h3 style={{ marginBottom: '6px', fontSize: '1.3rem' }}>{service.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>⏱ {formatDuration(service.duration_minutes)}</span>
                <span className="text-shimmer" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
                  {formatPrice(service.price)}
                </span>
              </div>
              {service.description && (
                <p style={{ fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '16px' }}>{service.description}</p>
              )}
              {features.length > 0 && (
                <div className="divider-gold-full" style={{ margin: '16px 0' }} />
              )}
              {features.length > 0 && (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      <span style={{ color: 'var(--color-gold)', flexShrink: 0 }}><CheckIcon /></span> {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT: Booking form */}
          <div>
            <div className="card-luxury" style={{ padding: '32px' }}>
              <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>Your Details &amp; Date</h3>
              <form onSubmit={handleSubmit}>
                {/* Customer info */}
                <div className="grid-2" style={{ gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="customerName">Full Name *</label>
                    <input id="customerName" name="customerName" type="text" className="form-input"
                      placeholder="Rahul Sharma" value={form.customerName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="customerPhone">Phone Number</label>
                    <input id="customerPhone" name="customerPhone" type="tel" className="form-input"
                      placeholder="+91 98765 43210" value={form.customerPhone} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="customerEmail">Email Address *</label>
                  <input id="customerEmail" name="customerEmail" type="email" className="form-input"
                    placeholder="rahul@example.com" value={form.customerEmail} onChange={handleChange} required />
                </div>

                <div className="divider-gold-full" style={{ margin: '20px 0' }} />

                {/* Date & time */}
                <div className="form-group">
                  <label className="form-label" htmlFor="eventDate">Event Date *</label>
                  <input id="eventDate" name="eventDate" type="date" className="form-input"
                    min={today()} value={form.eventDate} onChange={handleChange} required />
                </div>
                <div className="grid-2" style={{ gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="startTime">Start Time *</label>
                    <input id="startTime" name="startTime" type="time" className="form-input"
                      value={form.startTime} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="endTime">End Time *</label>
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
                  <label className="form-label" htmlFor="location">Venue / Location</label>
                  <input id="location" name="location" type="text" className="form-input"
                    placeholder="e.g. Taj Falaknuma Palace, Hyderabad" value={form.location} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="notes">Special Requirements <span className="text-muted">(optional)</span></label>
                  <textarea id="notes" name="notes" className="form-input" rows={3}
                    placeholder="Any special requirements, themes, or details…" value={form.notes} onChange={handleChange} />
                </div>

                <button type="submit" className="btn btn-luxury w-full btn-lg" style={{ marginTop: '8px' }}
                  disabled={submitting || !availability?.available}>
                  {submitting ? <><span className="spinner spinner-sm" /> Confirming…</> : '✨ Confirm Booking'}
                </button>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '12px' }}>
                  No account required · We'll contact you to confirm details
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
