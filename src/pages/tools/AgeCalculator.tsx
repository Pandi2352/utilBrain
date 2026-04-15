import { useState, useMemo } from 'react';
import { Cake, CalendarDays, History, Hourglass, RotateCcw } from 'lucide-react';

/* ════════════════════════════════════════════════
   Age Calculator — utilBrain
   ════════════════════════════════════════════════ */

export function AgeCalculator() {
  const [dob, setDob] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  const age = useMemo(() => {
    if (!dob) return null;
    const start = new Date(dob);
    const end = new Date(targetDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Stats
    const diffMs = end.getTime() - start.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const nextBirthday = new Date(end.getFullYear(), start.getMonth(), start.getDate());
    if (nextBirthday < end) nextBirthday.setFullYear(end.getFullYear() + 1);
    const daysToBirthday = Math.ceil((nextBirthday.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));

    return {
      years, months, days,
      totalMonths: years * 12 + months,
      totalWeeks: Math.floor(totalDays / 7),
      totalDays,
      totalHours: totalDays * 24,
      daysToBirthday
    };
  }, [dob, targetDate]);

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Cake size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Age Calculator</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Calculate exact age and upcoming birthday countdown</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: 24 }}>
        {/* Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <Field label="Date of Birth">
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Age as of Date">
              <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} style={inputStyle} />
            </Field>
            <button onClick={() => { setDob(''); setTargetDate(new Date().toISOString().split('T')[0]); }} style={{
              width: '100%', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)',
              background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer'
            }}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          {age && (
            <div style={{ padding: 20, background: 'var(--brand)', borderRadius: 'var(--radius-md)', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, opacity: 0.9 }}>
                <History size={14} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Birthday In</span>
              </div>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>{age.daysToBirthday} Days</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.8, fontWeight: 500 }}>
                {new Date(new Date(targetDate).getFullYear(), new Date(dob).getMonth(), new Date(dob).getDate() < new Date(targetDate).getDate() ? new Date(targetDate).getFullYear() + 1 : new Date(targetDate).getFullYear()).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {age ? (
            <>
              {/* Primary Age Display */}
              <div style={{ padding: 32, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, textAlign: 'center' }}>
                <AgeCircle value={age.years} label="Years" />
                <AgeCircle value={age.months} label="Months" />
                <AgeCircle value={age.days} label="Days" />
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <StatCard icon={<CalendarDays size={16} />} label="Total Months" value={age.totalMonths.toLocaleString()} />
                <StatCard icon={<CalendarDays size={16} />} label="Total Weeks" value={age.totalWeeks.toLocaleString()} />
                <StatCard icon={<CalendarDays size={16} />} label="Total Days" value={age.totalDays.toLocaleString()} />
                <StatCard icon={<Hourglass size={16} />} label="Total Hours (approx)" value={age.totalHours.toLocaleString()} />
              </div>
            </>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
              <Cake size={40} opacity={0.3} />
              <p style={{ fontSize: 14, fontWeight: 500 }}>Enter your date of birth to see the breakdown</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AgeCircle({ value, label }: any) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 42, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
      <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div style={{ padding: '16px 20px', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ color: 'var(--brand)' }}>{icon}</div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
}

function Field({ label, children }: any) {
  return <div style={{ marginBottom: 16 }}><label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</label>{children}</div>;
}

const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
  background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', boxSizing: 'border-box' as const
};
