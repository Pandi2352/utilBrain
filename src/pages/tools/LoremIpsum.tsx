import { useState, useMemo } from 'react';
import { AlignLeft, Copy, Check, RotateCcw, Type, List, FileText } from 'lucide-react';

/* ════════════════════════════════════════════════
   Lorem Ipsum Generator — utilBrain
   ════════════════════════════════════════════════ */

type LoremType = 'paragraphs' | 'words' | 'lists';

export function LoremIpsum() {
  const [type, setType] = useState<LoremType>('paragraphs');
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [copied, setCopied] = useState(false);

  const generated = useMemo(() => {
    return generateLorem(type, count, startWithLorem);
  }, [type, count, startWithLorem]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generated.join('\n\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', overflowY: 'auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <AlignLeft size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Lorem Ipsum Generator</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Create custom filler text for your designs and mockups</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: 24 }}>
        {/* Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginBottom: 20 }}>
                 <TabBtn active={type === 'paragraphs'} onClick={() => setType('paragraphs')} icon={<FileText size={14} />} label="Paras" />
                 <TabBtn active={type === 'words'} onClick={() => setType('words')} icon={<Type size={14} />} label="Words" />
                 <TabBtn active={type === 'lists'} onClick={() => setType('lists')} icon={<List size={14} />} label="Lists" />
              </div>

              <Field label={`Count (${count})`}>
                 <input type="range" min="1" max={type === 'words' ? 500 : 20} value={count} onChange={e => setCount(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--brand)' }} />
              </Field>

              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                 <input type="checkbox" checked={startWithLorem} onChange={e => setStartWithLorem(e.target.checked)} id="start" />
                 <label htmlFor="start" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Start with "Lorem ipsum..."</label>
              </div>

              <button onClick={handleCopy} style={{
                width: '100%', marginTop: 24, padding: '12px', fontSize: 14, fontWeight: 700, borderRadius: 8,
                background: 'var(--brand)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy All Text'}
              </button>
           </div>
        </div>

        {/* Output */}
        <div style={{ padding: 32, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', minHeight: 400 }}>
           <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
              {type === 'lists' ? (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                   {generated.map((p, i) => <li key={i} style={{ marginBottom: 8 }}>{p}</li>)}
                </ul>
              ) : (
                generated.map((p, i) => <p key={i} style={{ margin: '0 0 16px' }}>{p}</p>)
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 0', border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all 150ms',
      background: active ? 'rgba(79,107,237,0.1)' : 'var(--bg-base)',
      color: active ? 'var(--brand)' : 'var(--text-muted)'
    }}>
       {icon}
       <span style={{ fontSize: 10, fontWeight: 800 }}>{label}</span>
    </button>
  );
}

function Field({ label, children }: any) {
  return <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</label>{children}</div>;
}

const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(' ');

function generateLorem(type: LoremType, count: number, start: boolean) {
  const sentences = [];
  
  if (type === 'words') {
    let result = [];
    if (start) result.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
    for (let i = result.length; i < count; i++) {
      result.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
    }
    return [result.join(' ')];
  }

  const generateSentence = (len: number) => {
    let s = [];
    for (let i = 0; i < len; i++) s.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
    return s.join(' ').charAt(0).toUpperCase() + s.join(' ').slice(1) + '.';
  };

  const generateParagraph = (sCount: number) => {
    let p = [];
    for (let i = 0; i < sCount; i++) p.push(generateSentence(8 + Math.floor(Math.random() * 8)));
    return p.join(' ');
  };

  for (let i = 0; i < count; i++) {
    let p = generateParagraph(4 + Math.floor(Math.random() * 4));
    if (i === 0 && start) {
       p = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + p.slice(0, 1).toLowerCase() + p.slice(1);
    }
    sentences.push(p);
  }

  return sentences;
}
