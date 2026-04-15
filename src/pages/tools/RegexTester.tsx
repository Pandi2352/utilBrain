import { useState, useMemo } from 'react';
import { Regex, Copy, Check, RotateCcw, AlertCircle } from 'lucide-react';

/* ════════════════════════════════════════════════
   Regex Tester — utilBrain Dev Tool
   ════════════════════════════════════════════════ */

const FLAG_DEFS: { flag: string; label: string; desc: string }[] = [
  { flag: 'g', label: 'Global',     desc: 'Find all matches' },
  { flag: 'i', label: 'Ignore case',desc: 'Case insensitive' },
  { flag: 'm', label: 'Multiline',  desc: '^ $ per line' },
  { flag: 's', label: 'Dotall',     desc: '. matches newline' },
];

const PRESETS = [
  { label: 'Email',       pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: 'gi' },
  { label: 'URL',         pattern: 'https?:\\/\\/[^\\s/$.?#].[^\\s]*', flags: 'gi' },
  { label: 'Indian Phone',pattern: '(?:\\+91|0)?[6-9]\\d{9}', flags: 'g' },
  { label: 'IP Address',  pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
  { label: 'Hex Color',   pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'gi' },
  { label: 'Date (DD/MM)',pattern: '\\b(0?[1-9]|[12]\\d|3[01])/(0?[1-9]|1[0-2])/\\d{4}\\b', flags: 'g' },
];

const DEFAULT_TEXT = `Contact us at support@utilibrain.app or visit https://utilibrain.app
Phone: +91-9876543210 or 9123456789
Our servers: 192.168.1.1 and 10.0.0.255
Colors: #fff, #1a2b3c, #rgb
Date: 15/04/2025 and 01/12/2024`;

type MatchInfo = { index: number; end: number; value: string; groups: Record<string, string> };

function getMatches(text: string, pattern: string, flags: string): MatchInfo[] | string {
  try {
    const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    const results: MatchInfo[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      results.push({
        index: m.index,
        end:   m.index + m[0].length,
        value: m[0],
        groups: m.groups ?? {},
      });
      if (!flags.includes('g') && results.length === 1) break;
    }
    return results;
  } catch (e) {
    return (e as Error).message;
  }
}

/* Highlighted text renderer */
function HighlightedText({ text, matches }: { text: string; matches: MatchInfo[] }) {
  if (matches.length === 0) return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{text}</span>;

  const parts: React.ReactNode[] = [];
  let last = 0;
  matches.forEach((m, i) => {
  if (m.index > last) parts.push(<span key={`t${i}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8, color: 'var(--text-primary)' }}>{text.slice(last, m.index)}</span>);
    parts.push(
      <mark key={`m${i}`} title={`Match ${i + 1}: "${m.value}"`} style={{
        background: 'rgba(0,194,168,0.25)', color: 'var(--text-primary)',
        borderBottom: '2px solid var(--brand)', borderRadius: 2,
        fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8,
        padding: '0 1px',
      }}>
        {m.value}
      </mark>
    );
    last = m.end;
  });
  if (last < text.length) parts.push(<span key="tail" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8, color: 'var(--text-primary)' }}>{text.slice(last)}</span>);
  return <div style={{ whiteSpace: 'pre-wrap' }}>{parts}</div>;
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1800); }); }}
      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)', color: ok ? '#16a34a' : 'var(--text-muted)', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 150ms' }}>
      {ok ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

export function RegexTester() {
  const [pattern,  setPattern]  = useState('[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}');
  const [flags,    setFlags]    = useState('gi');
  const [testText, setTestText] = useState(DEFAULT_TEXT);
  const [replace,  setReplace]  = useState('');
  const [showReplace, setShowReplace] = useState(false);

  const matchResult = useMemo(() => {
    if (!pattern) return [];
    return getMatches(testText, pattern, flags);
  }, [pattern, flags, testText]);

  const isError   = typeof matchResult === 'string';
  const matches   = isError ? [] : matchResult;
  const matchCount = matches.length;

  const replaceResult = useMemo(() => {
    if (!showReplace || !pattern || isError) return '';
    try {
      return testText.replace(new RegExp(pattern, flags), replace);
    } catch { return ''; }
  }, [showReplace, pattern, flags, testText, replace, isError]);

  function toggleFlag(f: string) {
    setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f);
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setPattern(p.pattern);
    setFlags(p.flags);
  }

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
          <Regex size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Regex Tester</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Test regular expressions with live highlighting and match details</p>
        </div>
      </div>

      {/* Presets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => applyPreset(p)}
            style={{
              padding: '5px 12px', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)',
              color: 'var(--text-secondary)', background: 'var(--bg-surface)',
              border: '1.5px solid var(--border)', borderRadius: 'var(--radius-full)',
              cursor: 'pointer', transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Pattern + flags row */}
      <div style={{ marginBottom: 16, background: 'var(--bg-surface)', border: `1.5px solid ${isError ? '#dc2626' : pattern ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', overflow: 'hidden', transition: 'border-color 200ms' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Slash prefix */}
          <span style={{ padding: '0 14px', fontSize: 20, fontWeight: 300, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderRight: '1px solid var(--border)', lineHeight: '44px' }}>/</span>
          <input
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="Enter pattern…"
            spellCheck={false}
            style={{
              flex: 1, padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-mono)',
              color: isError ? '#dc2626' : 'var(--text-primary)',
              background: 'transparent', border: 'none', outline: 'none',
            }}
          />
          {/* Slash suffix + flags */}
          <span style={{ padding: '0 8px 0 0', fontSize: 20, fontWeight: 300, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: '44px' }}>/</span>
          <span style={{ padding: '0 14px 0 4px', fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--brand)', lineHeight: '44px', letterSpacing: 1 }}>{flags || ' '}</span>
          <div style={{ display: 'flex', gap: 4, paddingRight: 12, borderLeft: '1px solid var(--border)', paddingLeft: 12 }}>
            {FLAG_DEFS.map(f => (
              <button key={f.flag} onClick={() => toggleFlag(f.flag)} title={`${f.label}: ${f.desc}`}
                style={{
                  width: 28, height: 28, fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  border: '1.5px solid var(--border)', borderRadius: 4, cursor: 'pointer', transition: 'all 150ms',
                  background: flags.includes(f.flag) ? 'var(--brand)' : 'var(--bg-base)',
                  color: flags.includes(f.flag) ? '#fff' : 'var(--text-muted)',
                }}
              >
                {f.flag}
              </button>
            ))}
          </div>
          {pattern && <button onClick={() => { setPattern(''); setFlags('g'); }}
            style={{ marginRight: 12, padding: '4px 8px', fontSize: 11, color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            <RotateCcw size={11} />
          </button>}
        </div>
        {isError && (
          <div style={{ padding: '6px 14px', background: 'rgba(220,38,38,0.06)', borderTop: '1px solid #dc262620', fontSize: 11, color: '#dc2626', fontFamily: 'var(--font-mono)', display: 'flex', gap: 6, alignItems: 'center' }}>
            <AlertCircle size={11} /> {matchResult}
          </div>
        )}
      </div>

      {/* Match count bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 4,
            background: matchCount > 0 ? 'rgba(0,194,168,0.10)' : 'var(--bg-surface)',
            color: matchCount > 0 ? 'var(--brand)' : 'var(--text-muted)',
            border: `1px solid ${matchCount > 0 ? 'var(--brand)' : 'var(--border)'}`,
          }}>
            {matchCount} {matchCount === 1 ? 'match' : 'matches'}
          </span>
          {FLAG_DEFS.filter(f => flags.includes(f.flag)).map(f => (
            <span key={f.flag} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 7px', fontWeight: 600 }}>{f.label}</span>
          ))}
        </div>
        <button onClick={() => setShowReplace(r => !r)}
          style={{ fontSize: 12, fontWeight: 600, color: showReplace ? 'var(--brand)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
          {showReplace ? '▾' : '▸'} Replace
        </button>
      </div>

      {/* Replace bar */}
      {showReplace && (
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input value={replace} onChange={e => setReplace(e.target.value)} placeholder="Replace with…"
            style={{
              flex: 1, padding: '9px 14px', fontSize: 13, fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)', background: 'var(--bg-surface)',
              border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color 150ms',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          />
          {replaceResult && <CopyBtn text={replaceResult} />}
        </div>
      )}

      {/* Main two-panel layout */}
      <div style={{ display: 'grid', gridTemplateColumns: showReplace ? '1fr 1fr' : '1fr', gap: 16, minHeight: 320 }}>
        {/* Test string / highlighted */}
        <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>TEST STRING</span>
            <button onClick={() => setTestText('')}
              style={{ fontSize: 11, color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Clear</button>
          </div>
          {/* Overlay: textarea for input, highlighted div for rendering */}
          <div style={{ position: 'relative', minHeight: 280, background: 'var(--bg-surface)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 16px', minHeight: 280, pointerEvents: 'none', zIndex: 1 }}>
              <HighlightedText text={testText} matches={matches} />
            </div>
            <textarea
              value={testText}
              onChange={e => setTestText(e.target.value)}
              spellCheck={false}
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, width: '100%', minHeight: 280, padding: '14px 16px',
                fontSize: 13, fontFamily: 'var(--font-mono)', lineHeight: 1.8,
                color: 'transparent', caretColor: 'var(--text-primary)',
                background: 'transparent', border: 'none', outline: 'none',
                resize: 'vertical', boxSizing: 'border-box', zIndex: 2,
              }}
            />
          </div>
        </div>

        {/* Replace result */}
        {showReplace && (
          <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>REPLACE RESULT</span>
              {replaceResult && <CopyBtn text={replaceResult} />}
            </div>
            <div style={{ padding: '14px 16px', minHeight: 280, background: 'var(--bg-surface)', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', overflowY: 'auto' }}>
              {replaceResult || <span style={{ color: 'var(--text-muted)' }}>Enter replace text above…</span>}
            </div>
          </div>
        )}
      </div>

      {/* Match list */}
      {matches.length > 0 && (
        <div style={{ marginTop: 16, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>MATCH DETAILS</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-base)' }}>
                  {['#', 'Match', 'Index', 'Length'].map((h, i) => (
                    <th key={h} style={{ padding: '8px 16px', textAlign: i === 0 ? 'center' : 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-sans)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matches.slice(0, 20).map((m, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-base)' }}>
                    <td style={{ padding: '8px 16px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>{i + 1}</td>
                    <td style={{ padding: '8px 16px', color: 'var(--brand)', fontWeight: 600 }}>{m.value}</td>
                    <td style={{ padding: '8px 16px', color: 'var(--text-muted)' }}>{m.index}</td>
                    <td style={{ padding: '8px 16px', color: 'var(--text-muted)' }}>{m.value.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {matches.length > 20 && <p style={{ margin: 0, padding: '8px 16px', fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>… and {matches.length - 20} more matches</p>}
          </div>
        </div>
      )}
    </div>
  );
}
