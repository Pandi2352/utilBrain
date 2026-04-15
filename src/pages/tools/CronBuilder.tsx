import { useState, useMemo } from 'react';
import { CalendarClock, Copy, Check, RotateCcw, Clock, Info } from 'lucide-react';

/* ════════════════════════════════════════════════
   Cron Expression Builder — utilBrain
   ════════════════════════════════════════════════ */

interface CronState {
  minutes: string;
  hours: string;
  days: string;
  months: string;
  weekdays: string;
}

const initialCron: CronState = {
  minutes: '*',
  hours: '*',
  days: '*',
  months: '*',
  weekdays: '*',
};

export function CronBuilder() {
  const [cron, setCron] = useState<CronState>(initialCron);
  const [copied, setCopied] = useState(false);

  const expression = useMemo(() => {
    return `${cron.minutes} ${cron.hours} ${cron.days} ${cron.months} ${cron.weekdays}`;
  }, [cron]);

  const handleCopy = () => {
    navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => setCron(initialCron);

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <CalendarClock size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Cron Expression Builder</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Build and schedule recurring tasks with ease</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* ── LEFT: Settings ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CronField label="Minutes" value={cron.minutes} onChange={v => setCron({ ...cron, minutes: v })} hint="0-59, *, /, -" />
          <CronField label="Hours"   value={cron.hours}   onChange={v => setCron({ ...cron, hours: v })} hint="0-23, *, /, -" />
          <CronField label="Days"    value={cron.days}    onChange={v => setCron({ ...cron, days: v })} hint="1-31, *, /, -" />
          <CronField label="Months"  value={cron.months}  onChange={v => setCron({ ...cron, months: v })} hint="1-12 or JAN-DEC" />
          <CronField label="Weekday" value={cron.weekdays} onChange={v => setCron({ ...cron, weekdays: v })} hint="0-6 or SUN-SAT" />

          <button onClick={handleReset} style={{
            marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)',
            background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer'
          }}>
            <RotateCcw size={14} /> Reset to Default
          </button>
        </div>

        {/* ── RIGHT: Output ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Result Block */}
          <div style={{ padding: 32, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <p style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cron Expression</p>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', letterSpacing: '4px', marginBottom: 24 }}>
              {expression}
            </div>
            <button onClick={handleCopy} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px',
              fontSize: 14, fontWeight: 700, color: '#fff', background: 'var(--brand)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 150ms'
            }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Expression'}
            </button>
          </div>

          {/* Quick Presets */}
          <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Common Presets</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
              <PresetBtn label="Every Minute" cron="* * * * *" onClick={() => setCron({ minutes: '*', hours: '*', days: '*', months: '*', weekdays: '*' })} />
              <PresetBtn label="Every 5 Minutes" cron="*/5 * * * *" onClick={() => setCron({ minutes: '*/5', hours: '*', days: '*', months: '*', weekdays: '*' })} />
              <PresetBtn label="Top of Every Hour" cron="0 * * * *" onClick={() => setCron({ minutes: '0', hours: '*', days: '*', months: '*', weekdays: '*' })} />
              <PresetBtn label="Every Day at Midnight" cron="0 0 * * *" onClick={() => setCron({ minutes: '0', hours: '0', days: '*', months: '*', weekdays: '*' })} />
              <PresetBtn label="Every Monday" cron="0 0 * * 1" onClick={() => setCron({ minutes: '0', hours: '0', days: '*', months: '*', weekdays: '1' })} />
            </div>
          </div>

          {/* Help Info */}
          <div style={{ padding: 20, background: 'rgba(79,107,237,0.05)', border: '1px solid rgba(79,107,237,0.1)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 12 }}>
            <Info size={18} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Syntax Guide</p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li><b>*</b> : any value</li>
                <li><b>,</b> : value list separator (e.g. 1,3,5)</li>
                <li><b>-</b> : range of values (e.g. 1-5)</li>
                <li><b>/</b> : step values (e.g. */5 for every 5)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CronField({ label, value, onChange, hint }: any) {
  return (
    <div style={{ padding: 16, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</label>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{hint}</span>
      </div>
      <input value={value} onChange={e => onChange(e.target.value)} style={{
        width: '100%', padding: '10px 12px', fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)',
        background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', color: 'var(--text-primary)'
      }} />
    </div>
  );
}

function PresetBtn({ label, cron, onClick }: any) {
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', padding: '10px 12px', background: 'var(--bg-base)',
      border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', transition: 'all 150ms'
    }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
      <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{cron}</p>
    </button>
  );
}
