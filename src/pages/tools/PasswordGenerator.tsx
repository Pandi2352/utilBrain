import { useState, useCallback, useEffect, useMemo } from 'react';
import { ShieldCheck, Copy, Check, Eye, EyeOff, RefreshCw } from 'lucide-react';

/* ════════════════════════════════════════════════
   Password Generator — utilBrain Security Tool
   ════════════════════════════════════════════════ */

const CHARSETS = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  digits:  '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  similar: 'iIlL1oO0',
  ambiguous: `{}[]()/\\'"\`~,;.<>`,
};

interface GenOptions {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
  noSimilar: boolean;
  noAmbiguous: boolean;
}

function generatePassword(opts: GenOptions): string {
  let charset = '';
  if (opts.upper)   charset += CHARSETS.upper;
  if (opts.lower)   charset += CHARSETS.lower;
  if (opts.digits)  charset += CHARSETS.digits;
  if (opts.symbols) charset += CHARSETS.symbols;

  if (opts.noSimilar) {
    charset = charset.split('').filter(c => !CHARSETS.similar.includes(c)).join('');
  }
  if (opts.noAmbiguous) {
    charset = charset.split('').filter(c => !CHARSETS.ambiguous.includes(c)).join('');
  }
  if (!charset) charset = CHARSETS.lower + CHARSETS.digits;

  const arr = new Uint32Array(opts.length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(n => charset[n % charset.length]).join('');
}

interface Strength {
  label: string;
  score: number;   /* 0..5 */
  token: string;   /* css variable */
}

function calcStrength(pass: string): Strength {
  if (!pass) return { label: 'None', score: 0, token: 'var(--border-strong)' };
  let score = 0;
  if (pass.length >= 8)  score++;
  if (pass.length >= 12) score++;
  if (pass.length >= 16) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[a-z]/.test(pass)) score++;
  if (/\d/.test(pass))     score++;
  if (/[^A-Za-z0-9]/.test(pass)) score += 2;

  if (score <= 2) return { label: 'Very Weak',   score: 1, token: 'var(--danger)' };
  if (score <= 4) return { label: 'Weak',        score: 2, token: 'var(--warning)' };
  if (score <= 5) return { label: 'Fair',        score: 3, token: 'var(--warning)' };
  if (score <= 6) return { label: 'Strong',      score: 4, token: 'var(--success)' };
  return            { label: 'Very Strong', score: 5, token: 'var(--success)' };
}

/* ════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════ */
export function PasswordGenerator() {
  const [length,      setLength]      = useState(16);
  const [upper,       setUpper]       = useState(true);
  const [lower,       setLower]       = useState(true);
  const [digits,      setDigits]      = useState(true);
  const [symbols,     setSymbols]     = useState(true);
  const [noSimilar,   setNoSimilar]   = useState(false);
  const [noAmbiguous, setNoAmbiguous] = useState(false);
  const [showPass,    setShowPass]    = useState(true);
  const [count,       setCount]       = useState(5);
  const [copied,      setCopied]      = useState<number | null>(null);
  const [passwords,   setPasswords]   = useState<string[]>([]);

  const opts = useMemo<GenOptions>(
    () => ({ length, upper, lower, digits, symbols, noSimilar, noAmbiguous }),
    [length, upper, lower, digits, symbols, noSimilar, noAmbiguous]
  );

  const regenerate = useCallback(() => {
    setPasswords(Array.from({ length: count }, () => generatePassword(opts)));
    setCopied(null);
  }, [opts, count]);

  /* initial population + regenerate when count changes */
  useEffect(() => { regenerate(); }, [count]); // eslint-disable-line react-hooks/exhaustive-deps

  function copyOne(idx: number) {
    navigator.clipboard.writeText(passwords[idx]).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 1800);
    });
  }

  const strength = calcStrength(passwords[0] ?? '');

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-md)',
          background: 'var(--brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', flexShrink: 0,
        }}>
          <ShieldCheck size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
            Password Generator
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            Generate strong, cryptographically secure passwords
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>

        {/* ── LEFT: Settings ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Length slider */}
          <div style={{
            padding: 18,
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Length</label>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {length}
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={64}
              value={length}
              onChange={e => setLength(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--brand)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>4</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>64</span>
            </div>
          </div>

          {/* Character sets */}
          <div style={{
            padding: 16,
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Character Sets
            </p>
            <ToggleChip label="Uppercase (A–Z)" checked={upper}   onChange={setUpper} />
            <ToggleChip label="Lowercase (a–z)" checked={lower}   onChange={setLower} />
            <ToggleChip label="Digits (0–9)"    checked={digits}  onChange={setDigits} />
            <ToggleChip label="Symbols"         checked={symbols} onChange={setSymbols} desc="!@#$%^&*()_+-=" />
          </div>

          {/* Extra options */}
          <div style={{
            padding: 16,
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Exclusions
            </p>
            <ToggleChip label="Exclude Similar"   checked={noSimilar}   onChange={setNoSimilar}   desc="i, I, l, L, 1, o, O, 0" />
            <ToggleChip label="Exclude Ambiguous" checked={noAmbiguous} onChange={setNoAmbiguous} desc={"{ } [ ] ( ) / \\ ' \" , ; . < >"} />
          </div>

          {/* Batch count */}
          <div style={{
            padding: 16,
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Generate Count
            </label>
            <select
              value={count}
              onChange={e => setCount(+e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                color: 'var(--text-primary)',
                background: 'var(--bg-base)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              {[1, 3, 5, 10, 20].map(n => <option key={n} value={n}>{n} passwords</option>)}
            </select>
          </div>
        </div>

        {/* ── RIGHT: Generated passwords ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Strength + actions */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            gap: 20,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Password Strength</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: strength.token }}>{strength.label}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-base)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(strength.score / 5) * 100}%`,
                  background: strength.token,
                  borderRadius: 3,
                  transition: 'width 400ms ease, background 200ms',
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setShowPass(s => !s)}
                title={showPass ? 'Hide passwords' : 'Show passwords'}
                style={{
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg-base)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button
                onClick={regenerate}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0 16px', height: 36,
                  fontSize: 13, fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  color: '#fff',
                  background: 'var(--brand)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--brand)'}
              >
                <RefreshCw size={14} /> Regenerate
              </button>
            </div>
          </div>

          {/* Password list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {passwords.map((pass, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px',
                  background: 'var(--bg-surface)',
                  border: `1.5px solid ${copied === i ? 'var(--success)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  transition: 'border-color 200ms',
                }}
              >
                <span style={{
                  flex: 1,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  letterSpacing: 0.5,
                  filter: showPass ? 'none' : 'blur(6px)',
                  userSelect: showPass ? 'auto' : 'none',
                  transition: 'filter 200ms',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {pass}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {pass.length} chars
                </span>
                <button
                  onClick={() => copyOne(i)}
                  title="Copy password"
                  style={{
                    width: 32, height: 32, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: copied === i ? 'var(--success)' : 'var(--text-muted)',
                    background: 'var(--bg-base)',
                    border: `1.5px solid ${copied === i ? 'var(--success)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { if (copied !== i) e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                  onMouseLeave={e => { if (copied !== i) e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {copied === i ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div style={{
            padding: '14px 18px',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}>
            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
              Password Tips
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              {[
                'Use 16+ characters for sensitive accounts',
                'Never reuse passwords across services',
                'Use a password manager — don\'t memorize all of them',
                'Enable 2FA wherever possible',
              ].map(t => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════ */

function ToggleChip({
  label,
  checked,
  onChange,
  desc,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  desc?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px',
        background: 'transparent',
        border: `1.5px solid ${checked ? 'var(--brand)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 150ms',
        fontFamily: 'var(--font-sans)',
      }}
      onMouseEnter={e => { if (!checked) e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
      onMouseLeave={e => { if (!checked) e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
        background: checked ? 'var(--brand)' : 'transparent',
        border: `1.5px solid ${checked ? 'var(--brand)' : 'var(--border-strong)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 150ms',
      }}>
        {checked && <Check size={10} strokeWidth={4} color="#fff" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 12, fontWeight: 600,
          color: 'var(--text-primary)',
        }}>
          {label}
        </p>
        {desc && (
          <p style={{
            margin: 0, fontSize: 10,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {desc}
          </p>
        )}
      </div>
    </button>
  );
}
