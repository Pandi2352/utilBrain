import { useState, useMemo } from 'react';
import { Network, FileCode, Copy, Check, RotateCcw, Download, Plus, List } from 'lucide-react';

/* ════════════════════════════════════════════════
   Sitemap Generator — utilBrain
   ════════════════════════════════════════════════ */

export function SitemapGenerator() {
  const [urls, setUrls] = useState('https://example.com/\nhttps://example.com/about\nhttps://example.com/contact');
  const [freq, setFreq] = useState('daily');
  const [priority, setPriority] = useState('0.8');
  const [copied, setCopied] = useState(false);

  const xml = useMemo(() => {
    if (!urls.trim()) return '';
    const urlList = urls.split('\n').filter(u => u.trim());
    const date = new Date().toISOString().split('T')[0];
    
    let result = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    urlList.forEach(u => {
       result += `  <url>\n`;
       result += `    <loc>${u.trim()}</loc>\n`;
       result += `    <lastmod>${date}</lastmod>\n`;
       result += `    <changefreq>${freq}</changefreq>\n`;
       result += `    <priority>${priority}</priority>\n`;
       result += `  </url>\n`;
    });
    
    result += `</urlset>`;
    return result;
  }, [urls, freq, priority]);

  const handleCopy = () => {
    navigator.clipboard.writeText(xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sitemap.xml`;
    link.click();
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Network size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>XML Sitemap Generator</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Create search-engine compliant sitemaps from your page list</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flex: 1, minHeight: 0 }}>
        {/* Editor */}
        <div style={{ flex: '0 0 380px', display: 'flex', flexDirection: 'column', gap: 16 }}>
           <div style={{ padding: 24, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                 <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)' }}>PAGE URLS (ONE PER LINE)</label>
                 <button onClick={() => setUrls('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><RotateCcw size={14} /></button>
              </div>
              <textarea 
                value={urls} onChange={e => setUrls(e.target.value)}
                placeholder="https://example.com/..."
                style={{ width: '100%', height: 250, border: '1.5px solid var(--border)', borderRadius: 8, padding: 14, fontSize: 13, fontFamily: 'var(--font-mono)', background: 'var(--bg-base)', color: 'var(--text-primary)', resize: 'none', outline: 'none' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                 <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Change Freq</label>
                    <select value={freq} onChange={e => setFreq(e.target.value)} style={selectStyle}>
                       <option value="always">Always</option>
                       <option value="hourly">Hourly</option>
                       <option value="daily">Daily</option>
                       <option value="weekly">Weekly</option>
                       <option value="monthly">Monthly</option>
                    </select>
                 </div>
                 <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value)} style={selectStyle}>
                       <option value="1.0">1.0 (Highest)</option>
                       <option value="0.8">0.8</option>
                       <option value="0.5">0.5 (Default)</option>
                       <option value="0.3">0.3</option>
                    </select>
                 </div>
              </div>
           </div>
           
           <div style={{ padding: 16, background: 'rgba(7,20,40,0.03)', border: '1.5px dashed var(--border)', borderRadius: 8, display: 'flex', gap: 10 }}>
              <List size={16} style={{ color: 'var(--brand)', marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                 Tip: Include your full domain URL (https://) for better indexing. The generator automatically adds current date for <code>lastmod</code>.
              </p>
           </div>
        </div>

        {/* Preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1.5px solid var(--border)', borderRadius: 12, background: 'var(--bg-surface)', overflow: 'hidden' }}>
           <div style={{ padding: '12px 20px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileCode size={14} style={{ color: 'var(--brand)' }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>SITEMAP.XML PREVIEW</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                 <button onClick={handleCopy} style={toolBtnStyle}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy XML'}</button>
                 <button onClick={download} style={{ ...toolBtnStyle, background: 'var(--brand)', color: '#fff', border: 'none' }}><Download size={14} /> Download</button>
              </div>
           </div>
            <div style={{ 
              flex: 1, padding: 24, overflow: 'auto', fontSize: 13, fontFamily: 'var(--font-mono)', 
              color: '#d1d5db', background: '#0a0a0c', lineHeight: 1.6
            }}>
             <pre style={{ margin: 0, whiteSpace: 'pre' }}>{xml || '// Resulting XML will appear here...'}</pre>
           </div>
        </div>
      </div>
    </div>
  );
}

const selectStyle = {
  width: '100%', padding: '8px 10px', fontSize: 13, fontWeight: 600, background: 'var(--bg-base)',
  border: '1.5px solid var(--border)', borderRadius: 6, outline: 'none', color: 'var(--text-primary)'
};

const toolBtnStyle = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 6,
  background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1.5px solid var(--border)',
  fontSize: 12, fontWeight: 700, cursor: 'pointer'
};
