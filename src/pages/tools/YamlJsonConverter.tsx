import { useState } from 'react';
import { ArrowRightLeft, Copy, Check, RotateCcw, FileCode, Download } from 'lucide-react';
import yaml from 'js-yaml';

/* ════════════════════════════════════════════════
   YAML ↔ JSON Converter — utilBrain
   ════════════════════════════════════════════════ */

export function YamlJsonConverter() {
  const [source, setSource] = useState('');
  const [output, setOutput] = useState('');
  const [direction, setDirection] = useState<'yaml2json' | 'json2xml'>('yaml2json'); // Using keys for direction
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = () => {
    if (!source.trim()) return;
    setError(null);
    try {
      if (direction === 'yaml2json') {
        const obj = yaml.load(source);
        setOutput(JSON.stringify(obj, null, 2));
      } else {
        const obj = JSON.parse(source);
        setOutput(yaml.dump(obj));
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const swap = () => {
    setDirection(direction === 'yaml2json' ? 'json2xml' : 'yaml2json');
    setSource(output);
    setOutput('');
    setError(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const ext = direction === 'yaml2json' ? 'json' : 'yaml';
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted-${Date.now()}.${ext}`;
    link.click();
  };

  return (
    <div style={{ padding: '28px 28px 40px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <FileCode size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>YAML ↔ JSON Converter</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>High-performance translation between YAML and JSON formats</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Source Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
           <div style={{ padding: '12px 16px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {direction === 'yaml2json' ? 'Input YAML' : 'Input JSON'}
              </span>
              <button onClick={() => setSource('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><RotateCcw size={14} /></button>
           </div>
           <textarea 
             value={source} onChange={e => setSource(e.target.value)}
             placeholder={direction === 'yaml2json' ? "key: value\nlist:\n  - item" : '{\n  "key": "value"\n}'}
             style={{ flex: 1, border: 'none', outline: 'none', padding: 20, fontSize: 13, fontFamily: 'var(--font-mono)', background: 'transparent', color: 'var(--text-primary)', resize: 'none' }}
           />
        </div>

        {/* Action Column */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
           <button onClick={swap} style={actionBtnStyle} title="Swap direction">
              <ArrowRightLeft size={18} />
           </button>
           <button onClick={convert} style={{ ...actionBtnStyle, background: 'var(--brand)', color: '#fff', border: 'none' }}>
              CONVERT
           </button>
        </div>

        {/* Output Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
           <div style={{ padding: '12px 16px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {direction === 'yaml2json' ? 'Result JSON' : 'Result YAML'}
              </span>
              <div style={{ display: 'flex', gap: 12 }}>
                 <button onClick={handleCopy} style={iconBtnStyle}>{copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}</button>
                 <button onClick={download} style={iconBtnStyle}><Download size={14} /></button>
              </div>
           </div>
           <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              <textarea 
                readOnly value={output}
                style={{ width: '100%', height: '100%', border: 'none', outline: 'none', padding: 20, fontSize: 13, fontFamily: 'var(--font-mono)', background: 'transparent', color: 'var(--brand)', resize: 'none' }}
              />
              {error && (
                <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, padding: '10px 14px', background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', fontSize: 11, fontWeight: 700, borderRadius: 6 }}>
                  Error: {error}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

const actionBtnStyle = {
  width: 100, padding: '12px 0', border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--bg-surface)', 
  color: 'var(--text-primary)', fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexDirection: 'column' as const
};

const iconBtnStyle = {
  border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4
};
