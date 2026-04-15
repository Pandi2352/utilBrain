import { useState, useMemo } from 'react';
import { Type, RotateCcw, Clock, MousePointer2, FileText } from 'lucide-react';

/* ════════════════════════════════════════════════
   Word Counter — utilBrain
   ════════════════════════════════════════════════ */

export function WordCounter() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n+/).filter(Boolean).length : 0;
    
    // Times
    const readMin = words / 200;
    const speakMin = words / 130;

    return { words, chars, charsNoSpace, sentences, paragraphs, readMin, speakMin };
  }, [text]);

  const handleReset = () => setText('');

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Type size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Word Counter</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Real-time text analysis, counts, and reading time estimates</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        {/* Input area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste or type your text here for instant analysis..."
              style={{
                width: '100%', minHeight: 400, padding: 24, fontSize: 16, lineHeight: 1.6,
                fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', background: 'var(--bg-surface)',
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none',
                resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 200ms'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
            {text && (
              <button onClick={handleReset} style={{
                position: 'absolute', bottom: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', fontSize: 12, fontWeight: 700, borderRadius: 6,
                background: 'var(--bg-base)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)'
              }}>
                <RotateCcw size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Stats area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Main Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <CounterCard label="Words" value={stats.words} />
            <CounterCard label="Chars" value={stats.chars} />
            <CounterCard label="Sentences" value={stats.sentences} />
            <CounterCard label="Paragraphs" value={stats.paragraphs} />
          </div>

          {/* Detailed breakdown */}
          <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detail Stats</h3>
            <DetailRow label="Chars (no space)" value={stats.charsNoSpace} />
            <DetailRow label="Chars (with space)" value={stats.chars} />
          </div>

          {/* Time estimates */}
          <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
             <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimate Time</h3>
             <TimeRow icon={<Clock size={16} />} label="Reading Time" value={fmtTime(stats.readMin)} />
             <TimeRow icon={<MousePointer2 size={16} />} label="Speaking Time" value={fmtTime(stats.speakMin)} />
          </div>

          {/* Tip */}
          <div style={{ padding: 16, background: 'rgba(79,107,237,0.05)', border: '1px solid rgba(79,107,237,0.1)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 10 }}>
            <FileText size={16} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Average reading speed is about 200 words per minute.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CounterCard({ label, value }: any) {
  return (
    <div style={{ padding: '16px 12px', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
      <p style={{ margin: '4px 0 0', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</p>
    </div>
  );
}

function DetailRow({ label, value }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
}

function TimeRow({ icon, label, value }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ color: 'var(--brand)' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</p>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}

function fmtTime(min: number): string {
  if (min < 1) {
    const sec = Math.ceil(min * 60);
    return `${sec} sec`;
  }
  const fullMin = Math.floor(min);
  const sec = Math.ceil((min - fullMin) * 60);
  return sec > 0 ? `${fullMin}m ${sec}s` : `${fullMin} min`;
}
