import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  AlertCircle,
  RefreshCw,
  FileText,
  List,
  AlignLeft,
  BookOpen
} from 'lucide-react';

/* ─── Types ─── */
type SummaryLength = 'Short' | 'Medium' | 'Long';
type SummaryFormat = 'Paragraph' | 'Bullet Points';

interface GeminiPromptResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

export function TextSummarizer() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ub-gemini-key') || '');
  const [model, setModel] = useState(() => {
    const stored = localStorage.getItem('ub-gemini-model');
    return (stored === 'gemini-1.5-flash' || !stored) ? 'gemini-2.5-flash' : stored;
  });
  
  const [inputText, setInputText] = useState('');
  const [length, setLength] = useState<SummaryLength>('Medium');
  const [format, setFormat] = useState<SummaryFormat>('Bullet Points');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('ub-gemini-key', apiKey);
    localStorage.setItem('ub-gemini-model', model);
  }, [apiKey, model]);

  const generateSummary = async () => {
    if (!apiKey) {
      setError('Gemini API Key is required. Please enter it in the configuration bar above.');
      return;
    }

    if (!inputText.trim()) {
      setError('Please provide some text to summarize.');
      return;
    }

    setLoading(true);
    setError(null);
    setSummary('');

    try {
      const lengthInstructions = {
        Short: "Keep the summary very concise (1-3 sentences or points).",
        Medium: "Provide a balanced summary (4-7 sentences or points).",
        Long: "Provide a comprehensive summary covering all key aspects details."
      };

      const formatInstructions = {
        'Paragraph': "Present the summary as a cohesive paragraph.",
        'Bullet Points': "Present the summary as a structured list of bullet points."
      };

      const prompt = `Task: Summarize the following text.\nLength Requirement: ${lengthInstructions[length]}\nFormat Requirement: ${formatInstructions[format]}\n\nText to summarize:\n${inputText}`;

      const contents = [{
        parts: [{ text: prompt }]
      }];

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
        throw new Error((data as any).error?.message || 'Failed to generate summary.');
      }

      const text = data.candidates[0]?.content.parts[0]?.text || '';
      setSummary(text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <BookOpen size={24} style={{ color: 'var(--brand)' }} />
            Text Summarizer
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        
        {/* Left: Tactical Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>Operational Text Input</label>
            <textarea 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Paste long-form text, articles, or reports here for compression..."
              style={{ 
                width: '100%', height: 400, padding: '18px', background: 'var(--bg-surface)', 
                border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 13, 
                color: 'var(--text-primary)', outline: 'none', resize: 'none', fontWeight: 500,
                lineHeight: 1.6
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Length Selector */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>Summary Volume</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <OptionBtn label="Short" active={length === 'Short'} onClick={() => setLength('Short')} />
                <OptionBtn label="Medium" active={length === 'Medium'} onClick={() => setLength('Medium')} />
                <OptionBtn label="Long" active={length === 'Long'} onClick={() => setLength('Long')} />
              </div>
            </div>

            {/* Format Selector */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>Output Format</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                <OptionBtn icon={<AlignLeft size={13} />} label="Paragraph" active={format === 'Paragraph'} onClick={() => setFormat('Paragraph')} />
                <OptionBtn icon={<List size={13} />} label="Bullets" active={format === 'Bullet Points'} onClick={() => setFormat('Bullet Points')} />
              </div>
            </div>
          </div>

          <button 
            onClick={generateSummary}
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
            {loading ? 'ANALYZING SIGNAL...' : 'EXECUTE SUMMARIZATION'}
          </button>
        </div>

        {/* Right: Output Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingLeft: 8 }}>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <h2 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Compressed Output
             </h2>
             {summary && <span style={{ fontSize: 10, fontWeight: 900, background: 'var(--brand)', color: '#fff', padding: '1px 8px', borderRadius: 4 }}>STABLE</span>}
           </div>

           {summary ? (
             <div style={{ 
               padding: '24px', background: 'var(--bg-surface)', 
               border: '1.5px solid var(--border)', borderRadius: 16,
               position: 'relative', flex: 1, minHeight: 400
             }}>
                <div style={{ 
                  fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8, 
                  paddingRight: 40, fontWeight: 500, whiteSpace: 'pre-wrap' 
                }}>
                   {summary}
                </div>
                <button 
                  onClick={copyToClipboard}
                  style={{ 
                    position: 'absolute', top: 20, right: 20, 
                    width: 34, height: 34, borderRadius: 8, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-base)', border: '1.2px solid var(--border)',
                    color: copied ? 'var(--brand)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
             </div>
           ) : (
             <div style={{ flex: 1, border: '1.5px dashed var(--border)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', minHeight: 500 }}>
                <div style={{ textAlign: 'center', opacity: 0.6 }}>
                   <FileText size={52} style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} />
                   <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>IDLE SYSTEM</p>
                   <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>AWAITING INPUT DATA</p>
                </div>
             </div>
           )}

           {/* Surgical Tip */}
           <div style={{ 
             padding: '16px 20px', borderRadius: 10, background: 'var(--bg-surface)', 
             border: '1px solid var(--border)', display: 'flex', gap: 14, alignItems: 'center' 
           }}>
              <div style={{ color: 'var(--brand)', flexShrink: 0 }}>
                 <AlertCircle size={18} />
              </div>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.5 }}>
                 For large documents (over 10,000 words), ensure you are using **gemini-1.5-pro** or higher to prevent token context limitations.
              </p>
           </div>
        </div>

      </div>

    </div>
  );
}

function OptionBtn({ icon, label, active, onClick }: { icon?: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 4px',
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
