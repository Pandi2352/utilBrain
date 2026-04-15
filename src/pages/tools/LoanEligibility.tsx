import { useState, useMemo } from 'react';
import { Landmark, IndianRupee, Percent, Briefcase, TrendingUp, RotateCcw } from 'lucide-react';

/* ════════════════════════════════════════════════
   Loan Eligibility Calculator — utilBrain
   ════════════════════════════════════════════════ */

function fmt(n: number) { return Math.round(n).toLocaleString('en-IN'); }
function fmtL(n: number) {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000)    return `${(n / 100_000).toFixed(2)} Lakhs`;
  return fmt(n);
}

const LOAN_TYPES = [
  { id: 'home',     label: 'Home Loan',       rate: 8.75, ltv: 0.80, maxTenure: 30 },
  { id: 'car',      label: 'Car Loan',         rate: 9.25, ltv: 0.90, maxTenure: 7  },
  { id: 'personal', label: 'Personal Loan',    rate: 12.5, ltv: 1.00, maxTenure: 5  },
  { id: 'education',label: 'Education Loan',   rate: 10.0, ltv: 1.00, maxTenure: 15 },
  { id: 'gold',     label: 'Gold Loan',        rate: 9.5,  ltv: 0.75, maxTenure: 3  },
] as const;

type LoanTypeId = typeof LOAN_TYPES[number]['id'];

function calcEligibility(
  grossIncome: number,
  existingEmi: number,
  rate: number,
  tenureYears: number,
  ltvRatio: number,
  propertyValue: number,
) {
  // FOIR: Fixed Obligation to Income Ratio — max 50%
  const maxEmiAllowed = grossIncome * 0.50 - existingEmi;
  if (maxEmiAllowed <= 0) return null;

  const r = rate / 12 / 100;
  const n = tenureYears * 12;
  const factor = r === 0 ? n : (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));

  const eligibilityByIncome = maxEmiAllowed * factor;
  const eligibilityByLTV    = propertyValue > 0 ? propertyValue * ltvRatio : Infinity;
  const maxLoan = Math.min(eligibilityByIncome, eligibilityByLTV);

  const emi = maxLoan / factor;
  const totalPayment = emi * n;
  const totalInterest = totalPayment - maxLoan;
  const foir = ((existingEmi + emi) / grossIncome) * 100;

  return {
    maxLoan:       Math.round(maxLoan),
    emi:           Math.round(emi),
    totalPayment:  Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    foir:          Math.round(foir * 10) / 10,
    maxEmiAllowed: Math.round(maxEmiAllowed),
  };
}

function InputField({ label, icon, value, onChange, placeholder, type = 'text', step, suffix }: {
  label: string; icon: React.ReactNode; value: string;
  onChange: (v: string) => void; placeholder: string;
  type?: string; step?: string; suffix?: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>{icon}</span>
        <input type={type} step={step} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{
            width: '100%', padding: '10px 12px 10px 36px', fontSize: 14, fontWeight: 500,
            fontFamily: 'var(--font-sans)', color: 'var(--text-primary)',
            background: 'var(--bg-base)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color 150ms', boxSizing: 'border-box',
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
      <div style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', background: highlight ? 'rgba(0,194,168,0.10)' : 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: highlight ? 'var(--brand)' : 'var(--text-muted)' }}>{icon}</div>
      <div>
        <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, lineHeight: 1.2, color: gainColor ? '#dc2626' : highlight ? 'var(--brand)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</p>
        {sub && <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>({sub})</p>}
      </div>
    </div>
  );
}

/* ── FOIR gauge ── */
function FoirGauge({ foir }: { foir: number }) {
  const pct = Math.min(foir, 100);
  const color = foir <= 40 ? '#16a34a' : foir <= 50 ? 'var(--brand)' : '#dc2626';
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>FOIR (Fixed Obligation Ratio)</span>
        <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{foir}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-base)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 500ms ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>0%</span>
        <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>Ideal ≤40%</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>100%</span>
      </div>
    </div>
  );
}

export function LoanEligibilityCalculator() {
  const [loanType, setLoanType] = useState<LoanTypeId>('home');
  const [income,       setIncome]       = useState('80000');
  const [existingEmi,  setExistingEmi]  = useState('0');
  const [tenure,       setTenure]       = useState('20');
  const [rate,         setRate]         = useState('');
  const [propValue,    setPropValue]    = useState('');
  const [calculated,   setCalculated]   = useState(false);

  const loanConfig = LOAN_TYPES.find(l => l.id === loanType)!;
  const effectiveRate = rate ? parseFloat(rate) : loanConfig.rate;

  const result = useMemo(() => {
    const inc = parseFloat(income) || 0;
    const emi = parseFloat(existingEmi) || 0;
    const t   = parseFloat(tenure) || 0;
    const pv  = parseFloat(propValue.replace(/,/g, '')) || 0;
    if (!inc || !t || !effectiveRate) return null;
    return calcEligibility(inc, emi, effectiveRate, t, loanConfig.ltv, pv);
  }, [income, existingEmi, tenure, effectiveRate, loanConfig, propValue]);

  function handleReset() {
    setIncome('80000'); setExistingEmi('0'); setTenure('20');
    setRate(''); setPropValue(''); setCalculated(false);
  }

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
            <Landmark size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Loan Eligibility Calculator</h1>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Check your maximum loan amount based on income & obligations</p>
          </div>
        </div>
      </div>

      {/* Loan type tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {LOAN_TYPES.map(lt => (
          <button key={lt.id} onClick={() => { setLoanType(lt.id); setCalculated(false); }}
            style={{
              padding: '7px 16px', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)',
              border: '1.5px solid var(--border)', borderRadius: 'var(--radius-full)', cursor: 'pointer', transition: 'all 150ms',
              background: loanType === lt.id ? 'var(--brand)' : 'var(--bg-surface)',
              color: loanType === lt.id ? '#fff' : 'var(--text-secondary)',
              borderColor: loanType === lt.id ? 'var(--brand)' : 'var(--border)',
            }}
          >
            {lt.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Form */}
        <div style={{ padding: 24, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 18 }}>

          <InputField label="Gross Monthly Income (₹)" icon={<IndianRupee size={15} />}
            value={income} onChange={v => { setIncome(v.replace(/\D/g,'')); setCalculated(false); }}
            placeholder="e.g. 80,000"
            suffix={income ? <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{fmtL(+income * 12)}/yr</span> : undefined}
          />
          <InputField label="Existing Monthly EMIs (₹)" icon={<Briefcase size={15} />}
            value={existingEmi} onChange={v => { setExistingEmi(v.replace(/\D/g,'')); setCalculated(false); }}
            placeholder="0 if none"
          />
          <InputField label={`Loan Tenure (Years, max ${loanConfig.maxTenure})`} icon={<TrendingUp size={15} />}
            value={tenure} type="number"
            onChange={v => { setTenure(Math.min(+v, loanConfig.maxTenure).toString()); setCalculated(false); }}
            placeholder={`e.g. ${loanConfig.maxTenure}`}
          />
          <InputField label={`Interest Rate (%, default ${loanConfig.rate}%)`} icon={<Percent size={15} />}
            value={rate} type="number" step="0.1"
            onChange={v => { setRate(v); setCalculated(false); }}
            placeholder={`e.g. ${loanConfig.rate}`}
            suffix={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>% p.a.</span>}
          />
          {(loanType === 'home' || loanType === 'car') && (
            <InputField label="Property / Vehicle Value (₹)" icon={<IndianRupee size={15} />}
              value={propValue} onChange={v => { setPropValue(v.replace(/\D/g,'')); setCalculated(false); }}
              placeholder="Optional — for LTV check"
              suffix={propValue ? <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{fmtL(+propValue)}</span> : undefined}
            />
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => { if (result) setCalculated(true); }} disabled={!result}
              style={{
                flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-sans)',
                color: '#fff', background: result ? 'var(--brand)' : 'var(--border)',
                border: 'none', borderRadius: 'var(--radius-md)',
                cursor: result ? 'pointer' : 'not-allowed', transition: 'all 150ms',
              }}
              onMouseEnter={e => { if (result) e.currentTarget.style.background = 'var(--brand-dark)'; }}
              onMouseLeave={e => { if (result) e.currentTarget.style.background = 'var(--brand)'; }}
            >
              Check Eligibility
            </button>
            <button onClick={handleReset} title="Reset"
              style={{ width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 150ms' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <ResultCard label="Max Loan Amount" highlight icon={<Landmark size={16} />}
              value={calculated && result ? fmt(result.maxLoan) : '--'}
              sub={calculated && result ? fmtL(result.maxLoan) : undefined}
            />
            <ResultCard label="Est. Monthly EMI" icon={<IndianRupee size={16} />}
              value={calculated && result ? fmt(result.emi) : '--'}
            />
            <ResultCard label="Total Payment" icon={<TrendingUp size={16} />}
              value={calculated && result ? fmt(result.totalPayment) : '--'}
              sub={calculated && result ? fmtL(result.totalPayment) : undefined}
            />
            <ResultCard label="Total Interest" gainColor icon={<Percent size={16} />}
              value={calculated && result ? fmt(result.totalInterest) : '--'}
              sub={calculated && result ? fmtL(result.totalInterest) : undefined}
            />
          </div>

          {/* FOIR + info */}
          <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            {calculated && result ? (
              <>
                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Eligibility Summary</p>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-muted)' }}>
                  Max EMI capacity: <strong style={{ color: 'var(--text-primary)' }}>₹{fmt(result.maxEmiAllowed)}/mo</strong>
                </p>
                <FoirGauge foir={result.foir} />
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    💡 Based on <strong>FOIR ≤ 50%</strong> rule. Actual eligibility depends on credit score, employer, and bank policy.
                    LTV ratio applied: <strong>{(loanConfig.ltv * 100).toFixed(0)}%</strong>.
                  </p>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Landmark size={36} style={{ color: 'var(--border)', marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Enter details and click Check Eligibility</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
