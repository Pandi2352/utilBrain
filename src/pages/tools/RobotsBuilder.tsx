import { useState, useMemo } from 'react';
import { Bot, FileText, Copy, Check, RotateCcw, Download, Plus, Trash2 } from 'lucide-react';

/* ════════════════════════════════════════════════
   Robots.txt Builder — utilBrain
   ════════════════════════════════════════════════ */

interface Rule {
  id: string;
  agent: string;
  type: 'Allow' | 'Disallow';
  path: string;
}

export function RobotsBuilder() {
  const [sitemap, setSitemap] = useState('https://example.com/sitemap.xml');
  const [rules, setRules] = useState<Rule[]>([
    { id: '1', agent: '*', type: 'Disallow', path: '/admin/' },
    { id: '2', agent: '*', type: 'Allow', path: '/' }
  ]);
  const [copied, setCopied] = useState(false);

  const txt = useMemo(() => {
    let result = '';
    if (sitemap) result += `Sitemap: ${sitemap}\n\n`;
    rules.forEach(r => {
      result += `User-agent: ${r.agent}\n${r.type}: ${r.path}\n\n`;
    });
    return result.trim();
  }, [sitemap, rules]);

  const addRule = () => {
    setRules([...rules, { id: Date.now().toString(), agent: '*', type: 'Disallow', path: '/' }]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, field: keyof Rule, val: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
       {/* ── Header ── */}
       <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Bot size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Robots.txt Builder</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Generate compliant instructions for search engine crawlers</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 450px) 1fr', gap: 24, flex: 1 }}>
        {/* Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
           <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12 }}>
              <label style={labelStyle}>SITEMAP URL</label>
              <input value={sitemap} onChange={e => setSitemap(e.target.value)} placeholder="https://..." style={inputStyle} />
           </div>

           <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                 <label style={labelStyle}>CRAWLER RULES</label>
                 <button onClick={addRule} style={{ border: 'none', background: 'var(--brand)', color: '#fff', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Plus size={12} /> ADD RULE
                 </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 {rules.map(r => (
                   <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '80px 100px 1fr 30px', gap: 8, alignItems: 'center' }}>
                      <input value={r.agent} onChange={e => updateRule(r.id, 'agent', e.target.value)} style={smallInputStyle} />
                      <select value={r.type} onChange={e => updateRule(r.id, 'type', e.target.value as any)} style={smallSelectStyle}>
                         <option>Allow</option>
                         <option>Disallow</option>
                      </select>
                      <input value={r.path} onChange={e => updateRule(r.id, 'path', e.target.value)} style={smallInputStyle} />
                      <button onClick={() => removeRule(r.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--error)' }}><Trash2 size={14} /></button>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', border: '1.5px solid var(--border)', borderRadius: 12, background: '#1c1c1f', overflow: 'hidden' }}>
           <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={14} style={{ color: 'var(--brand)' }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#888', letterSpacing: '0.05em' }}>ROBOTS.TXT PREVIEW</span>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(txt); setCopied(true); setTimeout(()=>setCopied(false), 2000); }} style={toolBtnStyle}>
                 {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
              </button>
           </div>
           <pre style={{ margin: 0, padding: 24, fontSize: 14, fontFamily: 'var(--font-mono)', color: '#fff', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
             {txt}
           </pre>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.03em' };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 6, background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none', fontSize: 13, fontWeight: 600 };
const smallInputStyle = { ...inputStyle, padding: '6px 8px', fontSize: 12 };
const smallSelectStyle = { ...smallInputStyle };
const toolBtnStyle = { border: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 };
