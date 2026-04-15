import { useState } from 'react';
import { Percent, RotateCcw, ArrowRight } from 'lucide-react';

/* ════════════════════════════════════════════════
   Percentage Calculator — utilBrain Finance Tool
   ════════════════════════════════════════════════ */

type Mode =
  | 'pct-of'       // X% of Y = ?
  | 'what-pct'     // X is what % of Y?
  | 'pct-change'   // % change from X to Y
  | 'increase-by'  // Increase X by Y%
  | 'decrease-by'  // Decrease X by Y%
  | 'pct-split';   // Split amount into percentages

const MODES = [
  { id: 'pct-of',      label: '% of a Number',     desc: 'What is X% of Y?' },
  { id: 'what-pct',    label: 'What Percent?',      desc: 'X is what % of Y?' },
  { id: 'pct-change',  label: '% Change',           desc: 'Increase/decrease from X to Y' },
  { id: 'increase-by', label: 'Increase by %',      desc: 'Add X% to amount' },
  { id: 'decrease-by', label: 'Decrease by %',      desc: 'Subtract X% from amount' },
] as const;

function fmt(n: number, decimals = 2): string {
  return isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: decimals }) : '—';
}

function InputRow({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 14px',
          fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-sans)',
          color: 'var(--text-primary)', background: 'var(--bg-base)',
          border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
          outline: 'none', transition: 'border-color 150ms', boxSizing: 'border-box',
        }}
        onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
      />
    </div>
  );
}

function ResultBanner({ label, value, unit = '' }: { label: string; value: string; unit?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 20px',
      background: 'rgba(0,194,168,0.06)',
      border: '1.5px solid var(--brand)',
      borderRadius: 'var(--radius-md)',
      marginTop: 20,
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand)', fontFamily: 'var(--font-mono)' }}>
        {value}{unit}
      </span>
    </div>
  );
}

export function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>('pct-of');
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const numA = parseFloat(a) || 0;
  const numB = parseFloat(b) || 0;

  function computeResult(): { label: string; value: string; unit?: string } | null {
    if (!a || !b) return null;
    switch (mode) {
      case 'pct-of':
        return { label: `${a}% of ${b} is`, value: fmt((numA / 100) * numB) };
      case 'what-pct':
        return { label: `${a} is`, value: fmt((numA / numB) * 100), unit: '% of ' + b };
      case 'pct-change':
        const chg = ((numB - numA) / numA) * 100;
        return {
          label: `Change from ${a} to ${b}`,
          value: (chg >= 0 ? '+' : '') + fmt(chg) + '%',
        };
      case 'increase-by':
        return { label: `${a} increased by ${b}% is`, value: fmt(numA * (1 + numB / 100)) };
      case 'decrease-by':
        return { label: `${a} decreased by ${b}% is`, value: fmt(numA * (1 - numB / 100)) };
      default:
        return null;
    }
  }

  const result = computeResult();

  const labels: Record<Mode, [string, string]> = {
    'pct-of':      ['Percentage (%)', 'Number'],
    'what-pct':    ['Value (X)', 'Total (Y)'],
    'pct-change':  ['Original Value', 'New Value'],
    'increase-by': ['Original Amount', 'Percentage (%)'],
    'decrease-by': ['Original Amount', 'Percentage (%)'],
    'pct-split':   ['Amount', 'Percentage (%)'],
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0,
          }}>
            <Percent size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
              Percentage Calculator
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              Calculate percentages in 5 different modes
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>

        {/* LEFT: mode selector */}
        <div style={{
          padding: 8, background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
          display: 'flex', flexDirection: 'column', gap: 2, height: 'fit-content',
        }}>
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id as Mode); setA(''); setB(''); }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                background: mode === m.id ? 'rgba(0,194,168,0.08)' : 'transparent',
                transition: 'background 150ms',
              }}
              onMouseEnter={e => { if (mode !== m.id) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-base)'; }}
              onMouseLeave={e => { if (mode !== m.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: mode === m.id ? 'var(--brand)' : 'var(--text-primary)',
              }}>
                {m.label}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{m.desc}</span>
            </button>
          ))}
        </div>

        {/* RIGHT: inputs + result */}
        <div style={{
          padding: 24, background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          <InputRow label={labels[mode][0]} value={a} onChange={setA} placeholder="Enter value" />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>

          <InputRow label={labels[mode][1]} value={b} onChange={setB} placeholder="Enter value" />

          {result ? (
            <ResultBanner label={result.label} value={result.value} unit={result.unit} />
          ) : (
            <div style={{
              padding: '18px 20px', borderRadius: 'var(--radius-md)',
              border: '1.5px dashed var(--border)', textAlign: 'center',
              color: 'var(--text-muted)', fontSize: 13, marginTop: 4,
            }}>
              Enter both values to see result
            </div>
          )}

          <button
            onClick={() => { setA(''); setB(''); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 0', fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)',
              background: 'var(--bg-base)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <RotateCcw size={14} /> Clear
          </button>
        </div>
      </div>
    </div>
  );
}
