import { useState, useMemo } from 'react';
import { TrendingUp, Copy, Check, RotateCcw, Landmark, PiggyBank, Briefcase } from 'lucide-react';

/* ════════════════════════════════════════════════
   Compound Interest Calculator — utilBrain
   ════════════════════════════════════════════════ */

export function CompoundInterestCalculator() {
  const [p, setP] = useState(100000); // Principal
  const [m, setM] = useState(5000);   // Monthly
  const [r, setR] = useState(12);     // Rate
  const [t, setT] = useState(10);     // Years

  const results = useMemo(() => {
    const rate = r / 100 / 12;
    const months = t * 12;
    
    // Calculation: Maturity = P(1+r)^n + M * [((1+r)^n - 1) / r] * (1+r)
    // Assuming monthly contribution at start of month
    const mP = p * Math.pow(1 + rate, months);
    const mM = m * ((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate);
    
    const maturity = Math.round(mP + mM);
    const invested = p + (m * months);
    const interest = maturity - invested;

    return { maturity, invested, interest };
  }, [p, m, r, t]);

  const format = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', overflowY: 'auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <TrendingUp size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Compound Interest Calculator</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Surgical projection of long-term wealth growth</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 400px) 1fr', gap: 24 }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <div style={{ padding: 24, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Field label="Initial Investment (P)" value={p} onChange={v => setP(parseInt(v) || 0)} min={0} />
              <Field label="Monthly Addition (M)" value={m} onChange={v => setM(parseInt(v) || 0)} min={0} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                 <Field label="Annual Rate (%)" value={r} onChange={v => setR(parseFloat(v) || 0)} min={0} step={0.1} />
                 <Field label="Time Period (Years)" value={t} onChange={v => setT(parseInt(v) || 0)} min={1} max={50} />
              </div>
              <button onClick={() => { setP(100000); setM(5000); setR(12); setT(10); }} style={{
                marginTop: 8, padding: '12px', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
                <RotateCcw size={14} /> Reset Values
              </button>
           </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Stat icon={<PiggyBank size={18} />} label="TOTAL INVESTED" value={format(results.invested)} color="var(--text-primary)" />
              <Stat icon={<Landmark size={18} />} label="INTEREST GAINED" value={format(results.interest)} color="var(--success)" />
           </div>

           <div style={{ 
             padding: 40, background: 'var(--brand)', borderRadius: 12, color: '#fff', 
             display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
             boxShadow: '0 10px 30px -10px rgba(79,107,237,0.4)'
           }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, opacity: 0.8, letterSpacing: '0.05em' }}>ESTIMATED MATURITY VALUE</p>
              <h2 style={{ margin: 0, fontSize: 42, fontWeight: 900, letterSpacing: '-1px' }}>{format(results.maturity)}</h2>
           </div>
           
           <div style={{ padding: 20, border: '1.5px dashed var(--border)', borderRadius: 8, background: 'var(--bg-surface)' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <b>Compound Interest</b> is the addition of interest to the principal sum of a loan or deposit. It is the result of reinvesting interest, rather than paying it out, so that interest in the next period is then earned on the principal sum plus previously accumulated interest.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, ...props }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
       <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</label>
       <input 
         type="number" value={value} onChange={e => onChange(e.target.value)}
         style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', outline: 'none' }}
         {...props}
       />
    </div>
  );
}

function Stat({ icon, label, value, color }: any) {
  return (
    <div style={{ padding: 24, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
       <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', border: '1px solid var(--border)' }}>
          {icon}
       </div>
       <div>
          <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>{label}</p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color }}>{value}</p>
       </div>
    </div>
  );
}
