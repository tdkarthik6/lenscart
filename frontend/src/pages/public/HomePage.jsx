import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesApi } from '../../api/client';
import ServiceCard from '../../components/ServiceCard';

const STEPS = [
  { icon: '🔍', title: 'Browse Services', desc: 'Explore our curated photography and videography packages tailored for every occasion.' },
  { icon: '📅', title: 'Pick Your Date', desc: 'Check real-time availability and pick the perfect date and time for your event.' },
  { icon: '✅', title: 'Confirm Booking', desc: 'Receive an instant booking reference and confirmation directly in your dashboard.' },
  { icon: '📸', title: 'Capture Moments', desc: 'Our team arrives fully prepared to capture every precious moment beautifully.' },
];

const TESTIMONIALS = [
  { name: 'Priya & Arjun', event: 'Wedding — Mumbai', quote: 'LensCraft turned our wedding into a cinematic masterpiece. Every frame is pure magic.' },
  { name: 'Rohan Mehta', event: 'Corporate Event — Pune', quote: 'Professional, punctual, and incredibly talented. Our product launch looked stunning.' },
  { name: 'Sneha Kapoor', event: 'Maternity Shoot — Delhi', quote: 'The most beautiful photos I have ever seen. They made me feel like a queen!' },
];

export default function HomePage() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    servicesApi.getAll().then(res => {
      setServices((res.data.data || []).slice(0, 3));
    }).catch(() => {});
  }, []);

  return (
    <div className="home-page">
      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-gradient" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
        </div>
        <div className="container hero-content animate-fade-in">
          <span className="section-eyebrow">Premium Photography & Videography</span>
          <h1 className="hero-title">
            Capture Every<br />
            <span className="gradient-text">Precious Moment</span>
          </h1>
          <p className="hero-subtitle">
            From grand weddings to intimate portraits — LensCraft brings artistry, passion,
            and decades of expertise to preserve your most cherished memories forever.
          </p>
          <div className="hero-actions">
            <Link to="/services" className="btn btn-primary btn-lg">Explore Packages</Link>
            <Link to="/register" className="btn btn-secondary btn-lg">Start Booking</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span className="hero-stat-num gradient-text">500+</span><span className="hero-stat-label">Events Captured</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span className="hero-stat-num gradient-text">12+</span><span className="hero-stat-label">Years Experience</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span className="hero-stat-num gradient-text">98%</span><span className="hero-stat-label">Happy Clients</span></div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <div className="hero-scroll-dot" />
        </div>
      </section>

      {/* ── FEATURED SERVICES ── */}
      {services.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header animate-fade-in">
              <span className="section-eyebrow">What We Offer</span>
              <h2 className="section-title">Our Photography Packages</h2>
              <p className="section-subtitle">
                Handcrafted packages designed for every milestone — from intimate gatherings to grand celebrations.
              </p>
            </div>
            <div className="grid-3">
              {services.map((s) => <ServiceCard key={s.id} service={s} />)}
            </div>
            <div className="text-center mt-lg">
              <Link to="/services" className="btn btn-secondary">View All Packages</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="section how-it-works-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Simple Process</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Book your perfect photography experience in just a few steps.</p>
          </div>
          <div className="grid-4">
            {STEPS.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{String(i + 1).padStart(2, '0')}</div>
                <div className="step-icon">{s.icon}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Client Stories</span>
            <h2 className="section-title">What Our Clients Say</h2>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card card-glass">
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">{t.quote}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-event text-muted text-sm">{t.event}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section section">
        <div className="container">
          <div className="cta-card card-glass text-center">
            <span className="section-eyebrow">Ready to Begin?</span>
            <h2 style={{ marginBottom: '16px' }}>Your Story Deserves to Be Told</h2>
            <p className="section-subtitle" style={{ marginBottom: '32px' }}>
              Join hundreds of happy families who trusted LensCraft with their most precious moments.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
              <Link to="/services" className="btn btn-ghost btn-lg">Browse Packages</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
