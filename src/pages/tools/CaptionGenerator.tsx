import { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Sparkles, 
  Copy, 
  Check, 
  AlertCircle,
  Smile,
  Briefcase,
  Heart,
  RefreshCw,
  X,
} from 'lucide-react';

/* ─── Types ─── */
type Tone = 'Funny' | 'Professional' | 'Inspirational' | 'Minimalist' | 'Excited';

interface GeminiPromptResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

export function CaptionGenerator() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ub-gemini-key') || '');
  const [model, setModel] = useState(() => {
    const stored = localStorage.getItem('ub-gemini-model');
    return (stored === 'gemini-1.5-flash' || !stored) ? 'gemini-2.5-flash' : stored;
  });
  
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [topic, setTopic] = useState('');
  const [selectedTone, setSelectedTone] = useState<Tone>('Funny');
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('ub-gemini-key', apiKey);
    localStorage.setItem('ub-gemini-model', model);
  }, [apiKey, model]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const generateCaptions = async () => {
    if (!apiKey) {
      setError('Gemini API Key is required. Please enter it in the configuration bar above.');
      return;
    }

    setLoading(true);
    setError(null);
    setCaptions([]);

    try {
      const tonePrompts: Record<Tone, string> = {
        Funny: "Write 3 witty, humorous, and clever captions for this image. Include relevant emojis.",
        Professional: "Write 3 professional, polished, and industry-appropriate captions for this image. Good for LinkedIn.",
        Inspirational: "Write 3 deep, motivational, and inspirational captions for this image.",
        Minimalist: "Write 3 short (max 5 words), aesthetic, and minimalist captions for this image.",
        Excited: "Write 3 high-energy, enthusiastic, and exciting captions for this image with lots of exclamation marks."
      };

      const prompt = `Topic/Context: ${topic || 'General'}\nTone: ${selectedTone}\n\nTask: ${tonePrompts[selectedTone]} Provide only the captions, one per line. No labels like "Caption 1:".`;

      let contents: any[] = [];
      
      if (imageFile) {
        const base64 = await fileToBase64(imageFile);
        contents = [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: imageFile.type, data: base64 } }
          ]
        }];
      } else {
        contents = [{
          parts: [{ text: prompt + " (Assume the context is based on the provided topic)" }]
        }];
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        }
      );

      const data: GeminiPromptResponse = await response.json();
      
      if (!response.ok) {
        throw new Error((data as any).error?.message || 'Failed to generate captions. Check your API key and model ID.');
      }

      const text = data.candidates[0]?.content.parts[0]?.text || '';
      const list = text.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
      setCaptions(list);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}>
      
      {/* Surgical Top Bar: Title & Config */}
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        marginBottom: 28, paddingBottom: 20, borderBottom: '1.5px solid var(--border)' 
      }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={24} style={{ color: 'var(--brand)' }} />
            AI Caption Generator
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
             Direct Gemini 1.5/2.5 Intelligence Layer
          </p>
        </div>

        {/* Compact Configuration Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>API Key</label>
              <input 
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Gemini Key..."
                style={{ 
                  width: 280, padding: '7px 10px', background: 'var(--bg-surface)', 
                  border: '1.5px solid var(--border)', borderRadius: 6, 
                  fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', outline: 'none' 
                }}
              />
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Engine ID</label>
              <input 
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="Model ID..."
                style={{ 
                  width: 200, padding: '7px 10px', background: 'var(--bg-surface)', 
                  border: '1.5px solid var(--border)', borderRadius: 6, 
                  fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', outline: 'none' 
                }}
              />
           </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={{ 
          marginBottom: 24, padding: '12px 18px', background: 'rgba(239,68,68,0.1)', 
          borderLeft: '4px solid #ef4444', borderRadius: '0 8px 8px 0', 
          display: 'flex', alignItems: 'center', gap: 12, color: '#b91c1c', fontSize: 13, fontWeight: 700 
        }}>
           <AlertCircle size={18} />
           {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 1fr', gap: 32 }}>
        
        {/* Left: Tactical Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Image Upload Area */}
          <div 
             onClick={() => fileInputRef.current?.click()}
             onDragOver={e => e.preventDefault()}
             onDrop={e => {
               e.preventDefault();
               const file = e.dataTransfer.files[0];
               if (file) {
                 setImageFile(file);
                 const reader = new FileReader();
                 reader.onloadend = () => setImage(reader.result as string);
                 reader.readAsDataURL(file);
               }
             }}
             style={{ 
               height: 340, border: `2px dashed ${image ? 'var(--brand)' : 'var(--border)'}`, 
               borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
               cursor: 'pointer', background: 'var(--bg-surface)',
               position: 'relative', overflow: 'hidden', transition: 'all 200ms'
             }}
          >
            {image ? (
               <>
                 <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                 <button 
                   onClick={(e) => { e.stopPropagation(); setImage(null); setImageFile(null); }}
                   style={{ 
                     position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 8, 
                     background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', 
                     display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
                   }}
                 >
                   <X size={16} />
                 </button>
               </>
            ) : (
               <div style={{ textAlign: 'center' }}>
                 <div style={{ 
                   width: 52, height: 52, background: 'var(--bg-base)', borderRadius: 12, 
                   display: 'flex', alignItems: 'center', justifyContent: 'center', 
                   margin: '0 auto 16px', color: 'var(--text-muted)', border: '1.5px solid var(--border)' 
                 }}>
                    <Upload size={24} />
                 </div>
                 <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>DEPOSIT IMAGE TO ANALYZE</p>
                 <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>OR CLICK TO BROWSE LOCAL FILES</p>
               </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
            {/* Tone Selector */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>Vibe / Objective</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                <ToneBtn icon={<Smile size={13} />} label="Funny" active={selectedTone === 'Funny'} onClick={() => setSelectedTone('Funny')} />
                <ToneBtn icon={<Briefcase size={13} />} label="Professional" active={selectedTone === 'Professional'} onClick={() => setSelectedTone('Professional')} />
                <ToneBtn icon={<Heart size={13} />} label="Inspire" active={selectedTone === 'Inspirational'} onClick={() => setSelectedTone('Inspirational')} />
                <ToneBtn icon={<RefreshCw size={13} />} label="Minimal" active={selectedTone === 'Minimalist'} onClick={() => setSelectedTone('Minimalist')} />
                <ToneBtn icon={<Sparkles size={13} />} label="Excited" active={selectedTone === 'Excited'} onClick={() => setSelectedTone('Excited')} />
              </div>
            </div>

            {/* Context Input */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>Operational Context (Optional)</label>
              <textarea 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Provide additional context for the machine..."
                style={{ 
                  width: '100%', height: 90, padding: '14px', background: 'var(--bg-surface)', 
                  border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, 
                  color: 'var(--text-primary)', outline: 'none', resize: 'none', fontWeight: 500 
                }}
              />
            </div>
          </div>

          <button 
            onClick={generateCaptions}
            disabled={loading}
            style={{ 
              width: '100%', padding: '16px', background: 'var(--brand)', 
              color: '#fff', border: 'none', borderRadius: 10, 
              fontSize: 14, fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: loading ? 0.8 : 1
            }}
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} fill="currentColor" />}
            {loading ? 'PROCESSING SIGNAL...' : 'EXECUTE GENERATION'}
          </button>
        </div>

        {/* Right: Output Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingLeft: 8 }}>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <h2 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Synthetic Output
             </h2>
             {captions.length > 0 && <span style={{ fontSize: 10, fontWeight: 900, background: 'var(--brand)', color: '#fff', padding: '1px 8px', borderRadius: 4 }}>READY</span>}
           </div>

           {captions.length > 0 ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {captions.map((cap, i) => (
                  <div key={i} style={{ 
                    padding: '24px', background: 'var(--bg-surface)', 
                    border: '1.5px solid var(--border)', borderRadius: 12,
                    position: 'relative', transition: 'border-color 200ms'
                  }} className="caption-result-card" onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, paddingRight: 40, fontWeight: 500 }}>
                       {cap}
                    </p>
                    <button 
                      onClick={() => copyToClipboard(cap, i)}
                      style={{ 
                        position: 'absolute', top: 20, right: 20, 
                        width: 34, height: 34, borderRadius: 8, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--bg-base)', border: '1.2px solid var(--border)',
                        color: copiedIndex === i ? 'var(--brand)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {copiedIndex === i ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                ))}
             </div>
           ) : (
             <div style={{ flex: 1, border: '1.5px dashed var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', minHeight: 400 }}>
                <div style={{ textAlign: 'center', opacity: 0.6 }}>
                   <ImageIcon size={52} style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} />
                   <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>NO DATA STREAMING</p>
                   <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>UPLOAD IMAGE TO COMMENCE</p>
                </div>
             </div>
           )}

           {/* Surgical Notes */}
           <div style={{ 
             padding: '16px 20px', borderRadius: 10, background: 'var(--bg-surface)', 
             border: '1px solid var(--border)', display: 'flex', gap: 14, alignItems: 'center' 
           }}>
              <div style={{ color: 'var(--brand)', flexShrink: 0 }}>
                 <AlertCircle size={18} />
              </div>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.5 }}>
                 Models like **gemini-2.5-flash** are prioritized for high-speed inference. For complex scene interpretation, switch to a **Pro** variant via the Engine ID field.
              </p>
           </div>
        </div>

      </div>

    </div>
  );
}

function ToneBtn({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 4px',
        background: active ? 'rgba(79,107,237,0.1)' : 'var(--bg-surface)',
        color: active ? 'var(--brand)' : 'var(--text-muted)',
        border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
        borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: 'pointer',
        transition: 'all 150ms ease', textTransform: 'uppercase', letterSpacing: '0.04em'
      }}
    >
      {icon}
      {label}
    </button>
  );
}
