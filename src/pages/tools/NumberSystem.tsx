import { useState } from 'react';
import { Binary, Copy, Check, RotateCcw } from 'lucide-react';

/* ════════════════════════════════════════════════
   Number System Converter — utilBrain
   ════════════════════════════════════════════════ */

export function NumberSystemConverter() {
  const [values, setValues] = useState({ dec: '', bin: '', hex: '', oct: '' });
  const [copied, setCopied] = useState<string | null>(null);

  const update = (val: string, base: number, key: string) => {
    if (!val.trim()) {
      setValues({ dec: '', bin: '', hex: '', oct: '' });
      return;
    }

    try {
      const num = parseInt(val, base);
      if (isNaN(num)) return;
      
      setValues({
        dec: num.toString(10),
        bin: num.toString(2),
        hex: num.toString(16).toUpperCase(),
        oct: num.toString(8)
      });
    } catch (e) {}
  };

  const handleCopy = (txt: string, id: string) => {
    if (!txt) return;
    navigator.clipboard.writeText(txt);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Binary size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Number System Converter</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Perform real-time conversion between Decimal, Binary, Hex, and Octal systems</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
         <Field label="Decimal (Base 10)" value={values.dec} onInput={v => update(v, 10, 'dec')} onCopy={() => handleCopy(values.dec, 'dec')} active={copied === 'dec'} />
         <Field label="Binary (Base 2)" value={values.bin} onInput={v => update(v, 2, 'bin')} onCopy={() => handleCopy(values.bin, 'bin')} active={copied === 'bin'} />
         <Field label="Hexadecimal (Base 16)" value={values.hex} onInput={v => update(v, 16, 'hex')} onCopy={() => handleCopy(values.hex, 'hex')} active={copied === 'hex'} />
         <Field label="Octal (Base 8)" value={values.oct} onInput={v => update(v, 8, 'oct')} onCopy={() => handleCopy(values.oct, 'oct')} active={copied === 'oct'} />
      </div>

      <button onClick={() => setValues({ dec: '', bin: '', hex: '', oct: '' })} style={{
        marginTop: 32, padding: '12px 24px', borderRadius: 8, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
      }}>
        <RotateCcw size={14} /> Clear All Fields
      </button>
    </div>
  );
}

function Field({ label, value, onInput, onCopy, active }: any) {
  return (
    <div style={{ padding: 24, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12 }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</label>
          <button onClick={onCopy} style={{ border: 'none', background: 'none', cursor: 'pointer', color: active ? 'var(--success)' : 'var(--text-muted)' }}>
             {active ? <Check size={14} /> : <Copy size={14} />}
          </button>
       </div>
       <textarea 
         value={value} onChange={e => onInput(e.target.value)}
         spellCheck={false}
         style={{ width: '100%', border: 'none', outline: 'none', background: 'var(--bg-base)', borderBottom: '2px solid var(--border)', borderRadius: '4px 4px 0 0', padding: '12px 0', fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', resize: 'none', minHeight: 60 }}
       />
    </div>
  );
}
