import { useState, useMemo } from 'react';
import { Search, Globe, Share2, MessageSquare, Layout, AlertCircle, CheckCircle, Info } from 'lucide-react';

/* ════════════════════════════════════════════════
   Meta Tag Analyzer — utilBrain
   ════════════════════════════════════════════════ */

export function MetaTagAnalyzer() {
  const [html, setHtml] = useState('<html>\n  <head>\n    <title>UtillBrain - Surgical Dev Tools</title>\n    <meta name="description" content="All-in-one platform for developers." />\n  </head>\n</html>');

  const analysis = useMemo(() => {
    if (!html.trim()) return null;
    return extractMetaTags(html);
  }, [html]);

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', overflowY: 'auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Search size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Meta Tag Analyzer</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Extract and audit SEO, OpenGraph, and Twitter tags from HTML snippets</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Input */}
        <div style={{ padding: 24, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12 }}>
           <label style={{ display: 'block', marginBottom: 12, fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)' }}>PASTE HTML SOURCE</label>
           <textarea 
             value={html} onChange={e => setHtml(e.target.value)}
             placeholder="Paste <head> contents or full HTML here..."
             style={{ width: '100%', height: 120, border: '1.5px solid var(--border)', borderRadius: 8, padding: 14, fontSize: 13, fontFamily: 'var(--font-mono)', background: 'var(--bg-base)', color: 'var(--text-primary)', resize: 'none', outline: 'none' }}
           />
        </div>

        {analysis && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
             {/* Basic SEO */}
             <Section title="Basic SEO" icon={<Globe size={16} />}>
                <TagRow label="Title" value={analysis.title} expected="30-60 chars" />
                <TagRow label="Description" value={analysis.description} expected="120-160 chars" />
                <TagRow label="Keywords" value={analysis.keywords} expected="optional" />
                <TagRow label="Charset" value={analysis.charset} expected="UTF-8" />
             </Section>

             {/* Open Graph */}
             <Section title="Open Graph (Facebook)" icon={<Share2 size={16} />}>
                <TagRow label="og:title" value={analysis.ogTitle} />
                <TagRow label="og:description" value={analysis.ogDesc} />
                <TagRow label="og:image" value={analysis.ogImage} />
                <TagRow label="og:url" value={analysis.ogUrl} />
             </Section>

             {/* Twitter Card */}
             <Section title="Twitter Card" icon={<MessageSquare size={16} />}>
                <TagRow label="twitter:card" value={analysis.twCard} />
                <TagRow label="twitter:title" value={analysis.twTitle} />
                <TagRow label="twitter:description" value={analysis.twDesc} />
                <TagRow label="twitter:image" value={analysis.twImage} />
             </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, children }: any) {
  return (
    <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12 }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ color: 'var(--brand)' }}>{icon}</div>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h2>
       </div>
       <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  );
}

function TagRow({ label, value, expected }: { label: string, value?: string, expected?: string }) {
  const missing = !value || value === 'Missing';
  return (
    <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</span>
          {missing ? <AlertCircle size={12} style={{ color: 'var(--error)' }} /> : <CheckCircle size={12} style={{ color: 'var(--success)' }} />}
       </div>
       <div style={{ fontSize: 13, fontWeight: 600, color: missing ? 'var(--text-muted)' : 'var(--text-primary)', wordBreak: 'break-all' }}>
          {value || 'Missing'}
       </div>
       {expected && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Recommended: {expected}</div>}
    </div>
  );
}

function extractMetaTags(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const getMeta = (query: string) => doc.querySelector(query)?.getAttribute('content') || undefined;
  
  return {
    title: doc.title || getMeta('meta[name="title"]'),
    description: getMeta('meta[name="description"]'),
    keywords: getMeta('meta[name="keywords"]'),
    charset: doc.querySelector('meta[charset]')?.getAttribute('charset'),
    
    ogTitle: getMeta('meta[property="og:title"]'),
    ogDesc: getMeta('meta[property="og:description"]'),
    ogImage: getMeta('meta[property="og:image"]'),
    ogUrl: getMeta('meta[property="og:url"]'),
    
    twCard: getMeta('meta[name="twitter:card"]'),
    twTitle: getMeta('meta[name="twitter:title"]'),
    twDesc: getMeta('meta[name="twitter:description"]'),
    twImage: getMeta('meta[name="twitter:image"]'),
  };
}
