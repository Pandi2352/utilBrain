import { useState } from 'react';
import { Link, Copy, Check, RotateCcw, Lock, Unlock } from 'lucide-react';

/* ════════════════════════════════════════════════
   URL Encoder/Decoder — utilBrain
   ════════════════════════════════════════════════ */

export function UrlEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    try {
      setOutput(encodeURIComponent(input));
    } catch (e) {
      setOutput(`Error: ${(e as Error).message}`);
    }
  };

  const handleDecode = () => {
    try {
      setOutput(decodeURIComponent(input));
    } catch (e) {
      setOutput(`Error: ${(e as Error).message}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Link size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>URL Encoder/Decoder</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Safely encode or decode URLs for web compatibility and data transfer</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
         {/* Input area */}
         <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <label style={{ display: 'block', marginBottom: 12, fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)' }}>SOURCE URL / TEXT</label>
            <textarea 
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="Paste URL or raw string here..."
              style={{ width: '100%', height: 100, border: '1.5px solid var(--border)', borderRadius: 8, padding: 16, fontSize: 14, fontFamily: 'var(--font-mono)', outline: 'none', background: 'var(--bg-base)', color: 'var(--text-primary)', resize: 'none' }}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
               <button onClick={handleEncode} style={btnStyle('brand')}><Lock size={14} /> Encode URL</button>
               <button onClick={handleDecode} style={btnStyle('primary')}><Unlock size={14} /> Decode URL</button>
               <button onClick={() => { setInput(''); setOutput(''); }} style={{ ...btnStyle('base'), marginLeft: 'auto' }}><RotateCcw size={14} /> Clear</button>
            </div>
         </div>

         {/* Result area */}
         <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
               <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)' }}>RESULT</label>
               <button onClick={handleCopy} style={{ border: 'none', background: 'none', cursor: 'pointer', color: copied ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'COPIED' : 'COPY'}
               </button>
            </div>
            <div style={{ width: '100%', minHeight: 120, border: '1.5px solid var(--border)', borderRadius: 8, padding: 16, fontSize: 14, fontFamily: 'var(--font-mono)', background: 'var(--bg-base)', color: 'var(--brand)', wordBreak: 'break-all' }}>
               {output || <span style={{ opacity: 0.2 }}>Ready for conversion...</span>}
            </div>
         </div>
      </div>
    </div>
  );
}

const btnStyle = (variant: 'brand' | 'primary' | 'base') => ({
  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700,
  background: variant === 'brand' ? 'var(--brand)' : variant === 'primary' ? 'var(--bg-base)' : 'transparent',
  color: variant === 'brand' ? '#fff' : 'var(--text-primary)',
  border: variant === 'base' ? '1.5px solid var(--border)' : variant === 'primary' ? '1.5px solid var(--border)' : 'none',
});
