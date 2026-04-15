import { useState } from 'react';
import { KeyRound, Copy, Check, AlertTriangle, CheckCircle } from 'lucide-react';

/* ════════════════════════════════════════════════
   JWT Decoder — utilBrain Dev Tool
   ════════════════════════════════════════════════ */

interface JwtPayload {
  [key: string]: unknown;
  exp?: number;
  iat?: number;
  nbf?: number;
  sub?: string;
  iss?: string;
  aud?: string | string[];
}

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - str.length % 4) % 4);
  return decodeURIComponent(escape(atob(padded)));
}

function parseJwt(token: string): { header: object; payload: JwtPayload; signature: string } | null {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;
    return {
      header:    JSON.parse(base64UrlDecode(parts[0])),
      payload:   JSON.parse(base64UrlDecode(parts[1])),
      signature: parts[2],
    };
  } catch { return null; }
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' });
}

function isExpired(exp?: number): boolean {
  return exp !== undefined && Date.now() / 1000 > exp;
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1800); }); }}
      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)', color: ok ? '#16a34a' : 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', transition: 'all 150ms' }}>
      {ok ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

function JsonView({ data }: { data: object }) {
  return (
    <pre style={{ margin: 0, fontSize: 12, fontFamily: 'var(--font-mono)', lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {JSON.stringify(data, null, 2)
        .split('\n')
        .map((line, i) => <div key={i}>{colorLine(line)}</div>)}
    </pre>
  );
}

function colorLine(line: string): React.ReactNode {
  const keyMatch = line.match(/^(\s*)"([^"]+)"(\s*:\s*)(.*)/);
  if (!keyMatch) return line;
  const [, sp, key, colon, rest] = keyMatch;
  const valColor = rest.startsWith('"') ? '#16a34a' : /^(true|false)$/.test(rest.replace(/,$/, '')) ? '#f59e0b' : /^null/.test(rest) ? '#ef4444' : '#3b82f6';
  return <><span>{sp}</span><span style={{ color: '#7c3aed' }}>"{key}"</span><span style={{ color: 'var(--text-muted)' }}>{colon}</span><span style={{ color: valColor }}>{rest}</span></>;
}

const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTcxMzE4NDAwMCwiZXhwIjoyMDI4NzI0MDAwLCJyb2xlIjoiYWRtaW4iLCJpc3MiOiJ1dGlsYnJhaW4uYXBwIn0.signature_placeholder';

export function JwtDecoder() {
  const [token, setToken] = useState('');

  const decoded = token.trim().length > 10 ? parseJwt(token.trim()) : null;
  const isValid  = decoded !== null;
  const expired  = isValid && isExpired(decoded.payload.exp);

  const parts = token.trim().split('.');
  const coloredToken = isValid ? (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, wordBreak: 'break-all', lineHeight: 2 }}>
      <span style={{ color: '#ef4444' }}>{parts[0]}</span>
      <span style={{ color: 'var(--text-muted)' }}>.</span>
      <span style={{ color: '#7c3aed' }}>{parts[1]}</span>
      <span style={{ color: 'var(--text-muted)' }}>.</span>
      <span style={{ color: '#3b82f6' }}>{parts[2]}</span>
    </span>
  ) : null;

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
            <KeyRound size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>JWT Decoder</h1>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Decode and inspect JWT tokens — header, payload, expiry</p>
          </div>
        </div>
      </div>

      {/* Token input */}
      <div style={{ marginBottom: 20, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>JWT TOKEN</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {token && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700,
                color: isValid ? (expired ? '#f59e0b' : '#16a34a') : '#dc2626',
                padding: '3px 10px', borderRadius: 4,
                background: isValid ? (expired ? 'rgba(245,158,11,0.10)' : 'rgba(22,163,74,0.10)') : 'rgba(220,38,38,0.10)',
              }}>
                {isValid ? (expired ? <AlertTriangle size={11} /> : <CheckCircle size={11} />) : '✕'}
                {isValid ? (expired ? 'Expired' : 'Valid structure') : 'Invalid JWT'}
              </span>
            )}
            <button onClick={() => setToken(SAMPLE_JWT)}
              style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)', color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer' }}>
              Sample
            </button>
            {token && <button onClick={() => setToken('')}
              style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)', color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer' }}>
              Clear
            </button>}
          </div>
        </div>
        <textarea
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="Paste your JWT token here (eyJ...)"
          spellCheck={false}
          style={{
            width: '100%', display: 'block', padding: '14px 16px', minHeight: 90,
            fontSize: 13, fontFamily: 'var(--font-mono)', lineHeight: 1.8,
            color: 'var(--text-primary)', background: 'var(--bg-surface)',
            border: 'none', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Colored token parts */}
      {isValid && (
        <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            {[['Header', '#ef4444'], ['Payload', '#7c3aed'], ['Signature', '#3b82f6']].map(([label, color]) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: color as string }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color as string, flexShrink: 0 }} />{label}
              </span>
            ))}
          </div>
          {coloredToken}
        </div>
      )}

      {/* Decoded panels */}
      {decoded && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

          {/* Header */}
          <div style={{ border: '1.5px solid #ef444440', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(239,68,68,0.05)', borderBottom: '1px solid #ef444430' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>HEADER</span>
              <CopyBtn text={JSON.stringify(decoded.header, null, 2)} />
            </div>
            <div style={{ padding: '14px 16px', background: 'var(--bg-surface)' }}>
              <JsonView data={decoded.header} />
            </div>
          </div>

          {/* Payload */}
          <div style={{ border: '1.5px solid #7c3aed40', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(124,58,237,0.05)', borderBottom: '1px solid #7c3aed30' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>PAYLOAD</span>
              <CopyBtn text={JSON.stringify(decoded.payload, null, 2)} />
            </div>
            <div style={{ padding: '14px 16px', background: 'var(--bg-surface)' }}>
              <JsonView data={decoded.payload} />
            </div>
          </div>
        </div>
      )}

      {/* Claim summary */}
      {decoded?.payload && (
        <div style={{ padding: '18px 20px', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Claim Summary</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {[
              { key: 'sub',  label: 'Subject',    val: decoded.payload.sub },
              { key: 'iss',  label: 'Issuer',     val: decoded.payload.iss },
              { key: 'iat',  label: 'Issued At',  val: decoded.payload.iat  ? formatDate(decoded.payload.iat)  : undefined },
              { key: 'exp',  label: 'Expires At', val: decoded.payload.exp  ? formatDate(decoded.payload.exp)  : undefined, warn: expired },
              { key: 'nbf',  label: 'Not Before', val: decoded.payload.nbf  ? formatDate(decoded.payload.nbf)  : undefined },
            ].filter(c => c.val !== undefined).map(claim => (
              <div key={claim.key} style={{ padding: '10px 12px', background: claim.warn ? 'rgba(245,158,11,0.08)' : 'var(--bg-base)', border: `1px solid ${claim.warn ? '#f59e0b50' : 'var(--border)'}`, borderRadius: 6 }}>
                <p style={{ margin: '0 0 3px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{claim.label}</p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: claim.warn ? '#f59e0b' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{String(claim.val)}</p>
              </div>
            ))}
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            ⚠️ This tool decodes the token client-side. Signature verification requires the secret key — never paste production secrets here.
          </p>
        </div>
      )}
    </div>
  );
}
