import { useState, useEffect } from 'react';
import { Lock, Copy, Check, RotateCcw, Shield } from 'lucide-react';

/* ════════════════════════════════════════════════
   Hash Generator — utilBrain
   ════════════════════════════════════════════════ */

type Algo = 'SHA-1' | 'SHA-256' | 'SHA-512';

export function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({
    'SHA-1': '',
    'SHA-256': '',
    'SHA-512': '',
  });
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const updateHashes = async () => {
      if (!input) {
        setHashes({ 'SHA-1': '', 'SHA-256': '', 'SHA-512': '' });
        return;
      }
      
      const algos: Algo[] = ['SHA-1', 'SHA-256', 'SHA-512'];
      const newHashes: any = {};
      
      for (const algo of algos) {
        try {
          const msgUint8 = new TextEncoder().encode(input);
          const hashBuffer = await crypto.subtle.digest(algo, msgUint8);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          newHashes[algo] = hashHex;
        } catch (e) {
          newHashes[algo] = 'Error calculating';
        }
      }
      setHashes(newHashes);
    };

    updateHashes();
  }, [input]);

  const handleCopy = (algo: string) => {
    navigator.clipboard.writeText(hashes[algo]);
    setCopied(algo);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Lock size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Hash Generator</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Securely generate cryptographic hashes from text</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, maxWidth: 900 }}>
        {/* Input area */}
        <div style={{ padding: 24, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <label style={{ display: 'block', marginBottom: 10, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Input Text</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste or type your text here..."
            rows={5}
            style={{
              width: '100%', padding: '16px', fontSize: 15, fontFamily: 'var(--font-mono)',
              background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
              outline: 'none', color: 'var(--text-primary)', resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button onClick={() => setInput('')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <RotateCcw size={13} /> Clear Input
            </button>
          </div>
        </div>

        {/* Output area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(hashes).map(([algo, value]) => (
            <div key={algo} style={{ padding: '16px 20px', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={14} style={{ color: 'var(--brand)' }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{algo}</span>
                </div>
                {value && (
                  <button onClick={() => handleCopy(algo)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                    fontSize: 12, fontWeight: 700, color: copied === algo ? 'var(--brand)' : 'var(--text-muted)',
                    background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer'
                  }}>
                    {copied === algo ? <Check size={13} /> : <Copy size={13} />}
                    {copied === algo ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <div style={{
                padding: '12px 14px', background: 'var(--bg-base)', borderRadius: 6,
                fontSize: 13, fontFamily: 'var(--font-mono)', color: value ? 'var(--text-primary)' : 'var(--text-muted)',
                wordBreak: 'break-all', lineHeight: 1.5, minHeight: 40, display: 'flex', alignItems: 'center'
              }}>
                {value || 'Hash will appear here...'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
