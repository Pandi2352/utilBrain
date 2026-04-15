import { useState } from 'react';
import { Table, Copy, Check, RotateCcw, ArrowRightLeft, Download, FileJson, FileText } from 'lucide-react';

/* ════════════════════════════════════════════════
   CSV ↔ JSON Converter — utilBrain
   ════════════════════════════════════════════════ */

export function CsvJsonConverter() {
  const [source, setSource] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState<'csv2json' | 'json2csv'>('csv2json');

  const convert = () => {
    if (!source.trim()) return;
    try {
      if (direction === 'csv2json') {
        const rows = source.split('\n').filter(r => r.trim());
        if (rows.length < 1) return;
        const headers = rows[0].split(',').map(h => h.trim());
        const result = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((h, i) => obj[h] = values[i] || '');
          return obj;
        });
        setOutput(JSON.stringify(result, null, 2));
      } else {
        const json = JSON.parse(source);
        if (!Array.isArray(json) || json.length < 1) throw new Error('Input must be an array of objects');
        const headers = Object.keys(json[0]);
        const rows = [headers.join(',')];
        json.forEach((obj: any) => {
          rows.push(headers.map(h => obj[h]).join(','));
        });
        setOutput(rows.join('\n'));
      }
    } catch (e) {
      setOutput(`Error: ${(e as Error).message}`);
    }
  };

  const clear = () => {
    setSource('');
    setOutput('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([output], { type: direction === 'csv2json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted-${Date.now()}.${direction === 'csv2json' ? 'json' : 'csv'}`;
    link.click();
  };

  return (
    <div style={{ padding: '28px 28px 40px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Table size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>CSV ↔ JSON Converter</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Seamlessly transform data between spreadsheet and developer formats</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Source Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
           <div style={{ padding: '12px 16px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {direction === 'csv2json' ? 'Source CSV' : 'Source JSON'}
              </span>
              <button onClick={clear} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><RotateCcw size={14} /></button>
           </div>
           <textarea 
             value={source} onChange={e => setSource(e.target.value)}
             placeholder={direction === 'csv2json' ? "name,email,age\nJohn,john@example.com,25" : '[{"name":"John","age":25}]'}
             style={{ flex: 1, border: 'none', outline: 'none', padding: 20, fontSize: 13, fontFamily: 'var(--font-mono)', background: 'transparent', color: 'var(--text-primary)', resize: 'none' }}
           />
        </div>

        {/* Action Column */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
           <button onClick={() => setDirection(direction === 'csv2json' ? 'json2csv' : 'csv2json')} style={actionBtnStyle}>
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
                {direction === 'csv2json' ? 'JSON Result' : 'CSV Result'}
              </span>
              <div style={{ display: 'flex', gap: 12 }}>
                 <button onClick={handleCopy} style={iconBtnStyle}>{copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}</button>
                 <button onClick={download} style={iconBtnStyle}><Download size={14} /></button>
              </div>
           </div>
           <textarea 
             readOnly value={output}
             style={{ flex: 1, border: 'none', outline: 'none', padding: 20, fontSize: 13, fontFamily: 'var(--font-mono)', background: 'transparent', color: 'var(--brand)', resize: 'none' }}
           />
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
