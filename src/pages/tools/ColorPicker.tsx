import { useState, useMemo } from 'react';
import { Pipette, Copy, Check, RotateCcw, Palette, Layers, Smartphone } from 'lucide-react';

/* ════════════════════════════════════════════════
   Color Picker — utilBrain
   ════════════════════════════════════════════════ */

export function ColorPicker() {
  const [color, setColor] = useState('#4f6bed');
  const [history, setHistory] = useState<string[]>(['#4f6bed', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']);
  const [copied, setCopied] = useState<string | null>(null);

  const handlePick = (val: string) => {
    setColor(val);
    if (!history.includes(val)) {
      setHistory(prev => [val, ...prev.slice(0, 9)]);
    }
  };

  const formats = useMemo(() => {
    const hex = color;
    const [r, g, b] = hexToRgb(hex);
    const [h, s, l] = hexToHsl(hex);
    return {
      hex: hex.toUpperCase(),
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
    };
  }, [color]);

  const harmonies = useMemo(() => {
    const [h, s, l] = hexToHsl(color);
    return {
      complementary: hslToHex((h + 180) % 360, s, l),
      analogous: [hslToHex((h + 30) % 360, s, l), hslToHex((h - 30 + 360) % 360, s, l)],
      triadic: [hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)]
    };
  }, [color]);

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(val);
    setTimeout(() => setCopied(null), 1500);
  };

  const lum = getLuminance(color);
  const contrastWhite = (lum + 0.05) / 0.05; // Simplified
  const contrastBlack = (1.05) / (lum + 0.05);
  const bestText = lum > 0.5 ? '#000000' : '#ffffff';

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', overflowY: 'auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Pipette size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Surgical Color Picker</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Pick, analyze, and discover perfect color combinations</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 460px) 1fr', gap: 24 }}>
        {/* Main Interface */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <div style={{ padding: 24, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                 <div style={{ position: 'relative', width: 120, height: 120 }}>
                    <input type="color" value={color} onChange={e => handlePick(e.target.value)} style={{ width: '100%', height: '100%', border: 'none', padding: 0, background: 'none', cursor: 'pointer', borderRadius: 8, overflow: 'hidden' }} />
                 </div>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected Color</p>
                    <h2 style={{ margin: '4px 0 12px', fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{formats.hex}</h2>
                    <div style={{ display: 'flex', gap: 8 }}>
                       {history.map((h, i) => (
                         <div key={i} onClick={() => handlePick(h)} style={{ width: 24, height: 24, borderRadius: 12, background: h, cursor: 'pointer', border: color === h ? '2px solid var(--brand)' : '1px solid rgba(0,0,0,0.1)' }} />
                       ))}
                    </div>
                 </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                 <FormatRow label="HEX" value={formats.hex} onCopy={handleCopy} active={copied === formats.hex} />
                 <FormatRow label="RGB" value={formats.rgb} onCopy={handleCopy} active={copied === formats.rgb} />
                 <FormatRow label="HSL" value={formats.hsl} onCopy={handleCopy} active={copied === formats.hsl} />
              </div>
           </div>

           <div style={{ padding: 24, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                 <Palette size={16} style={{ color: 'var(--brand)' }} /> Color Harmonies
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                 <HarmonyBox label="Complementary" colors={[harmonies.complementary]} onPick={handlePick} />
                 <HarmonyBox label="Analogous" colors={harmonies.analogous} onPick={handlePick} />
                 <HarmonyBox label="Triadic" colors={harmonies.triadic} onPick={handlePick} />
              </div>
           </div>
        </div>

        {/* Right side: Preview Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
           <div style={{ padding: 40, background: color, borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                 <h1 style={{ margin: 0, fontSize: 42, fontWeight: 900, color: bestText, lineHeight: 1 }}>Surgical UI</h1>
                 <p style={{ margin: '12px 0 0', fontSize: 18, color: bestText, opacity: 0.8, maxWidth: 350, lineHeight: 1.5 }}>
                   This is a real-time preview of how text looks on your selected background color. 
                   Checking contrast and readability is key to professional design.
                 </p>
                 <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
                    <button style={{ padding: '12px 24px', borderRadius: 0, border: `2px solid ${bestText}`, background: 'transparent', color: bestText, fontWeight: 700, fontSize: 13, cursor: 'default' }}>SECONDARY</button>
                    <button style={{ padding: '12px 24px', borderRadius: 0, border: 'none', background: bestText, color: color, fontWeight: 800, fontSize: 13, cursor: 'default' }}>PRIMARY ACTION</button>
                 </div>
              </div>
              
              <div style={{ paddingTop: 32, borderTop: `1px solid ${bestText}33`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'center' }}>
                       <p style={{ margin: 0, fontSize: 9, fontWeight: 800, color: bestText, opacity: 0.6 }}>WCAG</p>
                       <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: bestText }}>{contrastWhite > 4.5 ? 'PASS' : 'FAIL'}</p>
                    </div>
                    <div style={{ width: 1, height: 24, background: bestText, opacity: 0.2 }} />
                    <div style={{ textAlign: 'center' }}>
                       <p style={{ margin: 0, fontSize: 9, fontWeight: 800, color: bestText, opacity: 0.6 }}>SCORE</p>
                       <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: bestText }}>{contrastWhite.toFixed(2)}:1</p>
                    </div>
                 </div>
                 <Layers size={20} style={{ color: bestText, opacity: 0.5 }} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function FormatRow({ label, value, onCopy, active }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-base)', borderRadius: 6, border: '1px solid var(--border)' }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', width: 35 }}>{label}</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{value}</span>
      <button onClick={() => onCopy(value)} style={{ border: 'none', background: 'none', padding: 4, cursor: 'pointer', color: active ? 'var(--success)' : 'var(--text-muted)' }}>
        {active ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}

function HarmonyBox({ label, colors, onPick }: any) {
  return (
     <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{label}</p>
        <div style={{ display: 'flex', gap: 6 }}>
           {colors.map((c: string, i: number) => (
             <div key={i} onClick={() => onPick(c)} style={{ flex: 1, height: 32, borderRadius: 4, background: c, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.1)' }} title={c} />
           ))}
        </div>
     </div>
  );
}

/* ── Color Math Helpers ── */

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function getLuminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToHsl(hex: string): [number, number, number] {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
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
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1+s) : l+s-l*s;
  const p = 2*l-q;
  r = hue2rgb(p, q, h+1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h-1/3);
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
