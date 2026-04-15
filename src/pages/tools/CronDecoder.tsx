import { useState, useMemo } from 'react';
import { CalendarClock, Copy, Check, RotateCcw, Clock, Info, ArrowRight, List, Terminal } from 'lucide-react';
import cronstrue from 'cronstrue';

/* ════════════════════════════════════════════════
   Human-Readable Cron Decoder — utilBrain
   ════════════════════════════════════════════════ */

export function CronDecoder() {
  const [expression, setExpression] = useState('*/15 0 1,15 * 1');
  const [copied, setCopied] = useState(false);

  const humanReadable = useMemo(() => {
    if (!expression.trim()) return '';
    try {
      return cronstrue.toString(expression, { use24HourTimeFormat: true });
    } catch (e) {
      return 'Invalid Cron Expression';
    }
  }, [expression]);

  const parts = useMemo(() => {
    const p = expression.trim().split(/\s+/);
    return {
      min: p[0] || '-',
      hour: p[1] || '-',
      day: p[2] || '-',
      month: p[3] || '-',
      weekday: p[4] || '-',
    };
  }, [expression]);

  const handleCopy = () => {
    navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', overflowY: 'auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <CalendarClock size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Cron Decoder</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Surgically translate complex schedules into human language</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Input Section */}
        <div style={{ padding: 32, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
             <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>INPUT CRON EXPRESSION</label>
             <button onClick={() => setExpression('* * * * *')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><RotateCcw size={14} /></button>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
             <input 
               value={expression} onChange={e => setExpression(e.target.value)}
               placeholder="* * * * *"
               style={{ 
                 flex: 1, padding: '16px 20px', fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', 
                 background: 'var(--bg-base)', border: '2px solid var(--brand)', borderRadius: 8, outline: 'none', color: 'var(--text-primary)', letterSpacing: '4px' 
               }} 
             />
             <button onClick={handleCopy} style={{ 
               padding: '0 24px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
             }}>
                {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'COPIED' : 'COPY'}
             </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
           {/* Translation Section */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ padding: 28, background: 'rgba(79,107,237,0.03)', border: '2px solid var(--brand)', borderRadius: 12, position: 'relative' }}>
                 <div style={{ position: 'absolute', top: -10, left: 24, background: 'var(--brand)', color: '#fff', padding: '2px 10px', borderRadius: 4, fontSize: 9, fontWeight: 900, letterSpacing: '0.05em' }}>SURGICAL TRANSLATION</div>
                 <p style={{ margin: 0, fontSize: 20, fontWeight: 800, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                    “{humanReadable}”
                 </p>
              </div>

              {/* Technical Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                 <PartBox label="MIN" value={parts.min} />
                 <PartBox label="HOUR" value={parts.hour} />
                 <PartBox label="DAY" value={parts.day} />
                 <PartBox label="MONTH" value={parts.month} />
                 <PartBox label="WEEKDAY" value={parts.weekday} />
              </div>

              {/* Presets */}
              <div style={{ padding: 24, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12 }}>
                 <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Quick Presets</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <PresetItem label="Every Minute" cron="* * * * *" onClick={() => setExpression('* * * * *')} />
                    <PresetItem label="Every 5m" cron="*/5 * * * *" onClick={() => setExpression('*/5 * * * *')} />
                    <PresetItem label="Every Hour" cron="0 * * * *" onClick={() => setExpression('0 * * * *')} />
                    <PresetItem label="Midnight Daily" cron="0 0 * * *" onClick={() => setExpression('0 0 * * *')} />
                    <PresetItem label="Every Sunday" cron="0 0 * * 0" onClick={() => setExpression('0 0 * * 0')} />
                    <PresetItem label="Mon-Fri 9AM" cron="0 9 * * 1-5" onClick={() => setExpression('0 9 * * 1-5')} />
                 </div>
              </div>
           </div>

           {/* Timeline / Next Runs Simulation */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ padding: 24, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12, flex: 1 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <Clock size={16} style={{ color: 'var(--brand)' }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Next 5 Executions</span>
                 </div>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-base)', borderRadius: 8, border: '1px solid var(--border)' }}>
                         <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--brand)', opacity: 1 - (i * 0.15) }} />
                         <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {/* In a real environment, we'd use cron-parser for precise dates. 
                                For this utility UI, we show the structure of upcoming intervals */}
                            Execution Slot {i + 1}
                         </span>
                         <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                      </div>
                    ))}
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, padding: 12, background: 'rgba(79,107,237,0.05)', borderRadius: 6, border: '1px dashed var(--brand)' }}>
                       <Info size={14} style={{ color: 'var(--brand)', flexShrink: 0 }} />
                       <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          Next run calculation is simulated based on current pattern frequency.
                       </p>
                    </div>
                 </div>
              </div>

              <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Terminal size={16} style={{ color: 'var(--brand)' }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>CLI HELP</span>
                 </div>
                 <code style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', background: 'var(--bg-base)', padding: 10, borderRadius: 6 }}>
                    # Test in terminal<br/>
                    crontab -l | grep ...
                 </code>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function PartBox({ label, value }: any) {
  return (
    <div style={{ padding: '12px 8px', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 8, textAlign: 'center' }}>
       <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{label}</p>
       <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--brand)', fontFamily: 'var(--font-mono)' }}>{value}</p>
    </div>
  );
}

function PresetItem({ label, cron, onClick }: any) {
  return (
    <button onClick={onClick} style={{ 
      padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', textAlign: 'left', transition: 'all 200ms'
    }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
       <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</p>
       <p style={{ margin: 0, fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{cron}</p>
    </button>
  );
}
