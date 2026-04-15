import { useState } from 'react';
import { Binary, Copy, Check, RotateCcw, ArrowUpDown, FileText } from 'lucide-react';

/* ════════════════════════════════════════════════
   Base64 Encoder / Decoder — utilBrain Dev Tool
   ════════════════════════════════════════════════ */

type Mode = 'encode' | 'decode';
type InputType = 'text' | 'url';

function encodeBase64(str: string, urlSafe: boolean): string {
  try {
    const b64 = btoa(unescape(encodeURIComponent(str)));
    return urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '') : b64;
  } catch { return 'Error: Invalid input'; }
}

function decodeBase64(str: string): string {
  try {
    // normalize URL-safe variant
    const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '=='.slice(0, (4 - normalized.length % 4) % 4);
    return decodeURIComponent(escape(atob(padded)));
  } catch { return 'Error: Invalid Base64 input'; }
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }); }}
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

const SAMPLES = {
  text: 'Hello, utilBrain! 👋',
  url:  'https://utilibrain.app/tools/base64?q=hello world',
};

export function Base64Tool() {
  const [mode,      setMode]      = useState<Mode>('encode');
  const [inputType, ] = useState<InputType>('text');
  const [urlSafe,   setUrlSafe]   = useState(false);
  const [input,     setInput]     = useState(SAMPLES.text);

  const output = input.length === 0
    ? ''
    : mode === 'encode'
      ? encodeBase64(input, urlSafe)
      : decodeBase64(input);

  const isError = output.startsWith('Error:');

  function swap() {
    const current = output;
    setMode(m => m === 'encode' ? 'decode' : 'encode');
    setInput(current.startsWith('Error:') ? '' : current);
  }

  function loadSample() {
    setInput(mode === 'encode' ? SAMPLES[inputType] : encodeBase64(SAMPLES.text, false));
  }

  const stats = !isError && output ? {
    inBytes:  new TextEncoder().encode(input).length,
    outBytes: new TextEncoder().encode(output).length,
    ratio:    ((new TextEncoder().encode(output).length / (new TextEncoder().encode(input).length || 1)) * 100).toFixed(0),
  } : null;

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
            <Binary size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Base64 Encoder / Decoder</h1>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Encode / decode text, URLs and data in Base64</p>
          </div>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {(['encode', 'decode'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setInput(''); }}
                style={{
                  padding: '7px 22px', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-sans)',
                  border: 'none', cursor: 'pointer', textTransform: 'capitalize',
                  background: mode === m ? 'var(--brand)' : 'var(--bg-surface)',
                  color: mode === m ? '#fff' : 'var(--text-muted)', transition: 'all 150ms',
                }}>{m}</button>
            ))}
          </div>

          {/* URL-safe toggle */}
          {mode === 'encode' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={urlSafe} onChange={e => setUrlSafe(e.target.checked)}
                style={{ accentColor: 'var(--brand)', width: 14, height: 14 }} />
              URL-safe (no + / =)
            </label>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={loadSample}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)',
                color: 'var(--text-secondary)', background: 'var(--bg-surface)',
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', transition: 'all 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <FileText size={12} /> Sample
            </button>
            <button onClick={swap}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)',
                color: 'var(--brand)', background: 'rgba(0,194,168,0.08)',
                border: '1.5px solid var(--brand)', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', transition: 'all 150ms',
              }}
            >
              <ArrowUpDown size={12} /> Swap
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div style={{ display: 'flex', gap: 20, marginBottom: 16, padding: '8px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Input: <strong style={{ color: 'var(--text-primary)' }}>{stats.inBytes} bytes</strong></span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Output: <strong style={{ color: 'var(--text-primary)' }}>{stats.outBytes} bytes</strong></span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Size ratio: <strong style={{ color: 'var(--brand)' }}>{stats.ratio}%</strong></span>
        </div>
      )}

      {/* Editor panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 400 }}>

        {/* Input */}
        <div style={{ display: 'flex', flexDirection: 'column', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
              {mode === 'encode' ? 'PLAIN TEXT INPUT' : 'BASE64 INPUT'}
            </span>
            <button onClick={() => setInput('')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)', color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer' }}>
              <RotateCcw size={10} /> Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Type or paste text to encode…' : 'Paste Base64 string to decode…'}
            spellCheck={false}
            style={{
              flex: 1, padding: '14px 16px', minHeight: 300,
              fontSize: 13, fontFamily: mode === 'decode' ? 'var(--font-mono)' : 'var(--font-sans)',
              lineHeight: 1.8, color: 'var(--text-primary)', background: 'var(--bg-surface)',
              border: 'none', outline: 'none', resize: 'none',
            }}
          />
        </div>

        {/* Output */}
        <div style={{ display: 'flex', flexDirection: 'column', border: `1.5px solid ${isError ? '#dc2626' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: isError ? '#dc2626' : 'var(--text-secondary)' }}>
              {mode === 'encode' ? 'BASE64 OUTPUT' : 'DECODED OUTPUT'}
            </span>
            {output && !isError && <CopyBtn text={output} />}
          </div>
          <div
            style={{
              flex: 1, padding: '14px 16px', minHeight: 300,
              fontSize: 13,
              fontFamily: mode === 'encode' ? 'var(--font-mono)' : 'var(--font-sans)',
              lineHeight: 1.8, color: isError ? '#dc2626' : 'var(--text-primary)',
              background: 'var(--bg-surface)', overflowY: 'auto',
              wordBreak: 'break-all', whiteSpace: 'pre-wrap',
            }}
          >
            {output || <span style={{ color: 'var(--text-muted)' }}>Output will appear here…</span>}
          </div>
        </div>
      </div>

      {/* Info tips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 20 }}>
        {[
          { title: 'What is Base64?', body: 'Binary-to-text encoding using 64 printable ASCII characters. Common for embedding binary data in text.' },
          { title: 'URL-safe Base64', body: 'Replaces + with -, / with _, and omits = padding. Safe for URLs and filenames.' },
          { title: 'Common Use Cases', body: 'Email attachments (MIME), JWT tokens, data URIs, API keys, cookie values.' },
        ].map(tip => (
          <div key={tip.title} style={{ padding: '14px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{tip.title}</p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>{tip.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
