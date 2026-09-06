import { useEffect, useState } from 'react';
import { servicesApi } from '../../api/client';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', price: '', durationMinutes: '', imageUrl: '', includedFeatures: '', active: true };

function formatINR(p) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
}
function formatDuration(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : h ? `${h}h` : `${mins}m`;
}

export default function OwnerServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState(null); // service object or null = new
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  const load = () => {
    setLoading(true);
    servicesApi.getAll({ all: 'true' })
      .then(res => setServices(res.data.data || []))
      .catch(() => toast.error('Failed to load services.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    const features = Array.isArray(s.included_features)
      ? s.included_features.join('\n')
      : (JSON.parse(s.included_features || '[]')).join('\n');
    setForm({
      name: s.name, description: s.description || '', price: s.price,
      durationMinutes: s.duration_minutes, imageUrl: s.image_url || '',
      includedFeatures: features, active: s.active === 1 || s.active === true,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      durationMinutes: parseInt(form.durationMinutes),
      imageUrl: form.imageUrl || null,
      includedFeatures: form.includedFeatures
        ? form.includedFeatures.split('\n').map(f => f.trim()).filter(Boolean)
        : [],
      active: form.active,
    };
    try {
      if (editing) {
        await servicesApi.update(editing.id, payload);
        toast.success('Service updated!');
      } else {
        await servicesApi.create(payload);
        toast.success('Service created!');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s) => {
    const newState = !(s.active === 1 || s.active === true);
    try {
      await servicesApi.toggleStatus(s.id, newState);
      toast.success(`Service ${newState ? 'activated' : 'deactivated'}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Toggle failed.');
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete "${s.name}"? This cannot be undone.`)) return;
    try {
      await servicesApi.delete(s.id);
      toast.success('Service removed.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header flex-between" style={{ marginBottom: '28px' }}>
          <div>
            <span className="section-eyebrow">Studio Management</span>
            <h1 style={{ fontSize: '2rem' }}>Services</h1>
          </div>
          <button id="add-service-btn" className="btn btn-primary" onClick={openCreate}>+ Add Service</button>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : services.length === 0 ? (
          <div className="empty-state card-glass text-center" style={{ padding: '64px' }}>
            <p className="text-muted mb-md">No services yet. Add your first package!</p>
            <button className="btn btn-primary" onClick={openCreate}>+ Add Service</button>
          </div>
        ) : (
          <div className="owner-table-wrapper">
            <table className="owner-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => {
                  const isActive = s.active === 1 || s.active === true;
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="font-semibold">{s.name}</div>
                        {s.description && <div className="text-muted text-xs" style={{ maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</div>}
                      </td>
                      <td className="gradient-text font-semibold">{formatINR(s.price)}</td>
                      <td>{formatDuration(s.duration_minutes)}</td>
                      <td>
                        <span className={`badge ${isActive ? 'badge-confirmed' : 'badge-cancelled'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Edit</button>
                          <button className={`btn btn-sm ${isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleActive(s)}>
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-card card animate-fade-in">
            <div className="modal-header flex-between">
              <h3>{editing ? 'Edit Service' : 'Add New Service'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div className="form-group">
                <label className="form-label">Service Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Wedding Photography" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe what's included…" />
              </div>
              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Price (₹) *</label>
                  <input className="form-input" type="number" min="0" step="100" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required placeholder="25000" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Duration (minutes) *</label>
                  <input className="form-input" type="number" min="30" step="30" value={form.durationMinutes} onChange={e => setForm(p => ({ ...p, durationMinutes: e.target.value }))} required placeholder="480" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input className="form-input" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://…" />
              </div>
              <div className="form-group">
                <label className="form-label">Included Features <span className="text-muted">(one per line)</span></label>
                <textarea className="form-input" rows={4} value={form.includedFeatures} onChange={e => setForm(p => ({ ...p, includedFeatures: e.target.value }))} placeholder={"Full day coverage\nEdited photos\n4K video highlight"} />
              </div>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" id="active-toggle" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <label htmlFor="active-toggle" className="form-label" style={{ marginBottom: 0 }}>Service is active</label>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner spinner-sm" /> Saving…</> : (editing ? 'Save Changes' : 'Create Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
