import { useState, useMemo } from 'react';
import { Palette, Copy, Check, RotateCcw, Hash, Plus, Settings2, Trash2 } from 'lucide-react';

/* ════════════════════════════════════════════════
   Color Palette Generator — utilBrain
   ════════════════════════════════════════════════ */

type ColorMode = 'random' | 'monochrome' | 'analogous' | 'complementary' | 'triadic';

export function ColorPaletteGenerator() {
  const [baseColor, setBaseColor] = useState('#4f6bed'); // Default brand color
  const [mode, setMode]           = useState<ColorMode>('monochrome');
  const [count, setCount]         = useState(5);
  const [palette, setPalette]     = useState<string[]>([]);
  const [copied, setCopied]       = useState<string | null>(null);

  const generate = () => {
    let newPalette: string[] = [];
    
    if (mode === 'random') {
      for (let i = 0; i < count; i++) {
        newPalette.push(randomHex());
      }
    } else {
      newPalette = generateFromBase(baseColor, mode, count);
    }
    setPalette(newPalette);
  };

  // Initial generate
  useMemo(() => {
    if (palette.length === 0) {
      setPalette(generateFromBase(baseColor, 'monochrome', 5));
    }
  }, []);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Palette size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Color Palette Generator</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Create harmonious color schemes for your next project</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: 24 }}>
        {/* Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Settings</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Calculation Mode</label>
              <select value={mode} onChange={e => setMode(e.target.value as any)} style={selectStyle}>
                <option value="random">Random Discovery</option>
                <option value="monochrome">Monochromatic</option>
                <option value="analogous">Analogous</option>
                <option value="complementary">Complementary</option>
                <option value="triadic">Triadic</option>
              </select>
            </div>

            {mode !== 'random' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Base Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                   <input type="color" value={baseColor} onChange={e => setBaseColor(e.target.value)} style={{ width: 44, height: 44, padding: 0, border: '1.5px solid var(--border)', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
                   <input type="text" value={baseColor} onChange={e => setBaseColor(e.target.value)} style={{ flex: 1, padding: '0 12px', fontSize: 14, fontFamily: 'var(--font-mono)', border: '1.5px solid var(--border)', borderRadius: 6, background: 'var(--bg-base)', color: 'var(--text-primary)' }} />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Color Count ({count})</label>
              <input type="range" min="3" max="10" value={count} onChange={e => setCount(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--brand)' }} />
            </div>

            <button onClick={generate} style={{
              width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, borderRadius: 'var(--radius-md)',
              background: 'var(--brand)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
              <RotateCcw size={16} /> Generate Palette
            </button>
          </div>

          <div style={{ padding: 16, background: 'rgba(79,107,237,0.05)', border: '1px solid rgba(79,107,237,0.1)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 10 }}>
            <Settings2 size={16} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Colors are generated mathematically based on HSL offsets to ensure harmony.
            </p>
          </div>
        </div>

        {/* Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ 
            display: 'flex', flexWrap: 'nowrap', height: 400, borderRadius: 'var(--radius-lg)', overflow: 'hidden', 
            border: '2px solid var(--border)', background: 'var(--bg-surface)'
          }}>
            {palette.map((hex, idx) => {
              const lum = getLuminance(hex);
              const textColor = lum > 0.5 ? '#000' : '#fff';
              return (
                <div key={idx} style={{ 
                  flex: 1, background: hex, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', 
                  paddingBottom: 24, position: 'relative', cursor: 'pointer', transition: 'flex 200ms cubic-bezier(.4,0,.2,1)'
                }} onClick={() => handleCopy(hex)} onMouseEnter={e => e.currentTarget.style.flex = '1.4'} onMouseLeave={e => e.currentTarget.style.flex = '1'}>
                  <div style={{ 
                    position: 'absolute', top: 16, right: 16, opacity: copied === hex ? 1 : 0, transition: 'opacity 150ms',
                    background: 'rgba(0,0,0,0.1)', padding: 4, borderRadius: 4, color: textColor
                  }}>
                    <Check size={14} />
                  </div>
                  <div style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', marginBottom: 40, width: 100, textAlign: 'center' }}>
                     <span style={{ fontSize: 12, fontWeight: 700, color: textColor, opacity: 0.6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{idx === 0 && mode !== 'random' ? 'Base' : `Color ${idx + 1}`}</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: textColor, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>{hex.toUpperCase()}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
             {palette.map((hex, i) => (
               <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 4, background: hex, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <div style={{ flex: 1 }}>
                     <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>HEX</p>
                     <p style={{ margin: 0, fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{hex.toUpperCase()}</p>
                  </div>
                  <button onClick={() => handleCopy(hex)} style={{ border: 'none', background: 'none', padding: 4, cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {copied === hex ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                  </button>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */

function randomHex() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function getLuminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function generateFromBase(base: string, mode: ColorMode, count: number): string[] {
  const [h, s, l] = hexToHsl(base);
  const palette: string[] = [base];

  for (let i = 1; i < count; i++) {
    let nh = h, ns = s, nl = l;

    if (mode === 'monochrome') {
      nl = (l + (i * (100 / count))) % 100;
      if (nl < 10) nl += 30; // avoid too black
    } else if (mode === 'analogous') {
      nh = (h + (i * 30)) % 360;
    } else if (mode === 'complementary') {
      nh = (h + 180 + (i % 2 === 0 ? i * 10 : -i * 10)) % 360;
      nl = l > 50 ? l - (i * 5) : l + (i * 5);
    } else if (mode === 'triadic') {
      nh = (h + (i % 2 === 0 ? 120 : 240) + (i > 2 ? i * 5 : 0)) % 360;
    }
    palette.push(hslToHex(nh, ns, nl));
  }

  return palette;
}

function hexToHsl(hex: string): [number, number, number] {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const selectStyle = {
  width: '100%', padding: '10px 12px', fontSize: 13, fontWeight: 600, background: 'var(--bg-base)',
  border: '1.5px solid var(--border)', borderRadius: 6, outline: 'none', color: 'var(--text-primary)', cursor: 'pointer'
};
