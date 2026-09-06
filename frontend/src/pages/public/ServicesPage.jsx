import { useEffect, useState } from 'react';
import { servicesApi } from '../../api/client';
import ServiceCard from '../../components/ServiceCard';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    servicesApi.getAll()
      .then(res => setServices(res.data.data || []))
      .catch(() => setError('Failed to load services. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <div className="container">
        <div className="section-header animate-fade-in">
          <span className="section-eyebrow">Our Packages</span>
          <h1 className="section-title">Photography & Videography Services</h1>
          <p className="section-subtitle">
            Every package is crafted with care to suit different occasions, budgets, and dreams.
          </p>
        </div>

        {loading && (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        )}

        {error && (
          <div className="alert-error text-center">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="empty-state text-center">
            <p className="text-muted">No services available at the moment. Please check back soon.</p>
          </div>
        )}

        {!loading && !error && services.length > 0 && (
          <div className="grid-3 animate-fade-in">
            {services.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
