import { useState, useMemo } from 'react';
import { CaseSensitive, Copy, Check, RotateCcw, Type, AlignLeft } from 'lucide-react';

/* ════════════════════════════════════════════════
   Text Case Converter — utilBrain
   ════════════════════════════════════════════════ */

type CaseMode = 'lower' | 'upper' | 'title' | 'sentence' | 'snake' | 'kebab' | 'camel' | 'pascal';

export function CaseConverter() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!input.trim()) return {};
    return {
      lower: input.toLowerCase(),
      upper: input.toUpperCase(),
      title: toTitleCase(input),
      sentence: toSentenceCase(input),
      snake: toSnakeCase(input),
      kebab: toKebabCase(input),
      camel: toCamelCase(input),
      pascal: toPascalCase(input)
    };
  }, [input]);

  const handleCopy = (val: string, key: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', overflowY: 'auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <CaseSensitive size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Text Case Converter</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Perform 8+ different case transformations on your text instantly</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
         {/* Input area */}
         <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
               <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)' }}>INPUT TEXT</label>
               <button onClick={() => setInput('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><RotateCcw size={14} /></button>
            </div>
            <textarea 
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="Type or paste your text here..."
              style={{ width: '100%', height: 120, border: '1.5px solid var(--border)', borderRadius: 8, padding: 16, fontSize: 15, fontFamily: 'inherit', outline: 'none', background: 'var(--bg-base)', color: 'var(--text-primary)', resize: 'none' }}
            />
         </div>

         {/* Results grid */}
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
             <ResultCard label="LOWERCASE" value={results.lower} onCopy={() => handleCopy(results.lower!, 'lower')} active={copied === 'lower'} />
             <ResultCard label="UPPERCASE" value={results.upper} onCopy={() => handleCopy(results.upper!, 'upper')} active={copied === 'upper'} />
             <ResultCard label="TITLE CASE" value={results.title} onCopy={() => handleCopy(results.title!, 'title')} active={copied === 'title'} />
             <ResultCard label="SENTENCE CASE" value={results.sentence} onCopy={() => handleCopy(results.sentence!, 'sentence')} active={copied === 'sentence'} />
             <ResultCard label="SNAKE_CASE" value={results.snake} onCopy={() => handleCopy(results.snake!, 'snake')} active={copied === 'snake'} />
             <ResultCard label="KEBAB-CASE" value={results.kebab} onCopy={() => handleCopy(results.kebab!, 'kebab')} active={copied === 'kebab'} />
             <ResultCard label="camelCase" value={results.camel} onCopy={() => handleCopy(results.camel!, 'camel')} active={copied === 'camel'} />
             <ResultCard label="PascalCase" value={results.pascal} onCopy={() => handleCopy(results.pascal!, 'pascal')} active={copied === 'pascal'} />
         </div>
      </div>
    </div>
  );
}

function ResultCard({ label, value, onCopy, active }: any) {
  return (
    <div style={{ padding: 16, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{label}</span>
          <button onClick={onCopy} style={{ border: 'none', background: 'none', cursor: 'pointer', color: active ? 'var(--success)' : 'var(--text-muted)', padding: 2 }}>
             {active ? <Check size={13} /> : <Copy size={13} />}
          </button>
       </div>
       <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all', minHeight: 20, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value || <span style={{ opacity: 0.2 }}>Preview...</span>}
       </div>
    </div>
  );
}

/* ── Case Transform Helpers ── */

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function toSentenceCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function toSnakeCase(str: string) {
  return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map(x => x.toLowerCase()).join('_') || str;
}

function toKebabCase(str: string) {
  return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map(x => x.toLowerCase()).join('-') || str;
}

function toCamelCase(str: string) {
  const s = toPascalCase(str);
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function toPascalCase(str: string) {
  return str.match(/[a-z0-9]+/gi)
    ?.map(word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()).join('') || str;
}
