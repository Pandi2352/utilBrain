import { useState } from 'react';
import { Type, Copy, Check, RotateCcw, ArrowRightLeft } from 'lucide-react';

/* ════════════════════════════════════════════════
   Roman Numeral Converter — utilBrain
   ════════════════════════════════════════════════ */

export function RomanNumeralConverter() {
  const [decimal, setDecimal] = useState('');
  const [roman, setRoman] = useState('');
  const [lastCopied, setLastCopied] = useState<string | null>(null);

  const handleDecimalChange = (val: string) => {
    setDecimal(val);
    const num = parseInt(val);
    if (!isNaN(num) && num > 0 && num < 4000) {
      setRoman(toRoman(num));
    } else {
      setRoman('');
    }
  };

  const handleRomanChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^IVXLCDM]/g, '');
    setRoman(clean);
    if (clean) {
      const dec = fromRoman(clean);
      setDecimal(dec > 0 ? dec.toString() : '');
    } else {
      setDecimal('');
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setLastCopied(id);
    setTimeout(() => setLastCopied(null), 1500);
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* ── Header ── */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Type size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Roman Numeral Converter</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Easily convert numbers to ancient Roman numerals and back again</p>
        </div>
      </div>

      <div style={{ 
        width: '100%', maxWidth: 500, padding: 40, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', 
        borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: 32, position: 'relative'
      }}>
         <ConvInput 
           label="Decimal Number (1-3999)" 
           value={decimal} 
           onChange={handleDecimalChange} 
           placeholder="e.g. 1984" 
           onCopy={() => handleCopy(decimal, 'dec')} 
           active={lastCopied === 'dec'}
         />
         
         <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--bg-base)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
               <ArrowRightLeft size={18} style={{ transform: 'rotate(90deg)' }} />
            </div>
         </div>

         <ConvInput 
           label="Roman Numeral" 
           value={roman} 
           onChange={handleRomanChange} 
           placeholder="e.g. MCMLXXXIV" 
           onCopy={() => handleCopy(roman, 'rom')} 
           active={lastCopied === 'rom'}
         />

         <button onClick={() => { setDecimal(''); setRoman(''); }} style={{
           position: 'absolute', top: 20, right: 20, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)'
         }}><RotateCcw size={16} /></button>
      </div>

      <div style={{ marginTop: 32, padding: 20, border: '1.5px dashed var(--border)', borderRadius: 12, maxWidth: 500, color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6 }}>
         <p style={{ margin: '0 0 8px', fontWeight: 800, color: 'var(--text-secondary)' }}>Ancient Roman Basics:</p>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <span>I = 1</span><span>V = 5</span><span>X = 10</span><span>L = 50</span>
            <span>C = 100</span><span>D = 500</span><span>M = 1000</span>
         </div>
      </div>
    </div>
  );
}

function ConvInput({ label, value, onChange, placeholder, onCopy, active }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</label>
          <button onClick={onCopy} style={{ border: 'none', background: 'none', cursor: 'pointer', color: active ? 'var(--success)' : 'var(--text-muted)' }}>
             {active ? <Check size={14} /> : <Copy size={14} />}
          </button>
       </div>
       <input 
         value={value} onChange={e => onChange(e.target.value)}
         placeholder={placeholder}
         style={{ width: '100%', fontSize: 24, fontWeight: 800, padding: '16px 0', border: 'none', borderBottom: '2px solid var(--border)', background: 'transparent', outline: 'none', color: 'var(--text-primary)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
       />
    </div>
  );
}

/* ── Logic ── */

const romanMap: any = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };

function toRoman(num: number) {
  let str = '';
  for (let i in romanMap) {
    while (num >= romanMap[i]) {
      str += i;
      num -= romanMap[i];
    }
  }
  return str;
}

function fromRoman(str: string) {
  let res = 0;
  for (let i = 0; i < str.length; i++) {
    const s1 = romanMap[str[i]], s2 = romanMap[str[i + 1]];
    if (s2 > s1) { res += s2 - s1; i++; }
    else res += s1;
  }
  return res;
}
