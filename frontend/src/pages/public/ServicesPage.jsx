import { useEffect, useState } from 'react';
import { servicesApi } from '../../api/client';
import ServiceCard from '../../components/ServiceCard';

// Static fallback — shown instantly even with no backend
const FALLBACK_SERVICES = [
  {
    id: 1,
    name: 'Wedding Photography',
    description: 'Full-day wedding coverage with a team of 2 photographers. Candid and traditional shots, drone footage, and same-day highlight reel.',
    price: 75000,
    duration_minutes: 600,
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    included_features: JSON.stringify(['2 Photographers', '600+ Edited Photos', 'Drone Coverage', 'Same-day Highlights', 'Online Gallery', 'USB Drive Delivery']),
    active: 1,
  },
  {
    id: 2,
    name: 'Pre-Wedding Shoot',
    description: 'Romantic outdoor or studio pre-wedding session capturing your love story with cinematic editing.',
    price: 25000,
    duration_minutes: 240,
    image_url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80',
    included_features: JSON.stringify(['4 Hours Session', '150+ Edited Photos', '1 Location', 'Styling Guidance', 'Online Gallery']),
    active: 1,
  },
  {
    id: 3,
    name: 'Wedding Videography',
    description: 'Cinematic wedding film with 4K resolution, colour grading, and a beautiful background score.',
    price: 55000,
    duration_minutes: 600,
    image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    included_features: JSON.stringify(['4K Cinematic Film', 'Highlight Reel', 'Raw Footage', 'Drone Aerial', 'Background Score', 'USB Delivery']),
    active: 1,
  },
  {
    id: 4,
    name: 'Birthday Photography',
    description: 'Joyful birthday celebration coverage — candid moments, cake cutting, and group shots.',
    price: 12000,
    duration_minutes: 180,
    image_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80',
    included_features: JSON.stringify(['3 Hours Coverage', '100+ Edited Photos', '1 Photographer', 'Online Gallery']),
    active: 1,
  },
  {
    id: 5,
    name: 'Corporate Events',
    description: 'Professional coverage for conferences, product launches, and team events with quick turnaround.',
    price: 20000,
    duration_minutes: 480,
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    included_features: JSON.stringify(['Full Day Coverage', '500+ Edited Photos', '48hr Delivery', 'Commercial License']),
    active: 1,
  },
  {
    id: 6,
    name: 'Event Videography',
    description: 'Complete video coverage for any event — corporate, cultural, or social — edited as a professional film.',
    price: 18000,
    duration_minutes: 360,
    image_url: 'https://images.unsplash.com/photo-1574717025058-2f8737d2e2b7?w=800&q=80',
    included_features: JSON.stringify(['6 Hours Coverage', '4K Recording', 'Highlight Reel', 'Background Music', 'Online Delivery']),
    active: 1,
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState(FALLBACK_SERVICES); // starts with data immediately
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    // Try to load from API; if it fails, keep the fallback data
    servicesApi.getAll()
      .then(res => {
        const data = res.data?.data;
        if (Array.isArray(data) && data.length > 0) setServices(data);
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  return (
    <div className="page-container">
      <div className="container">
        <div className="section-header animate-slide-up">
          <span className="section-eyebrow">Our Packages</span>
          <h1 className="section-title">
            Photography &amp; <span className="gradient-text">Videography</span> Services
          </h1>
          <p className="section-subtitle">
            Every package is crafted with care to suit different occasions, budgets, and dreams.
          </p>
        </div>

        <div className="grid-services">
          {services.map((s, i) => (
            <div key={s.id} className={`animate-slide-up-${Math.min(i + 1, 4)}`}>
              <ServiceCard service={s} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
