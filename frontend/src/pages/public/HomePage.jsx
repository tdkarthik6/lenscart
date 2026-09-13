import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesApi } from '../../api/client';
import ServiceCard from '../../components/ServiceCard';

/* ── SVG icon helpers ── */
const IconCamera = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const IconAward = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
const IconStar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconClock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconEdit = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const MARQUEE_ITEMS = ['Wedding', 'Pre-Wedding', 'Portrait', 'Corporate', 'Birthday', 'Videography', 'Events', 'Product'];

const WHY_CARDS = [
  { num: '01', icon: <IconAward />, title: 'Award Winning', desc: 'Recognised across South India for excellence in wedding and portrait photography.' },
  { num: '02', icon: <IconCamera />, title: 'Premium Equipment', desc: 'Latest Sony & Canon full-frame mirrorless cameras with professional cinema lenses.' },
  { num: '03', icon: <IconEdit />, title: 'Expert Editors', desc: 'Dedicated post-processing team delivering cinematic colour grades and retouching.' },
  { num: '04', icon: <IconClock />, title: 'On-Time Delivery', desc: 'Receive your edited photos and films on the committed date — every single time.' },
];

const TESTIMONIALS = [
  { name: 'Priya & Arjun', event: 'Wedding — Hyderabad', text: 'LensCraft captured every emotion of our big day so beautifully. The cinematic reels left our entire family in tears. Absolutely stunning work.', initials: 'PA' },
  { name: 'Ravi Kumar', event: 'Corporate Event — Bengaluru', text: 'Hired them for our annual conference. The team was professional, unobtrusive, and delivered 500+ high-resolution photos within 48 hours. Exceptional.', initials: 'RK' },
  { name: 'Sneha Reddy', event: 'Pre-Wedding — Coorg', text: 'We flew to Coorg specifically for a pre-wedding shoot with LensCraft. Worth every rupee. The outdoor lighting, the angles — pure magic.', initials: 'SR' },
];

export default function HomePage() {
  const [featuredServices, setFeaturedServices] = useState([]);

  useEffect(() => {
    servicesApi.getAll()
      .then(res => setFeaturedServices((res.data.data || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ═══════════════════════════════════════ HERO ═══════════════════════════════════════ */}
      <section className="hero-section section-full" style={{ paddingTop: 'var(--nav-height)' }}>
        {/* Background */}
        <div className="hero-bg">
          <div className="hero-gradient" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          {/* Extra cinematic grain overlay */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div className="hero-content animate-slide-up">

            {/* Badge */}
            <div className="hero-badge mb-lg" style={{ display: 'inline-flex' }}>
              <span className="hero-badge-dot" />
              South India's Premier Photography Studio
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: 'clamp(3.2rem, 8vw, 7rem)', lineHeight: 1.0, marginBottom: '24px', letterSpacing: '-0.03em' }}>
              <span style={{ display: 'block', color: 'var(--color-text-primary)', fontWeight: 400 }}>Capturing</span>
              <span className="text-shimmer" style={{ display: 'block', fontStyle: 'italic', fontWeight: 800 }}>
                Your Story.
              </span>
            </h1>

            {/* Subheading */}
            <p className="hero-subtitle animate-slide-up-1">
              From intimate wedding ceremonies to grand corporate galas — we frame every moment
              with precision, passion, and cinematic elegance.
            </p>

            {/* CTAs */}
            <div className="hero-actions animate-slide-up-2">
              <Link to="/services" className="btn btn-luxury btn-lg">
                Explore Services <IconArrow />
              </Link>
              <a href="#why-us" className="btn btn-ghost btn-lg">
                Why LensCraft
              </a>
            </div>

            {/* Stat pills */}
            <div className="animate-slide-up-3" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[['500+', 'Events Covered'], ['8+', 'Years Experience'], ['4.9★', 'Google Rating']].map(([v, l]) => (
                <div key={l} className="stat-pill">
                  <span className="stat-pill-value">{v}</span>
                  <span className="stat-pill-label">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-indicator">
          <div className="hero-scroll-dot" />
        </div>
      </section>

      {/* ═══════════════════════════════════ MARQUEE BAND ═══════════════════════════════════ */}
      <div className="marquee-band">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="marquee-item">
              {item} <span className="marquee-dot" />
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════ FEATURED SERVICES ══════════════════════════════════ */}
      {featuredServices.length > 0 && (
        <section className="section" style={{ background: 'var(--color-bg)' }}>
          <div className="container">
            <div className="section-header animate-slide-up">
              <span className="section-eyebrow">What We Offer</span>
              <h2 className="section-title">Our Signature <em style={{ fontStyle: 'italic', color: 'var(--color-gold)' }}>Services</em></h2>
              <p className="section-subtitle">Every package is crafted to tell a unique visual story — tailored to your occasion and vision.</p>
            </div>
            <div className="grid-services">
              {featuredServices.map((s, i) => (
                <div key={s.id} className={`animate-slide-up-${i + 1}`}>
                  <ServiceCard service={s} />
                </div>
              ))}
            </div>
            <div className="text-center mt-lg" style={{ marginTop: '48px' }}>
              <Link to="/services" className="btn btn-secondary btn-lg">
                View All Services <IconArrow />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════ WHY CHOOSE US ══════════════════════════════════════ */}
      <section id="why-us" className="section" style={{ background: 'var(--color-bg-card)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Our Promise</span>
            <h2 className="section-title">Why Teams Choose <em style={{ fontStyle: 'italic', color: 'var(--color-gold)' }}>LensCraft</em></h2>
          </div>
          <div className="grid-4">
            {WHY_CARDS.map((c, i) => (
              <div key={c.num} className={`why-card animate-slide-up-${i + 1}`}>
                <div className="why-card-icon">{c.icon}</div>
                <span className="why-card-number">{c.num}</span>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--color-text-primary)' }}>{c.title}</h3>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.7 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ TESTIMONIALS ════════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--color-bg)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Client Love</span>
            <h2 className="section-title">Stories That <em style={{ fontStyle: 'italic', color: 'var(--color-gold)' }}>Move Us</em></h2>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`card-luxury animate-slide-up-${i + 1}`} style={{ padding: '32px' }}>
                {/* Stars */}
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, j) => <span key={j} className="testimonial-star">★</span>)}
                </div>
                {/* Quote */}
                <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--color-text-secondary)', fontStyle: 'italic', marginBottom: '24px' }}>
                  "{t.text}"
                </p>
                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-saffron) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: 'var(--color-bg)', fontSize: '0.85rem',
                  }}>{t.initials}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{t.event}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ CTA BANNER ══════════════════════════════════════════ */}
      <section className="section-sm" style={{ background: 'var(--color-bg-card)' }}>
        <div className="container">
          <div className="cta-banner">
            <span className="section-eyebrow" style={{ marginBottom: '16px' }}>Start Your Journey</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', marginBottom: '16px', maxWidth: '640px', margin: '0 auto 16px' }}>
              Ready to Book Your <span className="text-shimmer">Dream Session?</span>
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', maxWidth: '520px', margin: '0 auto 36px', lineHeight: 1.7 }}>
              Browse our services and reserve your date online. No sign-up required — just fill in the details and you're booked.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/services" className="btn btn-luxury btn-lg">
                Book a Session <IconArrow />
              </Link>
              <a
                href="https://wa.me/919032443967?text=Hello%20LensCraft!%20I%20would%20like%20to%20enquire%20about%20your%20photography%20services."
                target="_blank" rel="noopener noreferrer"
                className="btn btn-ghost btn-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#25D366' }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
