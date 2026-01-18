import { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Clock } from 'lucide-react';
import styles from './EconomicCalendar.module.css';

export default function EconomicCalendar() {
  // Mock Data for Calendar Events (In a real app, fetch from an API like ForexFactory/Investing.com)
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Simulating fetching data
    const today = new Date();
    const mockEvents = [
      { id: 1, time: '14:30', currency: 'USD', impact: 'High', event: 'CPI m/m', actual: '0.4%', forecast: '0.3%' },
      { id: 2, time: '14:30', currency: 'USD', impact: 'High', event: 'Core CPI m/m', actual: '', forecast: '0.3%' },
      { id: 3, time: '16:00', currency: 'EUR', impact: 'Medium', event: 'Lagarde Speaks', actual: '', forecast: '' },
      { id: 4, time: '20:00', currency: 'USD', impact: 'High', event: 'FOMC Meeting Minutes', actual: '', forecast: '' },
      { id: 6, time: '09:00', currency: 'GBP', impact: 'Medium', event: 'GDP m/m', actual: '0.2%', forecast: '0.2%' },
    ];

    // Filter for upcoming or recent
    setEvents(mockEvents);
  }, []);

  const getImpactColor = (impact) => {
    if (impact === 'High') return '#ef4444';
    if (impact === 'Medium') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className={styles.calendarCard}>
      <div className={styles.header}>
        <h3><Calendar size={18} className={styles.headerIcon} /> Economic Calendar</h3>
        <span className={styles.date}>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
      </div>

      <div className={styles.eventList}>
        {events.map(ev => (
          <div key={ev.id} className={styles.eventRow}>
            <div className={styles.timeCol}>
              {ev.actual ? <span className={styles.doneDot}>●</span> : <Clock size={12} />}
              {ev.time}
            </div>
            <div className={styles.currencyCol}>
              <span className={styles.flag}>{ev.currency}</span>
            </div>
            <div className={styles.eventCol}>
              <div className={styles.eventName}>{ev.event}</div>
              <div className={styles.impactDot} style={{ background: getImpactColor(ev.impact) }} title={`${ev.impact} Impact`}></div>
            </div>
            <div className={styles.dataCol}>
              {ev.actual && <span className={styles.actual}>{ev.actual}</span>}
              <span className={styles.forecast}>{ev.forecast}</span>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.footer}>
        <AlertCircle size={12} />
        <span>High impact news can cause slippage.</span>
      </div>
    </div>
  );
}
