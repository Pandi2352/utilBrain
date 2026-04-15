import { useState, useMemo } from 'react';
import { Columns, ArrowRightLeft, Check, RotateCcw, Minus, Plus, FileText, Split } from 'lucide-react';
import * as diff from 'diff';

/* ════════════════════════════════════════════════
   Visual Text Diff Checker — utilBrain
   ════════════════════════════════════════════════ */

export function DiffChecker() {
  const [left, setLeft] = useState('{\n  "name": "utilBrain",\n  "version": "1.0.0",\n  "status": "active"\n}');
  const [right, setRight] = useState('{\n  "name": "utilBrain Suite",\n  "version": "1.1.0",\n  "status": "active",\n  "deployed": true\n}');
  const [copied, setCopied] = useState(false);

  const diffResult = useMemo(() => {
    return diff.diffLines(left, right);
  }, [left, right]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    diffResult.forEach(part => {
      if (part.added) added += part.count || 0;
      if (part.removed) removed += part.count || 0;
    });
    return { added, removed };
  }, [diffResult]);

  const handleClear = () => {
    setLeft('');
    setRight('');
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
       {/* ── Header ── */}
       <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Split size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Visual Diff Checker</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Surgical comparison of text, code, or data structures</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>
        {/* Editor Side */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
              <div style={panelStyle}>
                 <div style={panelHeader}>
                    <span style={panelTitle}>ORIGINAL (LEFT)</span>
                    <button onClick={() => setLeft('')} style={iconBtn}><RotateCcw size={14} /></button>
                 </div>
                 <textarea value={left} onChange={e => setLeft(e.target.value)} placeholder="Paste original text..." style={textareaStyle} />
              </div>
              <div style={panelStyle}>
                 <div style={panelHeader}>
                    <span style={panelTitle}>MODIFIED (RIGHT)</span>
                    <button onClick={() => setRight('')} style={iconBtn}><RotateCcw size={14} /></button>
                 </div>
                 <textarea value={right} onChange={e => setRight(e.target.value)} placeholder="Paste modified text..." style={textareaStyle} />
              </div>
           </div>
           
           <div style={{ display: 'flex', gap: 16, padding: '12px 20px', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                 <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={14} />
                 </div>
                 <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{stats.removed} Deletions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                 <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(34,197,94,0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={14} />
                 </div>
                 <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{stats.added} Additions</span>
              </div>
              <button onClick={handleClear} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>CLEAR ALL</button>
           </div>
        </div>

        {/* Unified Diff View */}
        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', border: '1.5px solid var(--border)', borderRadius: 12, background: 'var(--bg-surface)', overflow: 'hidden' }}>
           <div style={{ ...panelHeader, borderBottom: '1px solid var(--border)' }}>
              <span style={panelTitle}>DIFF VIEW</span>
              <button onClick={() => {
                navigator.clipboard.writeText(left + '\n\nMODIFIED:\n' + right); // Simple copy for now
                setCopied(true);
                setTimeout(()=>setCopied(false), 2000);
              }} style={toolBtn}>
                 {copied ? <Check size={14} /> : <FileText size={14} />} {copied ? 'COPIED' : 'COPY RAW'}
              </button>
           </div>
           
           <div style={{ 
             flex: 1, overflow: 'auto', padding: 20, background: '#0a0a0c', fontSize: 13, fontFamily: 'var(--font-mono)', lineHeight: 1.6
           }}>
              {diffResult.map((part, index) => {
                const color = part.added ? '#22c55e' : part.removed ? '#ef4444' : '#888';
                const bg = part.added ? 'rgba(34,197,94,0.1)' : part.removed ? 'rgba(239,68,68,0.1)' : 'transparent';
                const prefix = part.added ? '+' : part.removed ? '-' : ' ';
                
                return (
                  <div key={index} style={{ 
                    whiteSpace: 'pre-wrap', color, background: bg, 
                    paddingLeft: 4, borderLeft: part.added || part.removed ? `2px solid ${color}` : '2px solid transparent' 
                  }}>
                    {part.value.split('\n').filter((l, i, arr) => i < arr.length - 1 || l.length > 0).map((line, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '25px 1fr' }}>
                         <span style={{ opacity: 0.5, userSelect: 'none' }}>{prefix}</span>
                         <span>{line}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
           </div>
        </div>
      </div>
    </div>
  );
}

const panelStyle = { display: 'flex', flexDirection: 'column', border: '1.5px solid var(--border)', borderRadius: 12, background: 'var(--bg-surface)', overflow: 'hidden' };
const panelHeader = { padding: '12px 16px', background: 'var(--bg-base)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const panelTitle = { fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.08em' };
const textareaStyle = { flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: 16, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', resize: 'none' };
const iconBtn = { border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' };
const toolBtn = { ...iconBtn, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.03)' };
