import { useState, useMemo } from 'react';
import { CalendarDays, RotateCcw, Plus, Minus, History, Clock } from 'lucide-react';

/* ════════════════════════════════════════════════
   Date Difference Calculator — utilBrain
   ════════════════════════════════════════════════ */

export function DateDifference() {
  // Mode 1: Difference between dates
  const [date1, setDate1] = useState(new Date().toISOString().split('T')[0]);
  const [date2, setDate2] = useState('');

  // Mode 2: Add/Subtract from date
  const [baseDate, setBaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [offsetType, setOffsetType] = useState<any>('days');
  const [offsetVal, setOffsetVal] = useState('0');

  const diff = useMemo(() => {
    if (!date1 || !date2) return null;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    return {
      days,
      weeks: (days / 7).toFixed(1),
      months: (days / 30.437).toFixed(1),
      years: (days / 365.25).toFixed(1)
    };
  }, [date1, date2]);

  const offsetDate = useMemo(() => {
    if (!baseDate) return null;
    const d = new Date(baseDate);
    const val = parseInt(offsetVal) || 0;
    
    if (offsetType === 'days') d.setDate(d.getDate() + val);
    else if (offsetType === 'weeks') d.setDate(d.getDate() + (val * 7));
    else if (offsetType === 'months') d.setMonth(d.getMonth() + val);
    else if (offsetType === 'years') d.setFullYear(d.getFullYear() + val);
    
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, [baseDate, offsetType, offsetVal]);

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <CalendarDays size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Date Difference & Calculator</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Calculate time duration between dates or add/subtract time from a date</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Section 1: Duration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <Card title="Difference Between Dates" icon={<History size={16} />}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                 <Field label="Start Date">
                   <input type="date" value={date1} onChange={e => setDate1(e.target.value)} style={inputStyle} />
                 </Field>
                 <Field label="End Date">
                   <input type="date" value={date2} onChange={e => setDate2(e.target.value)} style={inputStyle} />
                 </Field>
              </div>
              
              {diff ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                   <StatBox label="Total Days" value={diff.days} />
                   <StatBox label="Weeks" value={diff.weeks} />
                   <StatBox label="Months (avg)" value={diff.months} />
                   <StatBox label="Years (avg)" value={diff.years} />
                </div>
              ) : (
                <div style={{ padding: 32, textAlign: 'center', border: '1.5px dashed var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                   Select end date to see duration
                </div>
              )}
           </Card>
        </div>

        {/* Section 2: Offset */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <Card title="Add / Subtract Time" icon={<Clock size={16} />}>
              <Field label="Base Date">
                 <input type="date" value={baseDate} onChange={e => setBaseDate(e.target.value)} style={inputStyle} />
              </Field>
              
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                 <input type="number" value={offsetVal} onChange={e => setOffsetVal(e.target.value)} style={{ ...inputStyle, width: 80 }} />
                 <select value={offsetType} onChange={e => setOffsetType(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                 </select>
              </div>

              <div style={{ marginTop: 24, padding: 20, background: 'rgba(79,107,237,0.08)', borderRadius: 8, border: '1px solid rgba(79,107,237,0.14)', textAlign: 'center' }}>
                 <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase' }}>Resulting Date</p>
                 <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{offsetDate}</p>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, children }: any) {
  return (
    <div style={{ padding: 24, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ color: 'var(--brand)' }}>{icon}</div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
       </div>
       {children}
    </div>
  );
}

function StatBox({ label, value }: any) {
  return (
    <div style={{ padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 6, textAlign: 'center' }}>
       <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</p>
       <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</p>
    </div>
  );
}

function Field({ label, children }: any) {
  return <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</label>{children}</div>;
}

const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
  background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 6, outline: 'none', boxSizing: 'border-box' as const
};
