import { useState, useCallback } from 'react';
import { Braces, Copy, Check, Trash2, AlignLeft, Minimize2, Download } from 'lucide-react';

/* ════════════════════════════════════════════════
   JSON Formatter / Validator — utilBrain Dev Tool
   ════════════════════════════════════════════════ */

type ViewMode = 'pretty' | 'minify' | 'tree';

function tryParse(raw: string): { ok: true; data: unknown } | { ok: false; error: string } {
  try { return { ok: true, data: JSON.parse(raw) }; }
  catch (e) { return { ok: false, error: (e as SyntaxError).message }; }
}

function prettyPrint(data: unknown, indent = 2): string {
  return JSON.stringify(data, null, indent);
}

/* ── Tree node renderer ── */
function TreeNode({ keyName, value, depth = 0 }: { keyName?: string; value: unknown; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const indent = depth * 18;
  const isObj  = value !== null && typeof value === 'object';
  const isArr  = Array.isArray(value);
  const keys   = isObj ? Object.keys(value as object) : [];
  const count  = keys.length;

  const typeColor = (v: unknown): string => {
    if (v === null) return '#ef4444';
    switch (typeof v) {
      case 'string':  return '#16a34a';
      case 'number':  return '#3b82f6';
      case 'boolean': return '#f59e0b';
      default:        return 'var(--text-primary)';
    }
  };

  const displayValue = (v: unknown): string => {
    if (v === null) return 'null';
    if (typeof v === 'string') return `"${v}"`;
    return String(v);
  };

  if (!isObj) {
    return (
      <div style={{ paddingLeft: indent, lineHeight: '1.8', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
        {keyName !== undefined && <span style={{ color: '#7c3aed' }}>"{keyName}"</span>}
        {keyName !== undefined && <span style={{ color: 'var(--text-muted)' }}>: </span>}
        <span style={{ color: typeColor(value) }}>{displayValue(value)}</span>
      </div>
    );
  }

  return (
    <div style={{ paddingLeft: indent, lineHeight: '1.8' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-mono)', userSelect: 'none' }}
      >
        <span style={{ color: 'var(--text-muted)', fontSize: 10, width: 12 }}>{open ? '▾' : '▸'}</span>
        {keyName !== undefined && <><span style={{ color: '#7c3aed' }}>"{keyName}"</span><span style={{ color: 'var(--text-muted)' }}>: </span></>}
        <span style={{ color: 'var(--text-muted)' }}>{isArr ? '[' : '{'}</span>
        {!open && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}> {count} {isArr ? 'items' : 'keys'} </span>}
        {!open && <span style={{ color: 'var(--text-muted)' }}>{isArr ? ']' : '}'}</span>}
      </div>
      {open && (
        <>
          {keys.map(k => (
            <TreeNode key={k} keyName={k} value={(value as Record<string, unknown>)[k]} depth={depth + 1} />
          ))}
          <div style={{ paddingLeft: 12, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {isArr ? ']' : '}'}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Line-numbered pretty print ── */
function CodeBlock({ code }: { code: string }) {
  const lines = code.split('\n');
  return (
    <div style={{ display: 'flex', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: '1.8', overflowX: 'auto' }}>
      {/* Line numbers */}
      <div style={{ flexShrink: 0, paddingRight: 16, textAlign: 'right', color: 'var(--text-muted)', userSelect: 'none', borderRight: '1px solid var(--border)', marginRight: 16, minWidth: 36 }}>
        {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      {/* Code */}
      <div style={{ flex: 1 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ whiteSpace: 'pre' }}>
            {colorizeJsonLine(line)}
          </div>
        ))}
      </div>
    </div>
  );
}

function colorizeJsonLine(line: string): React.ReactNode {
  // Simple colorizer: strings green, numbers blue, booleans/null amber/red, keys purple
  const parts: React.ReactNode[] = [];
  const regex = /("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|(true|false)|(null)|(-?\d+\.?\d*(?:[eE][+-]?\d+)?)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;

  while ((m = regex.exec(line)) !== null) {
    if (m.index > last) parts.push(<span key={idx++}>{line.slice(last, m.index)}</span>);
    if (m[1]) parts.push(<span key={idx++} style={{ color: '#7c3aed' }}>{m[1]}</span>, <span key={idx++} style={{ color: 'var(--text-muted)' }}>:</span>);
    else if (m[2]) parts.push(<span key={idx++} style={{ color: '#16a34a' }}>{m[2]}</span>);
    else if (m[3]) parts.push(<span key={idx++} style={{ color: '#f59e0b' }}>{m[3]}</span>);
    else if (m[4]) parts.push(<span key={idx++} style={{ color: '#ef4444' }}>{m[4]}</span>);
    else if (m[5]) parts.push(<span key={idx++} style={{ color: '#3b82f6' }}>{m[5]}</span>);
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push(<span key={idx++}>{line.slice(last)}</span>);
  return parts.length ? parts : line;
}

/* ── Copy button ── */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  }
  return (
    <button onClick={handleCopy}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
        fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)',
        color: copied ? '#16a34a' : 'var(--text-secondary)',
        background: 'var(--bg-base)', border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 150ms',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

const SAMPLE = `{
  "name": "utilBrain",
  "version": "1.0.0",
  "tools": ["EMI", "GST", "SIP", "JSON"],
  "ai": true,
  "meta": {
    "author": "utilBrain Team",
    "license": "MIT"
  }
}`;

export function JsonFormatter() {
  const [input, setInput]   = useState(SAMPLE);
  const [viewMode, setViewMode] = useState<ViewMode>('pretty');
  const [indent, setIndent]     = useState<2 | 4>(2);

  const parsed = useCallback(() => tryParse(input), [input])();
  const isValid = parsed.ok;

  const outputText = isValid
    ? (viewMode === 'minify' ? JSON.stringify(parsed.data) : prettyPrint(parsed.data, indent))
    : '';

  function handleDownload() {
    const blob = new Blob([outputText], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'formatted.json'; a.click();
    URL.revokeObjectURL(url);
  }

  const stats = isValid && parsed.data && typeof parsed.data === 'object' ? {
    keys:  Object.keys(parsed.data as object).length,
    chars: JSON.stringify(parsed.data).length,
    lines: prettyPrint(parsed.data, 2).split('\n').length,
  } : null;

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
            <Braces size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>JSON Formatter</h1>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Format, validate and explore JSON data</p>
          </div>
        </div>

        {/* Status + stats bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700,
            background: isValid ? 'rgba(22,163,74,0.10)' : 'rgba(220,38,38,0.10)',
            color: isValid ? '#16a34a' : '#dc2626',
            border: `1px solid ${isValid ? '#16a34a40' : '#dc262640'}`,
          }}>
            {isValid ? <Check size={11} /> : '✕'} {isValid ? 'Valid JSON' : 'Invalid JSON'}
          </span>
          {stats && (
            <>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{stats.keys} top-level keys</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{stats.chars} chars</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{stats.lines} lines</span>
            </>
          )}
        </div>
      </div>

      {/* Main: editor + output side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 520 }}>

        {/* Input panel */}
        <div style={{ display: 'flex', flexDirection: 'column', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>INPUT</span>
            <button onClick={() => setInput('')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)', color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <Trash2 size={11} /> Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            spellCheck={false}
            style={{
              flex: 1, padding: '14px 16px',
              fontSize: 13, fontFamily: 'var(--font-mono)', lineHeight: 1.8,
              color: 'var(--text-primary)', background: 'var(--bg-surface)',
              border: 'none', outline: 'none', resize: 'none',
              borderLeft: `3px solid ${isValid ? '#16a34a' : input.length ? '#dc2626' : 'var(--border)'}`,
              transition: 'border-color 200ms',
            }}
          />
          {!isValid && input.length > 0 && (
            <div style={{ padding: '8px 16px', background: 'rgba(220,38,38,0.06)', borderTop: '1px solid #dc262620', fontSize: 11, color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
              ✕ {(parsed as { ok: false; error: string }).error}
            </div>
          )}
        </div>

        {/* Output panel */}
        <div style={{ display: 'flex', flexDirection: 'column', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 8 }}>
            {/* View mode */}
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
              {(['pretty', 'minify', 'tree'] as ViewMode[]).map(m => (
                <button key={m} onClick={() => setViewMode(m)}
                  style={{
                    padding: '4px 12px', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)',
                    border: 'none', cursor: 'pointer',
                    background: viewMode === m ? 'var(--brand)' : 'transparent',
                    color: viewMode === m ? '#fff' : 'var(--text-muted)',
                    transition: 'all 150ms', textTransform: 'capitalize',
                  }}
                >
                  {m === 'pretty' ? <><AlignLeft size={11} style={{ display: 'inline', marginRight: 4 }} />Pretty</> : m === 'minify' ? <><Minimize2 size={11} style={{ display: 'inline', marginRight: 4 }} />Minify</> : '🌲 Tree'}
                </button>
              ))}
            </div>

            {/* Indent + actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {viewMode === 'pretty' && (
                <select value={indent} onChange={e => setIndent(+e.target.value as 2 | 4)}
                  style={{ padding: '4px 8px', fontSize: 11, fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', outline: 'none' }}>
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                </select>
              )}
              {isValid && outputText && <CopyBtn text={outputText} />}
              {isValid && outputText && (
                <button onClick={handleDownload}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 150ms' }}>
                  <Download size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Output content */}
          <div style={{ flex: 1, padding: '14px 16px', background: 'var(--bg-surface)', overflowY: 'auto', overflowX: 'auto' }}>
            {!isValid ? (
              <div style={{ textAlign: 'center', paddingTop: 60 }}>
                <Braces size={36} style={{ color: 'var(--border)', marginBottom: 10 }} />
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Fix JSON errors to see output</p>
              </div>
            ) : viewMode === 'tree' ? (
              <TreeNode value={parsed.data} />
            ) : (
              <CodeBlock code={outputText} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
