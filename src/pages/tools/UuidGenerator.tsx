import { useState, useMemo } from 'react';
import { Hash, Copy, Check, RotateCcw, Plus, Trash2, List } from 'lucide-react';

/* ════════════════════════════════════════════════
   UUID Generator — utilBrain
   ════════════════════════════════════════════════ */

export function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  
  // Options
  const [uppercase, setUppercase] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);

  const generate = () => {
    const newUuids = Array.from({ length: count }, () => generateUuidV4());
    setUuids(newUuids);
  };

  useMemo(() => {
    if (uuids.length === 0) generate();
  }, []);

  const displayedUuids = useMemo(() => {
    return uuids.map(u => {
      let res = u;
      if (noHyphens) res = res.replace(/-/g, '');
      if (uppercase) res = res.toUpperCase();
      return res;
    });
  }, [uuids, uppercase, noHyphens]);

  const copyAll = () => {
    navigator.clipboard.writeText(displayedUuids.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const copyOne = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Hash size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>UUID Generator</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Bulk generate RFC4122 compliant version 4 UUIDs</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        {/* Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Quantity to generate</label>
              <select value={count} onChange={e => setCount(parseInt(e.target.value))} style={selectStyle}>
                {[1, 5, 10, 20, 50, 100].map(n => <option key={n} value={n}>{n} UUIDs</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
               <OptionToggle label="Uppercase" active={uppercase} onToggle={() => setUppercase(!uppercase)} />
               <OptionToggle label="No hyphens" active={noHyphens} onToggle={() => setNoHyphens(!noHyphens)} />
            </div>

            <button onClick={generate} style={{
              width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
              <RotateCcw size={16} /> Regulate Bulk
            </button>
          </div>
        </div>

        {/* Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '12px 20px', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{uuids.length} GENERATED UUIDS</span>
            <button onClick={copyAll} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 6,
              background: 'var(--brand)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer'
            }}>
              {copiedAll ? <Check size={14} /> : <Copy size={14} />}
              {copiedAll ? 'Copied All' : 'Copy All'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {displayedUuids.map((u, i) => (
              <div key={i} style={{ 
                padding: '10px 16px', borderRadius: 8, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 150ms' 
              }}>
                <span style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{u}</span>
                <button onClick={() => copyOne(u, i)} style={{ 
                  border: 'none', background: 'none', padding: 8, cursor: 'pointer', color: copiedIdx === i ? 'var(--success)' : 'var(--text-muted)' 
                }}>
                   {copiedIdx === i ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function generateUuidV4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function OptionToggle({ label, active, onToggle }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-base)', borderRadius: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
      <button onClick={onToggle} style={{ 
        width: 36, height: 20, borderRadius: 10, background: active ? 'var(--brand)' : 'var(--border-strong)', 
        position: 'relative', border: 'none', cursor: 'pointer', transition: 'background 200ms' 
      }}>
        <div style={{ 
          position: 'absolute', top: 2, left: active ? 18 : 2, width: 16, height: 16, 
          borderRadius: 8, background: '#fff', transition: 'left 200ms' 
        }} />
      </button>
    </div>
  );
}

const selectStyle = {
  width: '100%', padding: '10px 12px', fontSize: 14, fontWeight: 600, background: 'var(--bg-base)',
  border: '1.5px solid var(--border)', borderRadius: 6, outline: 'none', color: 'var(--text-primary)', cursor: 'pointer'
};
