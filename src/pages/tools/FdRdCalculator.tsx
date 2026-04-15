import { useState, useMemo } from 'react';
import { PiggyBank, Percent, TrendingUp, IndianRupee, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

/* ════════════════════════════════════════════════
   FD / RD Calculator — utilBrain Finance Tool
   ════════════════════════════════════════════════ */

type CalcMode = 'fd' | 'rd';
type CompoundFreq = 'annually' | 'half-yearly' | 'quarterly' | 'monthly';

const FREQ_MAP: Record<CompoundFreq, number> = {
  annually: 1, 'half-yearly': 2, quarterly: 4, monthly: 12,
};

function fmt(n: number): string {
  return Math.round(n).toLocaleString('en-IN');
}
function fmtLakhs(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000)    return `${(n / 100_000).toFixed(2)} Lakhs`;
  return fmt(n);
}

/* ── FD Math: compound interest ── */
function calcFD(principal: number, rate: number, months: number, freq: CompoundFreq) {
  const n    = FREQ_MAP[freq];
  const r    = rate / 100;
  const t    = months / 12;
  const maturity = principal * Math.pow(1 + r / n, n * t);
  const interest  = maturity - principal;
  return { maturity: Math.round(maturity), interest: Math.round(interest) };
}

/* ── RD Math ── */
function calcRD(monthly: number, rate: number, months: number) {
  const r = rate / 400; // quarterly compounding for RD standard
  let maturity = 0;
  for (let i = 1; i <= months; i++) {
    const quartersLeft = (months - i + 1) / 3;
    maturity += monthly * Math.pow(1 + r, quartersLeft);
  }
  const invested = monthly * months;
  const interest  = maturity - invested;
  return { maturity: Math.round(maturity), interest: Math.round(interest), invested: Math.round(invested) };
}

/* ── Presets ── */
const FD_PRESETS = [
  { label: 'SBI Short-Term', amount: 100000, rate: 6.8, months: 12 },
  { label: 'HDFC 2yr',       amount: 500000, rate: 7.1, months: 24 },
  { label: 'Post Office 5yr',amount: 200000, rate: 7.5, months: 60 },
];
const RD_PRESETS = [
  { label: 'Monthly ₹1K',  monthly: 1000,  rate: 6.5, months: 12 },
  { label: 'Monthly ₹5K',  monthly: 5000,  rate: 7.0, months: 36 },
  { label: 'Monthly ₹10K', monthly: 10000, rate: 7.2, months: 60 },
];

/* ── Donut ── */
function DonutChart({ principal, interest, isFD }: { principal: number; interest: number; isFD: boolean }) {
  const total = principal + interest;
  if (total === 0) return null;
  const size = 170, stroke = 26;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pArc = circ * (principal / total);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="#e2e8f0" strokeWidth={stroke}
          strokeDasharray={`${circ - pArc} ${circ}`} strokeDashoffset={-pArc}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'all 500ms' }} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="var(--brand)" strokeWidth={stroke}
          strokeDasharray={`${pArc} ${circ}`}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'all 500ms' }} />
        <text x={size/2} y={size/2 - 7} textAnchor="middle"
          style={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
          Maturity
        </text>
        <text x={size/2} y={size/2 + 11} textAnchor="middle"
          style={{ fontSize: 14, fill: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
          ₹{fmtLakhs(total)}
        </text>
      </svg>
      <div style={{ display: 'flex', gap: 18 }}>
        <LDot color="var(--brand)" label={isFD ? 'Principal' : 'Invested'} value={`₹${fmtLakhs(principal)}`} />
        <LDot color="#e2e8f0" label="Interest" value={`₹${fmtLakhs(interest)}`} />
      </div>
    </div>
  );
}

function LDot({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ width: 9, height: 9, borderRadius: 3, background: color, flexShrink: 0 }} />
      <div>
        <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}

function InputField({ label, icon, value, onChange, placeholder, type = 'text', step, suffix }: {
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
        <input type={type} step={step} value={value}
          onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{
            width: '100%', padding: '10px 12px 10px 36px', fontSize: 14, fontWeight: 500,
            fontFamily: 'var(--font-sans)', color: 'var(--text-primary)',
            background: 'var(--bg-base)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color 150ms',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
        />
        {suffix && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ResultCard({ label, value, sub, icon, highlight, gainColor }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; highlight?: boolean; gainColor?: boolean;
}) {
  return (
    <div style={{
      padding: '16px', background: 'var(--bg-surface)',
      border: `1.5px solid ${highlight ? 'var(--brand)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 8,
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
        <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: gainColor ? '#16a34a' : highlight ? 'var(--brand)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1.2 }}>
          ₹{value}
        </p>
        {sub && <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>({sub})</p>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   Main Component
   ════════════════════════════════════════ */
export function FdRdCalculator() {
  const [tab, setTab]         = useState<CalcMode>('fd');

  // FD state
  const [fdAmount, setFdAmount] = useState('100000');
  const [fdRate, setFdRate]     = useState('7.0');
  const [fdMonths, setFdMonths] = useState('12');
  const [fdFreq, setFdFreq]     = useState<CompoundFreq>('quarterly');

  // RD state
  const [rdMonthly, setRdMonthly] = useState('5000');
  const [rdRate, setRdRate]       = useState('7.0');
  const [rdMonths, setRdMonths]   = useState('24');

  const [calculated, setCalculated] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const fdResult = useMemo(() => {
    const p = parseFloat(fdAmount) || 0;
    const r = parseFloat(fdRate)   || 0;
    const m = parseFloat(fdMonths)  || 0;
    if (!p || !r || !m) return null;
    return calcFD(p, r, m, fdFreq);
  }, [fdAmount, fdRate, fdMonths, fdFreq]);

  const rdResult = useMemo(() => {
    const m = parseFloat(rdMonthly) || 0;
    const r = parseFloat(rdRate)    || 0;
    const mo= parseFloat(rdMonths)  || 0;
    if (!m || !r || !mo) return null;
    return calcRD(m, r, mo);
  }, [rdMonthly, rdRate, rdMonths]);

  const result = tab === 'fd' ? fdResult : rdResult;

  function handleReset() {
    if (tab === 'fd') { setFdAmount('100000'); setFdRate('7.0'); setFdMonths('12'); setFdFreq('quarterly'); }
    else { setRdMonthly('5000'); setRdRate('7.0'); setRdMonths('24'); }
    setCalculated(false);
  }

  // Year-wise breakdown table
  const breakdownRows = useMemo(() => {
    if (!calculated || !result) return [];
    const rows: { period: string; value: number }[] = [];
    const months = tab === 'fd' ? parseFloat(fdMonths) : parseFloat(rdMonths);
    for (let m = 3; m <= months; m += 3) {
      if (tab === 'fd') {
        const r = calcFD(parseFloat(fdAmount) || 0, parseFloat(fdRate) || 0, m, fdFreq);
        rows.push({ period: m < 12 ? `${m} mo` : `${m / 12} yr${m/12 > 1 ? 's' : ''}`, value: r.maturity });
      } else {
        const r = calcRD(parseFloat(rdMonthly) || 0, parseFloat(rdRate) || 0, m);
        rows.push({ period: m < 12 ? `${m} mo` : `${m / 12} yr${m/12 > 1 ? 's' : ''}`, value: r.maturity });
      }
    }
    return rows;
  }, [calculated, result, tab, fdAmount, fdRate, fdMonths, fdFreq, rdMonthly, rdRate, rdMonths]);

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0,
          }}>
            <PiggyBank size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
              FD / RD Calculator
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              Fixed Deposit & Recurring Deposit maturity calculator
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', width: 'fit-content', marginBottom: 16 }}>
          {(['fd', 'rd'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setCalculated(false); }} style={{
              padding: '8px 28px', fontSize: 13, fontWeight: 700,
              fontFamily: 'var(--font-sans)', border: 'none', cursor: 'pointer',
              background: tab === t ? 'var(--brand)' : 'var(--bg-surface)',
              color: tab === t ? '#fff' : 'var(--text-muted)',
              transition: 'all 150ms',
            }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Presets */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {(tab === 'fd' ? FD_PRESETS : RD_PRESETS).map(p => (
            <button key={p.label}
              onClick={() => {
                if (tab === 'fd') {
                  const fp = p as typeof FD_PRESETS[0];
                  setFdAmount(fp.amount.toString()); setFdRate(fp.rate.toString()); setFdMonths(fp.months.toString());
                } else {
                  const rp = p as typeof RD_PRESETS[0];
                  setRdMonthly(rp.monthly.toString()); setRdRate(rp.rate.toString()); setRdMonths(rp.months.toString());
                }
                setCalculated(false);
              }}
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
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* LEFT: Form */}
        <div style={{
          padding: 24, background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          {tab === 'fd' ? (
            <>
              <InputField label="Principal Amount (₹)" icon={<IndianRupee size={15} />}
                value={fdAmount} onChange={v => { setFdAmount(v.replace(/\D/g,'')); setCalculated(false); }}
                placeholder="e.g. 1,00,000"
                suffix={fdAmount ? <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{fmtLakhs(+fdAmount)}</span> : undefined}
              />
              <InputField label="Annual Interest Rate (%)" icon={<Percent size={15} />}
                value={fdRate} onChange={v => { setFdRate(v); setCalculated(false); }}
                placeholder="e.g. 7.0" type="number" step="0.1"
              />
              <InputField label="Duration (Months)" icon={<TrendingUp size={15} />}
                value={fdMonths} onChange={v => { setFdMonths(v); setCalculated(false); }}
                placeholder="e.g. 12"
                suffix={fdMonths ? <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{(+fdMonths / 12).toFixed(1)}yr</span> : undefined}
              />
              {/* Compounding frequency */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Compounding Frequency
                </label>
                <select value={fdFreq}
                  onChange={e => { setFdFreq(e.target.value as CompoundFreq); setCalculated(false); }}
                  style={{
                    width: '100%', padding: '10px 12px', fontSize: 14, fontWeight: 500,
                    fontFamily: 'var(--font-sans)', color: 'var(--text-primary)',
                    background: 'var(--bg-base)', border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-md)', outline: 'none', cursor: 'pointer', transition: 'border-color 150ms',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <option value="annually">Annually</option>
                  <option value="half-yearly">Half Yearly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <InputField label="Monthly Deposit (₹)" icon={<IndianRupee size={15} />}
                value={rdMonthly} onChange={v => { setRdMonthly(v.replace(/\D/g,'')); setCalculated(false); }}
                placeholder="e.g. 5,000"
                suffix={rdMonthly ? <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{fmtLakhs(+rdMonthly)}/mo</span> : undefined}
              />
              <InputField label="Annual Interest Rate (%)" icon={<Percent size={15} />}
                value={rdRate} onChange={v => { setRdRate(v); setCalculated(false); }}
                placeholder="e.g. 7.0" type="number" step="0.1"
              />
              <InputField label="Duration (Months)" icon={<TrendingUp size={15} />}
                value={rdMonths} onChange={v => { setRdMonths(v); setCalculated(false); }}
                placeholder="e.g. 24"
                suffix={rdMonths ? <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{(+rdMonths / 12).toFixed(1)}yr</span> : undefined}
              />
            </>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => { if (result) setCalculated(true); }}
              disabled={!result}
              style={{
                flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 700,
                fontFamily: 'var(--font-sans)', color: '#fff',
                background: result ? 'var(--brand)' : 'var(--border)',
                border: 'none', borderRadius: 'var(--radius-md)',
                cursor: result ? 'pointer' : 'not-allowed', transition: 'all 150ms',
              }}
              onMouseEnter={e => { if (result) e.currentTarget.style.background = 'var(--brand-dark)'; }}
              onMouseLeave={e => { if (result) e.currentTarget.style.background = 'var(--brand)'; }}
            >
              Calculate {tab.toUpperCase()}
            </button>
            <button onClick={handleReset} title="Reset"
              style={{
                width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-base)', border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* RIGHT: Results + Donut */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <ResultCard label="Maturity Amount" highlight
              value={calculated && result ? fmt(result.maturity) : '--'}
              sub={calculated && result ? fmtLakhs(result.maturity) : undefined}
              icon={<TrendingUp size={16} />}
            />
            <ResultCard label={tab === 'fd' ? 'Principal' : 'Total Invested'}
              value={calculated && result
                ? fmt(tab === 'fd' ? parseFloat(fdAmount) || 0 : (result as ReturnType<typeof calcRD>).invested)
                : '--'}
              icon={<IndianRupee size={16} />}
            />
            <ResultCard label="Interest Earned" gainColor
              value={calculated && result ? fmt(result.interest) : '--'}
              sub={calculated && result ? fmtLakhs(result.interest) : undefined}
              icon={<Percent size={16} />}
            />
          </div>

          <div style={{
            padding: 24, background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flex: 1, minHeight: 240,
          }}>
            {calculated && result ? (
              <DonutChart
                principal={tab === 'fd' ? parseFloat(fdAmount) || 0 : (result as ReturnType<typeof calcRD>).invested}
                interest={result.interest}
                isFD={tab === 'fd'}
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <PiggyBank size={40} style={{ color: 'var(--border)', marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                  Enter details and click Calculate
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Maturity Breakdown Table */}
      {calculated && breakdownRows.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1.5px solid var(--border)' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Growth Projection
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-base)' }}>
                  {['Period', 'Maturity Value (₹)', 'In Lakhs'].map((h, i) => (
                    <th key={h} style={{
                      padding: '10px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.05em', color: 'var(--text-muted)',
                      textAlign: i === 0 ? 'left' : 'right',
                      borderBottom: '1.5px solid var(--border)', fontFamily: 'var(--font-sans)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(showBreakdown ? breakdownRows : breakdownRows.slice(0, 6)).map((row, i) => (
                  <tr key={row.period}
                    style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-base)', transition: 'background 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-base)'}
                  >
                    <td style={{ padding: '10px 20px', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-sans)', fontSize: 13 }}>{row.period}</td>
                    <td style={{ padding: '10px 20px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{fmt(row.value)}</td>
                    <td style={{ padding: '10px 20px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{fmtLakhs(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {breakdownRows.length > 6 && (
            <button onClick={() => setShowBreakdown(!showBreakdown)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '12px 0', fontSize: 13, fontWeight: 600,
                fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)',
                background: 'var(--bg-base)', border: 'none', borderTop: '1.5px solid var(--border)',
                cursor: 'pointer', transition: 'background 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-base)'}
            >
              {showBreakdown ? <><span>Show Less</span><ChevronUp size={14} /></> : <><span>Show All Periods</span><ChevronDown size={14} /></>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
