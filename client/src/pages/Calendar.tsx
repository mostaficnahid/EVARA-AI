import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventsStore } from '../store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, subMonths, isToday } from 'date-fns';

const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Calendar() {
  const { events, fetchEvents } = useEventsStore();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(new Date());

  useEffect(() => { fetchEvents({ limit: 100 }); }, []);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const getEventsByDay = (day: Date) => events.filter(e => isSameDay(new Date(e.date), day));

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-main">Calendar</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setCurrent(d => subMonths(d, 1))}>←</button>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, minWidth: 180, textAlign: 'center' }}>{format(current, 'MMMM yyyy')}</div>
          <button className="btn btn-outline btn-sm" onClick={() => setCurrent(d => addMonths(d, 1))}>→</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrent(new Date())}>Today</button>
        </div>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 1 }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1, textTransform: 'uppercase', padding: '8px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {/* Padding cells */}
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} style={{ minHeight: 100, background: 'var(--surface)', opacity: 0.3, borderRadius: 4 }} />
        ))}

        {days.map(day => {
          const dayEvents = getEventsByDay(day);
          const today = isToday(day);
          return (
            <div
              key={day.toString()}
              style={{
                minHeight: 100, background: 'var(--surface)', border: `1px solid ${today ? 'var(--gold)' : 'var(--border)'}`,
                borderRadius: 4, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 4,
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{
                fontSize: 12, fontWeight: today ? 700 : 400,
                color: today ? 'var(--gold)' : 'var(--text-muted)',
                alignSelf: 'flex-end',
                width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: today ? 'var(--gold-dim)' : 'transparent',
              }}>
                {format(day, 'd')}
              </div>
              {dayEvents.slice(0, 3).map(e => (
                <div
                  key={e._id}
                  onClick={() => navigate(`/events/${e._id}`)}
                  style={{
                    fontSize: 10, padding: '3px 6px', borderRadius: 4, cursor: 'pointer',
                    background: `${e.color || 'var(--gold)'}22`, borderLeft: `2px solid ${e.color || 'var(--gold)'}`,
                    color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    transition: 'opacity 0.2s',
                  }}
                  title={e.name}
                >
                  {e.time} {e.name}
                </div>
              ))}
              {dayEvents.length > 3 && <div style={{ fontSize: 10, color: 'var(--text-dim)', paddingLeft: 6 }}>+{dayEvents.length - 3} more</div>}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          {events.length} event{events.length !== 1 ? 's' : ''} this month
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {events.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === current.getMonth() && d.getFullYear() === current.getFullYear();
          }).map(e => (
            <div key={e._id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => navigate(`/events/${e._id}`)}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.color || 'var(--gold)' }} />
              {e.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
