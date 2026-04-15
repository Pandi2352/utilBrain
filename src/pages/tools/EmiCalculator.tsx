import { useState, useMemo } from 'react';
import { IndianRupee, Calendar, Percent, TrendingUp, PieChart, Table, RotateCcw, ChevronDown, ChevronUp, Download } from 'lucide-react';

/* ════════════════════════════════════════════════
   EMI Calculator — utilBrain MVP Tool #1
   ════════════════════════════════════════════════ */

/* ── Types ── */
interface EmiResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  schedule: AmortizationRow[];
}

interface AmortizationRow {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

/* ── EMI Calculation ── */
function calculateEmi(principal: number, annualRate: number, tenureMonths: number): EmiResult {
  const r = annualRate / 12 / 100;
  let emi: number;

  if (r === 0) {
    emi = principal / tenureMonths;
  } else {
    const factor = Math.pow(1 + r, tenureMonths);
    emi = (principal * r * factor) / (factor - 1);
  }

  const schedule: AmortizationRow[] = [];
  let balance = principal;

  for (let m = 1; m <= tenureMonths; m++) {
    const interest = balance * r;
    const principalPart = emi - interest;
    balance = Math.max(balance - principalPart, 0);
    schedule.push({
      month: m,
      emi: Math.round(emi),
      principal: Math.round(principalPart),
      interest: Math.round(interest),
      balance: Math.round(balance),
    });
  }

  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    schedule,
  };
}

/* ── Format currency ── */
function fmt(n: number): string {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/* ── Donut Chart (SVG) ── */
function DonutChart({ principal, interest }: { principal: number; interest: number }) {
  const total = principal + interest;
  if (total === 0) return null;

  const principalPct = principal / total;
  const size = 180;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const principalArc = circumference * principalPct;
  const interestArc = circumference - principalArc;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Interest arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
          strokeDasharray={`${interestArc} ${circumference}`}
          strokeDashoffset={-principalArc}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'all 500ms ease' }}
        />
        {/* Principal arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={stroke}
          strokeDasharray={`${principalArc} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'all 500ms ease' }}
        />
        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2 - 8}
          textAnchor="middle"
          style={{ fontSize: 11, fontWeight: 600, fill: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
        >
          Total Payment
        </text>
        <text
          x={size / 2}
          y={size / 2 + 12}
          textAnchor="middle"
          style={{ fontSize: 16, fontWeight: 800, fill: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
        >
          {fmt(total)}
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20 }}>
        <LegendDot color="var(--brand)" label="Principal" value={fmt(principal)} />
        <LegendDot color="var(--border-strong)" label="Interest" value={fmt(interest)} />
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

/* ── Yearly Breakdown Bar ── */
function YearlyBreakdown({ schedule }: { schedule: AmortizationRow[] }) {
  if (schedule.length === 0) return null;

  const years: { year: number; principal: number; interest: number }[] = [];
  for (let i = 0; i < schedule.length; i += 12) {
    const chunk = schedule.slice(i, i + 12);
    years.push({
      year: Math.floor(i / 12) + 1,
      principal: chunk.reduce((s, r) => s + r.principal, 0),
      interest: chunk.reduce((s, r) => s + r.interest, 0),
    });
  }

  const maxTotal = Math.max(...years.map(y => y.principal + y.interest));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
        Yearly Breakdown
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {years.map(y => {
          const total = y.principal + y.interest;
          const pctPrincipal = maxTotal > 0 ? (y.principal / maxTotal) * 100 : 0;
          const pctInterest = maxTotal > 0 ? (y.interest / maxTotal) * 100 : 0;
          return (
            <div key={y.year} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 36, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>
                Yr {y.year}
              </span>
              <div style={{ flex: 1, display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', background: 'var(--bg-base)' }}>
                <div
                  style={{
                    width: `${pctPrincipal}%`,
                    background: 'var(--brand)',
                    borderRadius: '7px 0 0 7px',
                    transition: 'width 400ms ease',
                  }}
                  title={`Principal: ${fmt(y.principal)}`}
                />
                <div
                  style={{
                    width: `${pctInterest}%`,
                    background: 'var(--border-strong)',
                    borderRadius: '0 7px 7px 0',
                    transition: 'width 400ms ease',
                  }}
                  title={`Interest: ${fmt(y.interest)}`}
                />
              </div>
              <span style={{ width: 60, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>
                {fmt(total)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Preset Chips ── */
const PRESETS = [
  { label: 'Home Loan', amount: 5000000, rate: 8.5, years: 20 },
  { label: 'Car Loan', amount: 800000, rate: 9.5, years: 5 },
  { label: 'Personal Loan', amount: 300000, rate: 14, years: 3 },
  { label: 'Education Loan', amount: 1000000, rate: 10, years: 7 },
];

/* ════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════ */
export function EmiCalculator() {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [tenureYears, setTenureYears] = useState('');
  const [tenureMode, setTenureMode] = useState<'years' | 'months'>('years');
  const [showFullTable, setShowFullTable] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const tenureMonths = tenureMode === 'years'
    ? (parseFloat(tenureYears) || 0) * 12
    : (parseFloat(tenureYears) || 0);

  const result = useMemo<EmiResult | null>(() => {
    const p = parseFloat(amount.replace(/,/g, ''));
    const r = parseFloat(rate);
    const n = tenureMonths;
    if (!p || p <= 0 || isNaN(r) || r < 0 || !n || n <= 0) return null;
    return calculateEmi(p, r, n);
  }, [amount, rate, tenureMonths]);

  function handleCalculate() {
    if (result) setCalculated(true);
  }

  function handleReset() {
    setAmount('');
    setRate('');
    setTenureYears('');
    setCalculated(false);
    setShowFullTable(false);
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setAmount(p.amount.toString());
    setRate(p.rate.toString());
    setTenureYears(p.years.toString());
    setTenureMode('years');
    setCalculated(false);
  }

  function handleAmountChange(val: string) {
    const clean = val.replace(/[^0-9]/g, '');
    setAmount(clean);
    setCalculated(false);
  }

  const visibleRows = showFullTable
    ? result?.schedule ?? []
    : (result?.schedule ?? []).slice(0, 12);

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
            <IndianRupee size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
              EMI Calculator
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              Calculate monthly EMI for home, car, or personal loans
            </p>
          </div>
        </div>
      </div>

      {/* ── Preset Chips ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            style={{
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'all 150ms',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--brand)';
              e.currentTarget.style.color = 'var(--brand)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Main Grid: Form + Results ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* ── LEFT: Input Form ── */}
        <div style={{
          padding: 24,
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          {/* Loan Amount */}
          <InputField
            label="Loan Amount"
            icon={<IndianRupee size={15} />}
            value={amount ? parseInt(amount).toLocaleString('en-IN') : ''}
            onChange={handleAmountChange}
            placeholder="e.g. 50,00,000"
            suffix={amount ? <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{formatInWords(parseFloat(amount.replace(/,/g, '')) || 0)}</span> : undefined}
          />

          {/* Interest Rate */}
          <InputField
            label="Interest Rate (% per annum)"
            icon={<Percent size={15} />}
            value={rate}
            onChange={v => { setRate(v); setCalculated(false); }}
            placeholder="e.g. 8.5"
            type="number"
            step="0.1"
          />

          {/* Tenure */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Loan Tenure
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  display: 'flex', alignItems: 'center', color: 'var(--text-muted)',
                }}>
                  <Calendar size={15} />
                </span>
                <input
                  type="number"
                  value={tenureYears}
                  onChange={e => { setTenureYears(e.target.value); setCalculated(false); }}
                  placeholder={tenureMode === 'years' ? 'e.g. 20' : 'e.g. 240'}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-base)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    outline: 'none',
                    transition: 'border-color 150ms',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
              {/* Toggle years/months */}
              <div style={{
                display: 'flex',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border)',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                {(['years', 'months'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => { setTenureMode(mode); setCalculated(false); }}
                    style={{
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: 'var(--font-sans)',
                      border: 'none',
                      cursor: 'pointer',
                      background: tenureMode === mode ? 'var(--brand)' : 'var(--bg-base)',
                      color: tenureMode === mode ? '#fff' : 'var(--text-muted)',
                      transition: 'all 150ms',
                    }}
                  >
                    {mode === 'years' ? 'Yr' : 'Mo'}
                  </button>
                ))}
              </div>
            </div>
            {tenureMode === 'years' && tenureYears && (
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                = {tenureMonths} months
              </p>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              onClick={handleCalculate}
              disabled={!result}
              style={{
                flex: 1,
                padding: '12px 0',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                color: '#fff',
                background: result ? 'var(--brand)' : 'var(--border)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: result ? 'pointer' : 'not-allowed',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { if (result) e.currentTarget.style.background = 'var(--brand-dark)'; }}
              onMouseLeave={e => { if (result) e.currentTarget.style.background = 'var(--brand)'; }}
            >
              Calculate EMI
            </button>
            <button
              onClick={handleReset}
              title="Reset"
              style={{
                width: 44,
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
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* ── RIGHT: Result Cards + Donut ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Result Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <ResultCard
              label="Monthly EMI"
              value={calculated && result ? fmt(result.emi) : '--'}
              icon={<TrendingUp size={16} />}
            />
            <ResultCard
              label="Total Interest"
              value={calculated && result ? fmt(result.totalInterest) : '--'}
              icon={<Percent size={16} />}
            />
            <ResultCard
              label="Total Payment"
              value={calculated && result ? fmt(result.totalPayment) : '--'}
              icon={<IndianRupee size={16} />}
            />
          </div>

          {/* Donut Chart */}
          <div style={{
            padding: 24,
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            minHeight: 240,
          }}>
            {calculated && result ? (
              <DonutChart
                principal={parseFloat(amount.replace(/,/g, '')) || 0}
                interest={result.totalInterest}
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <PieChart size={40} style={{ color: 'var(--border)', marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                  Enter loan details and click Calculate
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Yearly Breakdown ── */}
      {calculated && result && result.schedule.length > 12 && (
        <div style={{
          padding: 24,
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 24,
        }}>
          <YearlyBreakdown schedule={result.schedule} />
        </div>
      )}

      {/* ── Amortization Table ── */}
      {calculated && result && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1.5px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Table size={16} style={{ color: 'var(--text-muted)' }} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Amortization Schedule
              </p>
              <span style={{
                fontSize: 10, fontWeight: 700,
                padding: '2px 8px', borderRadius: 'var(--radius-full)',
                background: 'var(--bg-base)', color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>
                {result.schedule.length} months
              </span>
            </div>
            <button
              onClick={() => downloadCsv(result.schedule)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                color: 'var(--text-secondary)',
                background: 'var(--bg-base)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <Download size={13} /> CSV
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
            }}>
              <thead>
                <tr style={{ background: 'var(--bg-base)' }}>
                  {['Month', 'EMI', 'Principal', 'Interest', 'Balance'].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 20px',
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-muted)',
                        textAlign: h === 'Month' ? 'center' : 'right',
                        borderBottom: '1.5px solid var(--border)',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, i) => (
                  <tr
                    key={row.month}
                    style={{
                      background: i % 2 === 0 ? 'transparent' : 'var(--bg-base)',
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-base)'}
                  >
                    <td style={{ padding: '10px 20px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontFamily: 'var(--font-sans)', fontSize: 12 }}>
                      {row.month}
                    </td>
                    <td style={{ padding: '10px 20px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {fmt(row.emi)}
                    </td>
                    <td style={{ padding: '10px 20px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {fmt(row.principal)}
                    </td>
                    <td style={{ padding: '10px 20px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {fmt(row.interest)}
                    </td>
                    <td style={{ padding: '10px 20px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {fmt(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Show more / less */}
          {result.schedule.length > 12 && (
            <button
              onClick={() => setShowFullTable(!showFullTable)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                width: '100%',
                padding: '12px 0',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                color: 'var(--text-secondary)',
                background: 'var(--bg-base)',
                border: 'none',
                borderTop: '1.5px solid var(--border)',
                cursor: 'pointer',
                transition: 'background 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-base)'}
            >
              {showFullTable ? (
                <>Show Less <ChevronUp size={14} /></>
              ) : (
                <>Show All {result.schedule.length} Months <ChevronDown size={14} /></>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════ */

/* ── Input Field ── */
function InputField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  step,
  suffix,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  step?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center', color: 'var(--text-muted)',
        }}>
          {icon}
        </span>
        <input
          type={type}
          step={step}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '10px 12px 10px 36px',
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-primary)',
            background: 'var(--bg-base)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            transition: 'border-color 150ms',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Result Card ── */
function ResultCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div style={{
      padding: '16px 16px',
      background: 'var(--bg-surface)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-base)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)',
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          margin: '0 0 2px', fontSize: 18, fontWeight: 800, lineHeight: 1.2,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
        }}>
          {value}
        </p>
        <p style={{
          margin: 0, fontSize: 11, fontWeight: 500,
          color: 'var(--text-muted)',
        }}>
          {label}
        </p>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function formatInWords(n: number): string {
  if (n === 0) return '';
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(2)} Lakh`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)} K`;
  return '';
}

function downloadCsv(schedule: AmortizationRow[]) {
  const header = 'Month,EMI,Principal,Interest,Balance\n';
  const rows = schedule.map(r => `${r.month},${r.emi},${r.principal},${r.interest},${r.balance}`).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'emi-amortization-schedule.csv';
  a.click();
  URL.revokeObjectURL(url);
}
