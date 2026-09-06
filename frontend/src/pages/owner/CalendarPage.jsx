import { useEffect, useState } from 'react';
import { ownerApi } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null); // selected day number

  useEffect(() => {
    setLoading(true);
    setSelected(null);
    const firstDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay   = new Date(year, month + 1, 0).getDate();
    const lastDate  = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;
    ownerApi.calendar({ startDate: firstDate, endDate: lastDate })
      .then(res => setBookings(res.data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [year, month]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  // Group bookings by day
  const byDay = {};
  bookings.forEach(b => {
    const d = new Date(b.event_date).getDate();
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(b);
  });

  const { firstDay, daysInMonth } = getMonthDays(year, month);
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedBookings = selected ? (byDay[selected] || []) : [];

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header flex-between" style={{ marginBottom: '28px' }}>
          <div>
            <span className="section-eyebrow">Studio Management</span>
            <h1 style={{ fontSize: '2rem' }}>Booking Calendar</h1>
          </div>
        </div>

        <div className="calendar-layout">
          {/* Calendar Grid */}
          <div className="calendar-card card">
            <div className="calendar-nav card-body flex-between">
              <button className="btn btn-ghost btn-sm" onClick={prevMonth}>← Prev</button>
              <h3>{MONTHS[month]} {year}</h3>
              <button className="btn btn-ghost btn-sm" onClick={nextMonth}>Next →</button>
            </div>

            <div className="calendar-grid">
              {DAYS.map(d => (
                <div key={d} className="calendar-day-header">{d}</div>
              ))}
              {cells.map((day, i) => {
                const count = day ? (byDay[day]?.length || 0) : 0;
                const isToday = day && day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                return (
                  <div key={i}
                    className={`calendar-cell ${!day ? 'calendar-cell-empty' : ''} ${day && count > 0 ? 'calendar-cell-has-bookings' : ''} ${selected === day ? 'calendar-cell-selected' : ''} ${isToday ? 'calendar-cell-today' : ''}`}
                    onClick={() => day && setSelected(selected === day ? null : day)}
                  >
                    {day && (
                      <>
                        <span className="calendar-day-num">{day}</span>
                        {count > 0 && (
                          <span className="calendar-booking-dot">{count}</span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {loading && <div className="loading-center" style={{ minHeight: '80px' }}><div className="spinner spinner-sm" /></div>}
          </div>

          {/* Sidebar: selected day bookings */}
          <div className="calendar-sidebar">
            {selected ? (
              <>
                <h3 style={{ marginBottom: '16px' }}>
                  {MONTHS[month]} {selected}, {year}
                  <span className="text-muted text-sm" style={{ marginLeft: '8px' }}>
                    ({selectedBookings.length} booking{selectedBookings.length !== 1 ? 's' : ''})
                  </span>
                </h3>
                {selectedBookings.length === 0 ? (
                  <p className="text-muted text-sm">No bookings on this day.</p>
                ) : (
                  selectedBookings.map(b => (
                    <div key={b.id} className="calendar-booking-item card">
                      <div className="card-body">
                        <div className="flex-between mb-sm">
                          <span className="booking-ref">{b.booking_reference}</span>
                          <StatusBadge status={b.status} />
                        </div>
                        <div className="font-semibold">{b.service_name}</div>
                        <div className="text-muted text-sm">{b.customer_name}</div>
                        <div className="text-muted text-sm">{formatTime(b.start_time)} – {formatTime(b.end_time)}</div>
                        {b.location && <div className="text-sm" style={{ marginTop: '4px' }}>📍 {b.location}</div>}
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : (
              <div className="empty-state text-center" style={{ padding: '40px 16px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📅</div>
                <p className="text-muted text-sm">Click a date to see bookings</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
