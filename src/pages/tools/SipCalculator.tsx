import { useState, useMemo } from 'react';
import { LineChart, Percent, TrendingUp, IndianRupee, RotateCcw, ChevronDown, ChevronUp, Download } from 'lucide-react';

/* ════════════════════════════════════════════════
   SIP Calculator — utilBrain Finance Tool
   ════════════════════════════════════════════════ */

/* ── Helpers ── */
function fmt(n: number): string {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function fmtLakhs(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)} Cr`;
  if (n >= 100_000)    return `${(n / 100_000).toFixed(1)} Lakhs`;
  return fmt(n);
}

/* ── SIP Math ── */
interface SipResult {
  futureValue: number;
  totalInvested: number;
  wealthGain: number;
  projections: ProjectionRow[];
}

interface ProjectionRow {
  year: number;
  invested: number;
  futureValue: number;
}

function calculateSip(
  monthly: number,
  annualRate: number,
  years: number,
  adjustInflation: boolean,
  inflationRate = 6,
): SipResult {
  const effectiveRate = adjustInflation
    ? annualRate - inflationRate
    : annualRate;

  const r = effectiveRate / 12 / 100;
  const n = years * 12;

  let futureValue: number;
  if (r === 0) {
    futureValue = monthly * n;
  } else {
    futureValue = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  }

  const totalInvested = monthly * n;
  const wealthGain = futureValue - totalInvested;

  // Year-wise projections
  const projections: ProjectionRow[] = [];
  const DURATIONS = [1, 2, 3, 4, 5, 8, 10, 15, 20, 25, 30].filter(y => y <= years + 5);

  for (const y of DURATIONS) {
    const nm = y * 12;
    const rv = effectiveRate / 12 / 100;
    const fv = rv === 0
      ? monthly * nm
      : monthly * ((Math.pow(1 + rv, nm) - 1) / rv) * (1 + rv);
    projections.push({ year: y, invested: monthly * nm, futureValue: Math.round(fv) });
  }

  return {
    futureValue: Math.round(futureValue),
    totalInvested: Math.round(totalInvested),
    wealthGain: Math.round(wealthGain),
    projections,
  };
}

/* ── Donut Chart ── */
function DonutChart({ invested, gain }: { invested: number; gain: number }) {
  const total = invested + gain;
  if (total === 0) return null;
  const size = 180, stroke = 28;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const investedArc = circ * (invested / total);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        {/* Gain arc (background) */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="#e2e8f0" strokeWidth={stroke}
          strokeDasharray={`${circ - investedArc} ${circ}`}
          strokeDashoffset={-investedArc}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'all 500ms ease' }}
        />
        {/* Invested arc */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="var(--brand)" strokeWidth={stroke}
          strokeDasharray={`${investedArc} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'all 500ms ease' }}
        />
        <text x={size / 2} y={size / 2 - 8} textAnchor="middle"
          style={{ fontSize: 10, fontWeight: 600, fill: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
          Future Value
        </text>
        <text x={size / 2} y={size / 2 + 12} textAnchor="middle"
          style={{ fontSize: 15, fontWeight: 800, fill: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
          ₹{fmtLakhs(total)}
        </text>
      </svg>
      <div style={{ display: 'flex', gap: 20 }}>
        <LegendDot color="var(--brand)" label="Invested" value={`₹${fmtLakhs(invested)}`} />
        <LegendDot color="#e2e8f0" label="Gain" value={`₹${fmtLakhs(gain)}`} />
      </div>
    </div>
  );
}

function LegendDot({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
      <div>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}

/* ── Presets ── */
const PRESETS = [
  { label: 'Starter SIP',   monthly: 1000,  rate: 12, years: 10 },
  { label: 'Mid SIP',       monthly: 5000,  rate: 12, years: 15 },
  { label: 'Wealth Builder', monthly: 10000, rate: 12, years: 20 },
  { label: 'Retirement',    monthly: 20000, rate: 10, years: 30 },
];

/* ════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════ */
export function SipCalculator() {
  const [monthly, setMonthly]               = useState('10000');
  const [rate, setRate]                     = useState('12');
  const [years, setYears]                   = useState('10');
  const [adjustInflation, setAdjustInflation] = useState(false);
  const [calculated, setCalculated]         = useState(false);
  const [showAll, setShowAll]               = useState(false);

  const result = useMemo<SipResult | null>(() => {
    const m = parseFloat(monthly) || 0;
    const r = parseFloat(rate) || 0;
    const y = parseFloat(years) || 0;
    if (m <= 0 || r <= 0 || y <= 0) return null;
    return calculateSip(m, r, y, adjustInflation);
  }, [monthly, rate, years, adjustInflation]);

  function handleCalculate() { if (result) setCalculated(true); }
  function handleReset() {
    setMonthly('10000'); setRate('12'); setYears('10');
    setAdjustInflation(false); setCalculated(false); setShowAll(false);
  }
  function applyPreset(p: typeof PRESETS[0]) {
    setMonthly(p.monthly.toString());
    setRate(p.rate.toString());
    setYears(p.years.toString());
    setCalculated(false);
  }

  function downloadCsv() {
    if (!result) return;
    const rows = [
      ['Year', 'SIP Amount (₹)', 'Invested (₹)', 'Future Value (₹)'],
      ...result.projections.map(r => [r.year, fmt(+monthly), fmt(r.invested), fmt(r.futureValue)]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'sip-projection.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  const tableRows = showAll
    ? (result?.projections ?? [])
    : (result?.projections ?? []).slice(0, 6);

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: 'var(--brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0,
          }}>
            <LineChart size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
              SIP Calculator
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              Calculate returns on your Systematic Investment Plan
            </p>
          </div>
        </div>
      </div>

      {/* ── Presets ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            style={{
              padding: '6px 14px', fontSize: 12, fontWeight: 600,
              color: 'var(--text-secondary)', background: 'var(--bg-surface)',
              border: '1.5px solid var(--border)', borderRadius: 'var(--radius-full)',
              cursor: 'pointer', transition: 'all 150ms', fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Main Grid: Form + Results ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* LEFT: Inputs */}
        <div style={{
          padding: 24,
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>

          {/* Monthly investment */}
          <InputField
            label="Monthly Investment Amount (₹)"
            icon={<IndianRupee size={15} />}
            value={monthly}
            onChange={v => { setMonthly(v.replace(/\D/g, '')); setCalculated(false); }}
            placeholder="e.g. 10000"
            suffix={monthly ? <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{fmtLakhs(+monthly)}/mo</span> : undefined}
          />

          {/* Investment period */}
          <InputField
            label="Investment Period (Years)"
            icon={<TrendingUp size={15} />}
            value={years}
            onChange={v => { setYears(v); setCalculated(false); }}
            placeholder="e.g. 10"
            type="number"
            suffix={years ? <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{+years * 12} mo</span> : undefined}
          />

          {/* Expected returns */}
          <InputField
            label="Expected Annual Returns (%)"
            icon={<Percent size={15} />}
            value={rate}
            onChange={v => { setRate(v); setCalculated(false); }}
            placeholder="e.g. 12"
            type="number"
            step="0.5"
          />

          {/* Adjust for Inflation - dropdown */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Adjust for Inflation?
            </label>
            <select
              value={adjustInflation ? 'yes' : 'no'}
              onChange={e => { setAdjustInflation(e.target.value === 'yes'); setCalculated(false); }}
              style={{
                width: '100%', padding: '10px 12px',
                fontSize: 14, fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                color: 'var(--text-primary)',
                background: 'var(--bg-base)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                outline: 'none', cursor: 'pointer',
                transition: 'border-color 150ms',
                appearance: 'auto',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <option value="no">No</option>
              <option value="yes">Yes (adjust @6% inflation)</option>
            </select>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              onClick={handleCalculate}
              disabled={!result}
              style={{
                flex: 1, padding: '12px 0',
                fontSize: 14, fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                color: '#fff',
                background: result ? 'var(--brand)' : 'var(--border)',
                border: 'none', borderRadius: 'var(--radius-md)',
                cursor: result ? 'pointer' : 'not-allowed',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { if (result) e.currentTarget.style.background = 'var(--brand-dark)'; }}
              onMouseLeave={e => { if (result) e.currentTarget.style.background = 'var(--brand)'; }}
            >
              Calculate
            </button>
            <button
              onClick={handleReset}
              title="Reset"
              style={{
                width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-base)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* RIGHT: Summary + Donut */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Result Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <ResultCard
              label="Expected Amount"
              prefix="Rs."
              value={calculated && result ? fmt(result.futureValue) : '--'}
              sub={calculated && result ? fmtLakhs(result.futureValue) : undefined}
              icon={<TrendingUp size={16} />}
              highlight
            />
            <ResultCard
              label="Amount Invested"
              prefix="Rs."
              value={calculated && result ? fmt(result.totalInvested) : '--'}
              sub={calculated && result ? fmtLakhs(result.totalInvested) : undefined}
              icon={<IndianRupee size={16} />}
            />
            <ResultCard
              label="Wealth Gain"
              prefix="Rs."
              value={calculated && result ? fmt(result.wealthGain) : '--'}
              sub={calculated && result ? fmtLakhs(result.wealthGain) : undefined}
              icon={<Percent size={16} />}
              gainColor
            />
          </div>

          {/* Donut */}
          <div style={{
            padding: 24,
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flex: 1, minHeight: 240,
          }}>
            {calculated && result ? (
              <DonutChart invested={result.totalInvested} gain={result.wealthGain} />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <LineChart size={40} style={{ color: 'var(--border)', marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                  Enter details and click Calculate
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Projection Table ── */}
      {calculated && result && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}>
          {/* Table header row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px', borderBottom: '1.5px solid var(--border)',
          }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Projected SIP Returns for various durations &nbsp;
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                [ @{rate}% ]
              </span>
            </p>
            <button
              onClick={downloadCsv}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                color: 'var(--text-secondary)',
                background: 'var(--bg-base)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', transition: 'all 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <Download size={13} /> CSV
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-base)' }}>
                  {['Duration', 'SIP Amount (₹)', 'Total Invested (₹)', 'Future Value (₹)', 'Wealth Gain (₹)'].map((h, i) => (
                    <th key={h} style={{
                      padding: '10px 20px', fontSize: 11, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      color: 'var(--text-muted)', textAlign: i === 0 ? 'left' : 'right',
                      borderBottom: '1.5px solid var(--border)',
                      fontFamily: 'var(--font-sans)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => {
                  const gain = row.futureValue - row.invested;
                  const isCurrent = row.year === +years;
                  return (
                    <tr
                      key={row.year}
                      style={{
                        background: isCurrent ? 'rgba(0,194,168,0.06)' : i % 2 === 0 ? 'transparent' : 'var(--bg-base)',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                      onMouseLeave={e => e.currentTarget.style.background = isCurrent ? 'rgba(0,194,168,0.06)' : i % 2 === 0 ? 'transparent' : 'var(--bg-base)'}
                    >
                      <td style={{ padding: '11px 20px', color: isCurrent ? 'var(--brand)' : 'var(--text-primary)', fontWeight: isCurrent ? 700 : 600, fontFamily: 'var(--font-sans)', fontSize: 13 }}>
                        {row.year} {row.year === 1 ? 'year' : 'years'}
                        {isCurrent && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--brand)', fontWeight: 700, letterSpacing: '0.05em' }}>●</span>}
                      </td>
                      <td style={{ padding: '11px 20px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {fmt(+monthly)}
                      </td>
                      <td style={{ padding: '11px 20px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {fmt(row.invested)}
                      </td>
                      <td style={{ padding: '11px 20px', textAlign: 'right', color: isCurrent ? 'var(--brand)' : 'var(--text-primary)', fontWeight: 700 }}>
                        {fmtLakhs(row.futureValue)}
                      </td>
                      <td style={{ padding: '11px 20px', textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>
                        +{fmtLakhs(gain)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {result.projections.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '12px 0', fontSize: 13, fontWeight: 600,
                fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)',
                background: 'var(--bg-base)', border: 'none',
                borderTop: '1.5px solid var(--border)', cursor: 'pointer', transition: 'background 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-base)'}
            >
              {showAll ? <><span>Show Less</span><ChevronUp size={14} /></> : <><span>Show All {result.projections.length} rows</span><ChevronDown size={14} /></>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Sub-components
   ════════════════════════════════════════ */
function InputField({
  label, icon, value, onChange, placeholder, type = 'text', step, suffix,
}: {
  label: string; icon: React.ReactNode; value: string;
  onChange: (v: string) => void; placeholder: string;
  type?: string; step?: string; suffix?: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
          {icon}
        </span>
        <input
          type={type} step={step} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '10px 12px 10px 36px',
            fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-sans)',
            color: 'var(--text-primary)', background: 'var(--bg-base)',
            border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
            outline: 'none', transition: 'border-color 150ms', boxSizing: 'border-box',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
        />
        {suffix && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function ResultCard({
  label, prefix, value, sub, icon, highlight, gainColor,
}: {
  label: string; prefix?: string; value: string; sub?: string;
  icon: React.ReactNode; highlight?: boolean; gainColor?: boolean;
}) {
  return (
    <div style={{
      padding: '16px', background: 'var(--bg-surface)',
      border: `1.5px solid ${highlight ? 'var(--brand)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 'var(--radius-sm)',
        background: highlight ? 'rgba(0,194,168,0.10)' : 'var(--bg-base)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: highlight ? 'var(--brand)' : 'var(--text-muted)',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: gainColor ? '#16a34a' : highlight ? 'var(--brand)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1.2 }}>
          {prefix && value !== '--' ? <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-sans)' }}>{prefix} </span> : null}
          {value}
        </p>
        {sub && value !== '--' && (
          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
            ({sub})
          </p>
        )}
      </div>
    </div>
  );
}
