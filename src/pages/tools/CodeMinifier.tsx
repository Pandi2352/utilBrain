import { useState } from 'react';
import { Minimize2, Copy, Check, RotateCcw, Zap, FileJson, FileCode, FileText } from 'lucide-react';

/* ════════════════════════════════════════════════
   Code Minifier (CSS/JS) — utilBrain
   ════════════════════════════════════════════════ */

type Mode = 'js' | 'css' | 'html';

export function CodeMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('js');
  const [copied, setCopied] = useState(false);

  const minify = () => {
    let result = input;
    if (mode === 'js') {
      result = result
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1') // remove comments
        .replace(/\s+/g, ' ') // collapse spaces
        .replace(/;\s+/g, ';') // remove space after semicolon
        .replace(/\s*([{};,:])\s*/g, '$1') // remove space around separators
        .trim();
    } else if (mode === 'css') {
      result = result
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
        .replace(/\s+/g, ' ') // collapse spaces
        .replace(/\s*([{};,:])\s*/g, '$1') // remove space around separators
        .replace(/;}/g, '}') // remove last semicolon in block
        .trim();
    } else if (mode === 'html') {
      result = result
        .replace(/<!--[\s\S]*?-->/g, '') // remove comments
        .replace(/>\s+</g, '><') // remove spaces between tags
        .replace(/\s+/g, ' ') // collapse other spaces
        .trim();
    }
    setOutput(result);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
       {/* ── Header ── */}
       <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Minimize2 size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Code Minifier</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Surgical compression for JS, CSS, and HTML assets</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>
        {/* Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
           <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                 <div style={{ display: 'flex', gap: 8 }}>
                    <Tab active={mode === 'js'} onClick={() => setMode('js')} label="JAVASCRIPT" />
                    <Tab active={mode === 'css'} onClick={() => setMode('css')} label="CSS" />
                    <Tab active={mode === 'html'} onClick={() => setMode('html')} label="HTML" />
                 </div>
                 <button onClick={() => setInput('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><RotateCcw size={14} /></button>
              </div>
              <textarea 
                value={input} onChange={e => setInput(e.target.value)}
                placeholder={`Paste your ${mode.toUpperCase()} code here...`}
                style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 8, padding: 16, fontSize: 13, fontFamily: 'var(--font-mono)', background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none', resize: 'none' }}
              />
              <button onClick={minify} style={{
                marginTop: 16, width: '100%', padding: '12px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
                <Zap size={16} fill="white" /> MINIFY CODE
              </button>
           </div>
        </div>

        {/* Output */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1.5px solid var(--border)', borderRadius: 12, background: 'var(--bg-surface)', overflow: 'hidden' }}>
           <div style={{ padding: '12px 20px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>MINIFIED RESULT</span>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                 {output && (
                   <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                     {Math.round(((input.length - output.length) / input.length) * 100)}% Saved
                   </span>
                 )}
                 <button onClick={handleCopy} style={iconBtnStyle}>{copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}</button>
              </div>
           </div>
           <div style={{ flex: 1, padding: 20, overflow: 'auto', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--brand)', wordBreak: 'break-all', background: '#0a0a0c' }}>
             {output || <span style={{ opacity: 0.2 }}>Ready for optimization...</span>}
           </div>
        </div>
      </div>
    </div>
  );
}

function Tab({ active, onClick, label }: any) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 10, fontWeight: 800, 
      background: active ? 'var(--brand)' : 'transparent', color: active ? '#fff' : 'var(--text-muted)'
    }}>
      {label}
    </button>
  );
}

const iconBtnStyle = {
  border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4
};
