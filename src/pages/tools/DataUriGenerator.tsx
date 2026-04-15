import { useState, useRef } from 'react';
import { FileCode, Upload, Copy, Check, RotateCcw, ImageIcon, File, Info } from 'lucide-react';

/* ════════════════════════════════════════════════
   Data URI Generator — utilBrain
   ════════════════════════════════════════════════ */

export function DataUriGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [dataUri, setDataUri] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (f: File) => {
    if (f.size > 2 * 1024 * 1024) {
      alert("File is too large! Please use files under 2MB for efficiency.");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setDataUri(result);
      if (f.type.startsWith('image/')) {
        setPreview(result);
        const img = new Image();
        img.onload = () => setDimensions({ w: img.width, h: img.height });
        img.src = result;
      } else {
        setPreview(null);
        setDimensions(null);
      }
    };
    reader.readAsDataURL(f);
  };

  const handleCopy = (txt: string, key: string) => {
    if (!txt) return;
    navigator.clipboard.writeText(txt);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const reset = () => {
    setFile(null);
    setDataUri('');
    setPreview(null);
    setDimensions(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', overflowY: 'auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <FileCode size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Data URI Generator</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Surgical asset encoder for localized web resources</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
        {/* Left Column: Upload & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <div 
             onClick={() => fileInputRef.current?.click()}
             onDragOver={e => e.preventDefault()}
             onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) processFile(f); }}
             style={{ 
               padding: 50, border: '2.5px dashed var(--border)', borderRadius: 12, background: 'var(--bg-surface)', 
               display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, 
               cursor: 'pointer', transition: 'all 200ms ease'
             }}
           >
              <div style={{ width: 44, height: 44, borderRadius: 22, background: 'rgba(79,107,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                <Upload size={22} />
              </div>
              <div style={{ textAlign: 'center' }}>
                 <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Drop asset here</p>
                 <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Images, SVGs, or Web Fonts (Max 2MB)</p>
              </div>
              <input ref={fileInputRef} type="file" onChange={e => { const f = e.target.files?.[0]; if(f) processFile(f); }} style={{ display: 'none' }} />
           </div>

           {file && (
             <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                   <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                      {preview ? <ImageIcon size={16} /> : <File size={16} />}
                   </div>
                   <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{(file.size / 1024).toFixed(1)} KB • {file.type || 'Binary'}</p>
                   </div>
                   <button onClick={reset} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><RotateCcw size={14} /></button>
                </div>

                {dimensions && (
                  <div style={{ display: 'flex', gap: 20, padding: '12px 14px', background: 'var(--bg-base)', borderRadius: 6, border: '1px solid var(--border)' }}>
                     <div>
                        <p style={{ margin: 0, fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Width</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{dimensions.w}px</p>
                     </div>
                     <div style={{ width: 1, background: 'var(--border)' }} />
                     <div>
                        <p style={{ margin: 0, fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Height</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{dimensions.h}px</p>
                     </div>
                  </div>
                )}
             </div>
           )}

           {preview && (
              <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 8 }}>
                 <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>PREVIEW</p>
                 <div style={{ 
                   background: 'white', borderRadius: 4, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120, 
                   backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 0)', backgroundSize: '10px 10px' 
                 }}>
                   <img src={preview} style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }} />
                 </div>
              </div>
           )}
        </div>

        {/* Right Column: Multi-Format Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <OutputBlock 
              label="RAW ENCODING" 
              value={dataUri} 
              onCopy={() => handleCopy(dataUri, 'raw')} 
              active={copiedKey === 'raw'}
           />
           <OutputBlock 
              label="HTML EMBED" 
              value={dataUri ? `<img src="${dataUri}" width="${dimensions?.w || ''}" height="${dimensions?.h || ''}" alt="" />` : ''} 
              onCopy={() => handleCopy(dataUri ? `<img src="${dataUri}" width="${dimensions?.w || ''}" height="${dimensions?.h || ''}" alt="" />` : '', 'html')} 
              active={copiedKey === 'html'}
           />
           <OutputBlock 
              label="CSS PROPERTY" 
              value={dataUri ? `background-image: url("${dataUri}");` : ''} 
              onCopy={() => handleCopy(dataUri ? `background-image: url("${dataUri}");` : '', 'css')} 
              active={copiedKey === 'css'}
           />

           <div style={{ marginTop: 'auto', padding: 16, border: '1.5px dashed var(--border)', borderRadius: 8, display: 'flex', gap: 12, background: 'rgba(79,107,237,0.02)' }}>
              <Info size={16} style={{ color: 'var(--brand)', shrink: 0 }} />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <b>Data URIs</b> are great for tiny icons and assets to reduce HTTP requests, but increase file size by ~33%. Use sparingly for large images.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function OutputBlock({ label, value, onCopy, active }: any) {
  return (
    <div style={{ border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--bg-surface)', overflow: 'hidden' }}>
       <div style={{ padding: '10px 16px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>{label}</span>
          <button onClick={onCopy} style={{ border: 'none', background: 'none', cursor: 'pointer', color: active ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800 }}>
             {active ? <Check size={14} /> : <Copy size={14} />} {active ? 'COPIED' : 'COPY'}
          </button>
       </div>
       <div style={{ 
         padding: 20, height: 100, overflow: 'auto', fontSize: 12, fontFamily: 'var(--font-mono)', 
         color: value ? 'var(--brand)' : 'var(--text-muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.5
       }}>
          {value || 'Awaiting asset upload...'}
       </div>
    </div>
  );
}
