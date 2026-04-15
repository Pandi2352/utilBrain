import { useState, useMemo } from 'react';
import { ArrowRightLeft, Ruler, Weight, Thermometer, Box, Zap, Gauge, RotateCcw } from 'lucide-react';

/* ════════════════════════════════════════════════
   Unit Converter — utilBrain
   ════════════════════════════════════════════════ */

type Category = 'length' | 'weight' | 'temp' | 'area' | 'volume' | 'speed';

interface Unit {
  label: string;
  value: string;
  factor: number; // relative to base unit
  offset?: number; // for temperature
}

const UNITS: Record<Category, Unit[]> = {
  length: [
    { label: 'Millimeters (mm)', value: 'mm', factor: 0.001 },
    { label: 'Centimeters (cm)', value: 'cm', factor: 0.01 },
    { label: 'Meters (m)',       value: 'm',  factor: 1 },
    { label: 'Kilometers (km)',   value: 'km', factor: 1000 },
    { label: 'Inches (in)',      value: 'in', factor: 0.0254 },
    { label: 'Feet (ft)',        value: 'ft', factor: 0.3048 },
    { label: 'Yards (yd)',       value: 'yd', factor: 0.9144 },
    { label: 'Miles (mi)',       value: 'mi', factor: 1609.344 },
  ],
  weight: [
    { label: 'Milligrams (mg)',  value: 'mg', factor: 0.000001 },
    { label: 'Grams (g)',       value: 'g',  factor: 0.001 },
    { label: 'Kilograms (kg)',   value: 'kg', factor: 1 },
    { label: 'Metric Tons (t)',  value: 't',  factor: 1000 },
    { label: 'Ounces (oz)',     value: 'oz', factor: 0.0283495 },
    { label: 'Pounds (lb)',     value: 'lb', factor: 0.453592 },
  ],
  temp: [
    { label: 'Celsius (°C)',    value: 'c',  factor: 1, offset: 0 },
    { label: 'Fahrenheit (°F)', value: 'f',  factor: 0.555555555, offset: 32 },
    { label: 'Kelvin (K)',      value: 'k',  factor: 1, offset: 273.15 },
  ],
  area: [
    { label: 'Sq Millimeters',   value: 'sq_mm', factor: 0.000001 },
    { label: 'Sq Centimeters',   value: 'sq_cm', factor: 0.0001 },
    { label: 'Sq Meters',        value: 'sq_m',  factor: 1 },
    { label: 'Sq Kilometers',    value: 'sq_km', factor: 1000000 },
    { label: 'Sq Inches',        value: 'sq_in', factor: 0.00064516 },
    { label: 'Sq Feet',          value: 'sq_ft', factor: 0.092903 },
    { label: 'Acres (ac)',       value: 'ac',    factor: 4046.856 },
    { label: 'Hectares (ha)',    value: 'ha',    factor: 10000 },
  ],
  volume: [
    { label: 'Milliliters (ml)', value: 'ml', factor: 0.001 },
    { label: 'Liters (l)',       value: 'l',  factor: 1 },
    { label: 'Cubic Meters',     value: 'm3', factor: 1000 },
    { label: 'Gallons (US)',     value: 'ga', factor: 3.78541 },
    { label: 'Quarts (US)',      value: 'qt', factor: 0.946353 },
    { label: 'Pints (US)',       value: 'pt', factor: 0.473176 },
    { label: 'Cups (US)',        value: 'cp', factor: 0.236588 },
  ],
  speed: [
    { label: 'Meters / second',   value: 'ms',  factor: 1 },
    { label: 'Kilometers / hour', value: 'kmh', factor: 0.277778 },
    { label: 'Miles / hour',      value: 'mph', factor: 0.44704 },
    { label: 'Knots',             value: 'kn',  factor: 0.514444 },
    { label: 'Mach (at STP)',     value: 'ma',  factor: 340.29 },
  ]
};

const CATEGORIES: { id: Category; label: string; icon: any }[] = [
  { id: 'length', label: 'Length', icon: <Ruler size={14} /> },
  { id: 'weight', label: 'Weight', icon: <Weight size={14} /> },
  { id: 'temp',   label: 'Temperature', icon: <Thermometer size={14} /> },
  { id: 'volume', label: 'Volume', icon: <Box size={14} /> },
  { id: 'area',   label: 'Area', icon: <Zap size={14} /> },
  { id: 'speed',  label: 'Speed', icon: <Gauge size={14} /> },
];

export function UnitConverter() {
  const [cat, setCat]         = useState<Category>('length');
  const [val1, setVal1]       = useState('1');
  const [unit1, setUnit1]     = useState(UNITS.length[2].value); // meter
  const [unit2, setUnit2]     = useState(UNITS.length[3].value); // km

  const units = UNITS[cat];

  const results = useMemo(() => {
    const v1 = parseFloat(val1) || 0;
    const u1 = units.find(u => u.value === unit1)!;
    const u2 = units.find(u => u.value === unit2)!;

    // Convert v1 to base unit
    let baseVal: number;
    if (cat === 'temp') {
      baseVal = (v1 - (u1.offset || 0)) * u1.factor;
    } else {
      baseVal = v1 * u1.factor;
    }

    // Convert from base unit to unit2
    let v2: number;
    if (cat === 'temp') {
      v2 = (baseVal / u2.factor) + (u2.offset || 0);
    } else {
      v2 = baseVal / u2.factor;
    }

    return {
      v2,
      formula: cat === 'temp' 
        ? 'Complex conversion for temperature'
        : `1 ${u1.value} = ${fmt(u1.factor / u2.factor, 6)} ${u2.value}`
    };
  }, [cat, val1, unit1, unit2, units]);

  const handleCatChange = (newCat: Category) => {
    setCat(newCat);
    setUnit1(UNITS[newCat][0].value);
    setUnit2(UNITS[newCat][1].value);
  };

  const swap = () => {
    const temp = unit1;
    setUnit1(unit2);
    setUnit2(temp);
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <ArrowRightLeft size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Unit Converter</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Real-time conversion across various measurement units</p>
        </div>
      </div>

      <div style={{ maxWidth: 800 }}>
        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => {
            const active = cat === c.id;
            return (
              <button key={c.id} onClick={() => handleCatChange(c.id)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 'var(--radius-md)',
                background: active ? 'var(--brand)' : 'var(--bg-surface)',
                border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                color: active ? '#fff' : 'var(--text-secondary)', fontWeight: active ? 700 : 600,
                fontSize: 13, cursor: 'pointer', transition: 'all 150ms'
              }}>
                {c.icon} {c.label}
              </button>
            );
          })}
        </div>

        {/* ── Conversion Panel ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 12, alignItems: 'center' }}>
          {/* FROM */}
          <div style={{ padding: 24, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>From</label>
            <input type="number" value={val1} onChange={e => setVal1(e.target.value)} style={{
              width: '100%', padding: '12px 0', fontSize: 32, fontWeight: 800, border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)'
            }} />
            <select value={unit1} onChange={e => setUnit1(e.target.value)} style={{
              width: '100%', padding: '12px 14px', marginTop: 12, fontSize: 14, fontWeight: 600, background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', cursor: 'pointer'
            }}>
              {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>

          {/* SWAP */}
          <button onClick={swap} style={{ width: 40, height: 40, borderRadius: 'full', background: 'var(--bg-base)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <ArrowRightLeft size={16} />
          </button>

          {/* TO */}
          <div style={{ padding: 24, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>To</label>
            <div style={{ width: '100%', padding: '12px 0', fontSize: 32, fontWeight: 800, color: 'var(--brand)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {fmt(results.v2, 4)}
            </div>
            <select value={unit2} onChange={e => setUnit2(e.target.value)} style={{
              width: '100%', padding: '12px 14px', marginTop: 12, fontSize: 14, fontWeight: 600, background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', cursor: 'pointer'
            }}>
              {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── Formula Info ── */}
        <div style={{ marginTop: 20, padding: '14px 20px', background: 'rgba(79,107,237,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(79,107,237,0.1)' }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--brand)', fontWeight: 600 }}>
            Formula: <span style={{ fontFamily: 'var(--font-mono)', marginLeft: 8 }}>{results.formula}</span>
          </p>
        </div>

        {/* ── Table View (Optional extra) ── */}
        <div style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>Common Conversions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {units.slice(0, 8).map(u => {
              if (u.value === unit1) return null;
              const res = convert(parseFloat(val1) || 1, unit1, u.value, cat);
              return (
                <div key={u.value} style={{ padding: '12px 16px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{u.label.split(' (')[0]}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{fmt(res, 3)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function fmt(n: number, dec: number = 2): string {
  if (Math.abs(n) < 0.0001) return n.toExponential(4);
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: dec });
}

function convert(val: number, from: string, to: string, cat: Category): number {
  const units = UNITS[cat];
  const u1 = units.find(u => u.value === from)!;
  const u2 = units.find(u => u.value === to)!;

  let base: number;
  if (cat === 'temp') {
    base = (val - (u1.offset || 0)) * u1.factor;
    return (base / u2.factor) + (u2.offset || 0);
  } else {
    base = val * u1.factor;
    return base / u2.factor;
  }
}

function ActionButton({ onClick, icon, label }: any) {
  return <button onClick={onClick} style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>{icon}</button>;
}
