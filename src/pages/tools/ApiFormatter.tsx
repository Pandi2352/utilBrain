import { useState, useMemo } from 'react';
import { Webhook, Copy, Check, RotateCcw, FileJson, FileCode, Search, Terminal } from 'lucide-react';

/* ════════════════════════════════════════════════
   API Formatter — utilBrain
   ════════════════════════════════════════════════ */

type Type = 'JSON' | 'XML' | 'YAML';

export function ApiFormatter() {
  const [input, setInput] = useState('');
  const [type, setType] = useState<Type>('JSON');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input.trim()) return '';
    try {
      if (type === 'JSON') {
        const obj = JSON.parse(input);
        return JSON.stringify(obj, null, indent);
      }
      // Minimal XML/YAML placeholders for simple "pretty"
      if (type === 'XML') return input.replace(/></g, '>\n<'); 
      return input;
    } catch (e) {
      return `Error: Invalid ${type} input\n${(e as Error).message}`;
    }
  }, [input, type, indent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Webhook size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>API Response Formatter</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Beautify and inspect raw API response data instantly</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: 'calc(100vh - 200px)', minHeight: 600 }}>
        {/* Input Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12 }}>
               {(['JSON', 'XML', 'YAML'] as Type[]).map(t => (
                 <button key={t} onClick={() => setType(t)} style={{ fontSize: 11, fontWeight: 700, color: type === t ? 'var(--brand)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>{t}</button>
               ))}
            </div>
            <button onClick={() => setInput('')} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><RotateCcw size={13} /></button>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste raw response here..."
            spellCheck={false}
            style={{
              flex: 1, width: '100%', padding: 20, fontSize: 14, fontFamily: 'var(--font-mono)', border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', resize: 'none'
            }}
          />
        </div>

        {/* Output Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', background: '#1c1c1f', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
               <Terminal size={14} style={{ color: '#10b981' }} />
               <span style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.05em' }}>PRETTIFIED OUTPUT</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <select value={indent} onChange={e => setIndent(parseInt(e.target.value))} style={{
                background: '#2d2d30', color: '#eee', border: '1px solid #444', borderRadius: 4, fontSize: 10, padding: '2px 6px', outline: 'none'
              }}>
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces</option>
                 <option value={0}>Tab</option>
              </select>
              <button onClick={handleCopy} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700,
                color: '#fff', background: 'var(--brand)', border: 'none', borderRadius: 4, cursor: 'pointer'
              }}>
                {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <div style={{ 
            flex: 1, padding: 20, background: '#1c1c1f', overflow: 'auto', 
            fontFamily: 'var(--font-mono)', fontSize: 14, lineHeight: 1.6, color: '#e0e0e0' 
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {output || <span style={{ color: '#555' }}>Output will appear here...</span>}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
