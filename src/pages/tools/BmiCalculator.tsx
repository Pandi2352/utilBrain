import { useState, useMemo } from 'react';
import { Activity, RotateCcw, Info, Scale } from 'lucide-react';

/* ════════════════════════════════════════════════
   BMI Calculator — utilBrain
   ════════════════════════════════════════════════ */

type UnitSystem = 'metric' | 'imperial';

export function BmiCalculator() {
  const [unit, setUnit] = useState<UnitSystem>('metric');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175'); // cm
  const [ft, setFt] = useState('5');
  const [in_, setIn] = useState('9');

  const result = useMemo(() => {
    let w = parseFloat(weight) || 0;
    let h_m = 0;

    if (unit === 'metric') {
      h_m = (parseFloat(height) || 0) / 100;
    } else {
      const totalInches = (parseFloat(ft) || 0) * 12 + (parseFloat(in_) || 0);
      h_m = totalInches * 0.0254;
      w = w * 0.453592;
    }

    if (h_m <= 0 || w <= 0) return null;

    const bmi = w / (h_m * h_m);
    
    let category = '';
    let color = '';
    if (bmi < 18.5) { category = 'Underweight'; color = '#3b82f6'; }
    else if (bmi < 25) { category = 'Normal'; color = '#10b981'; }
    else if (bmi < 30) { category = 'Overweight'; color = '#f59e0b'; }
    else { category = 'Obese'; color = '#ef4444'; }

    const idealLow = 18.5 * (h_m * h_m);
    const idealHigh = 24.9 * (h_m * h_m);

    return {
      bmi,
      category,
      color,
      idealRange: unit === 'metric' 
        ? `${idealLow.toFixed(1)} - ${idealHigh.toFixed(1)} kg`
        : `${(idealLow * 2.20462).toFixed(1)} - ${(idealHigh * 2.20462).toFixed(1)} lbs`
    };
  }, [unit, weight, height, ft, in_]);

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Activity size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>BMI Calculator</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Calculate Body Mass Index and ideal weight range</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: 24 }}>
        {/* Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              <button onClick={() => setUnit('metric')} style={unitBtnStyle(unit === 'metric')}>Metric (kg/cm)</button>
              <button onClick={() => setUnit('imperial')} style={unitBtnStyle(unit === 'imperial')}>Imperial (lb/in)</button>
            </div>

            <Field label={unit === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} style={inputStyle} />
            </Field>

            {unit === 'metric' ? (
              <Field label="Height (cm)">
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} style={inputStyle} />
              </Field>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <Field label="Height (ft)">
                  <input type="number" value={ft} onChange={e => setFt(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Inches">
                  <input type="number" value={in_} onChange={e => setIn(e.target.value)} style={inputStyle} />
                </Field>
              </div>
            )}

            <button onClick={() => { setWeight('70'); setHeight('175'); setFt('5'); setIn('9'); }} style={{
              width: '100%', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)',
              background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer'
            }}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <div style={{ padding: 20, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 12 }}>
            <Info size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              BMI is a simple index of weight-for-height and is a useful population-level measure of being overweight or obese.
            </p>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result ? (
            <>
              {/* BMI Score Card */}
              <div style={{ padding: 32, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your BMI Result</p>
                <h2 style={{ margin: 0, fontSize: 64, fontWeight: 900, color: result.color }}>{result.bmi.toFixed(1)}</h2>
                <div style={{ display: 'inline-block', padding: '6px 16px', background: result.color, color: '#fff', borderRadius: 20, fontSize: 14, fontWeight: 800, marginTop: 12 }}>
                  {result.category}
                </div>
              </div>

              {/* Ideal Weight Area */}
              <div style={{ padding: '24px 32px', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'full', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scale size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Healthy Weight Range</h4>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Based on your height</p>
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                  {result.idealRange}
                </div>
              </div>

              {/* BMI Scale Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <ScaleItem label="Underweight" range="< 18.5" color="#3b82f6" active={result.category === 'Underweight'} />
                <ScaleItem label="Normal" range="18.5 - 24.9" color="#10b981" active={result.category === 'Normal'} />
                <ScaleItem label="Overweight" range="25 - 29.9" color="#f59e0b" active={result.category === 'Overweight'} />
                <ScaleItem label="Obese" range="> 30" color="#ef4444" active={result.category === 'Obese'} />
              </div>
            </>
          ) : (
            <div style={{ height: '300px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <Activity size={40} opacity={0.3} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 14, fontWeight: 500 }}>Enter your details to calculate BMI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: any) {
  return <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</label>{children}</div>;
}

function ScaleItem({ label, range, color, active }: any) {
  return (
    <div style={{ padding: '12px', border: `1.5px solid ${active ? color : 'var(--border)'}`, background: active ? `${color}10` : 'var(--bg-surface)', borderRadius: 8, textAlign: 'center' }}>
      <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 800, color: active ? color : 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: active ? color : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{range}</p>
    </div>
  );
}

const unitBtnStyle = (active: boolean) => ({
  padding: '10px', fontSize: 12, fontWeight: 700, borderRadius: 6, cursor: 'pointer',
  background: active ? 'var(--brand)' : 'var(--bg-base)',
  color: active ? '#fff' : 'var(--text-secondary)',
  border: active ? 'none' : '1.5px solid var(--border)',
});

const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
  background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'var(--font-mono)'
};
