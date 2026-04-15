import { useState, useEffect, useMemo } from 'react';
import { Globe, Clock, Plus, Trash2, Search, RotateCcw, Home, Moon, Sun } from 'lucide-react';

/* ════════════════════════════════════════════════
   Time Zone Converter — utilBrain
   ════════════════════════════════════════════════ */

interface ZoneData {
  id: string;
  name: string;
  tz: string;
  isHome?: boolean;
}

export function TimezoneConverter() {
  const [baseTime, setBaseTime] = useState(new Date());
  const [selectedZones, setSelectedZones] = useState<ZoneData[]>([
    { id: '1', name: 'Local Time', tz: Intl.DateTimeFormat().resolvedOptions().timeZone, isHome: true },
    { id: '2', name: 'New York', tz: 'America/New_York' },
    { id: '3', name: 'London', tz: 'Europe/London' },
    { id: '4', name: 'Tokyo', tz: 'Asia/Tokyo' }
  ]);

  // City Search (Simplified)
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<string[]>([]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setBaseTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAddTimezone = (tzName: string) => {
    const name = tzName.split('/').pop()?.replace(/_/g, ' ') || tzName;
    setSelectedZones([...selectedZones, { id: Date.now().toString(), name, tz: tzName }]);
    setSearch('');
  };

  const removeZone = (id: string) => {
    setSelectedZones(selectedZones.filter(z => z.id !== id));
  };

  // Adjust base time via slider (minutes from start of day)
  const [sliderVal, setSliderVal] = useState(baseTime.getHours() * 60 + baseTime.getMinutes());
  
  const adjustedTime = useMemo(() => {
    const d = new Date(baseTime);
    d.setHours(Math.floor(sliderVal / 60));
    d.setMinutes(sliderVal % 60);
    return d;
  }, [sliderVal, baseTime]);

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Globe size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Time Zone Converter</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Easily coordinate across multiple time zones with life tracking</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(330px, 380px) 1fr', gap: 24 }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                 <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <Search size={14} />
                 </div>
                 <input 
                   value={search} onChange={e => setSearch(e.target.value)} 
                   placeholder="Search city or zone..." 
                   style={{ ...inputStyle, paddingLeft: 34 }} 
                 />
              </div>

              {search && (
                 <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6, marginBottom: 12, background: 'var(--bg-base)' }}>
                    {getCommonZones(search).map(tz => (
                       <div key={tz} onClick={() => handleAddTimezone(tz)} style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer', borderBottom: '1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          {tz}
                       </div>
                    ))}
                 </div>
              )}

              <div style={{ marginTop: 20 }}>
                 <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                    <span>ADJUST MASTER CLOCK</span>
                    <span style={{ color: 'var(--brand)' }}>{adjustedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 </label>
                 <input 
                    type="range" min="0" max="1439" value={sliderVal} 
                    onChange={e => setSliderVal(parseInt(e.target.value))} 
                    style={{ width: '100%', accentColor: 'var(--brand)' }} 
                 />
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                    <span>12 AM</span>
                    <span>12 PM</span>
                    <span>11:59 PM</span>
                 </div>
              </div>

              <button onClick={() => setSliderVal(baseTime.getHours() * 60 + baseTime.getMinutes())} style={{
                width: '100%', marginTop: 24, padding: '10px', fontSize: 13, fontWeight: 700, 
                color: 'var(--text-secondary)', background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer'
              }}>
                <RotateCcw size={14} /> Reset to Current
              </button>
           </div>
        </div>

        {/* Timeline View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
           {selectedZones.map(zone => (
             <ZoneItem key={zone.id} zone={zone} baseTime={adjustedTime} onRemove={() => removeZone(zone.id)} />
           ))}
        </div>
      </div>
    </div>
  );
}

function ZoneItem({ zone, baseTime, onRemove }: { zone: ZoneData; baseTime: Date; onRemove: () => void }) {
  const timeStr = baseTime.toLocaleTimeString('en-US', { timeZone: zone.tz, hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = baseTime.toLocaleDateString('en-US', { timeZone: zone.tz, weekday: 'short', month: 'short', day: 'numeric' });
  const hour = parseInt(baseTime.toLocaleTimeString('en-US', { timeZone: zone.tz, hour: '2-digit', hour12: false }));
  const isNight = hour < 6 || hour > 19;

  return (
    <div style={{ 
      padding: '16px 24px', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
         <div style={{ 
           width: 44, height: 44, borderRadius: 22, background: isNight ? '#2d2d30' : '#fef9c3', 
           display: 'flex', alignItems: 'center', justifyContent: 'center', color: isNight ? '#fbbf24' : '#f59e0b' 
         }}>
            {isNight ? <Moon size={20} /> : <Sun size={20} />}
         </div>
         <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{zone.name}</h3>
               {zone.isHome && <Home size={12} style={{ color: 'var(--brand)' }} />}
            </div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{zone.tz}</p>
         </div>
      </div>

      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 24 }}>
         <div>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{timeStr}</p>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{dateStr}</p>
         </div>
         {!zone.isHome && (
           <button onClick={onRemove} style={{ border: 'none', background: 'none', padding: 8, cursor: 'pointer', color: 'var(--text-muted)' }}>
              <Trash2 size={16} />
           </button>
         )}
      </div>
    </div>
  );
}

function getCommonZones(query: string) {
  const common = [
    'UTC', 'GMT', 'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai',
    'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland', 'America/Sao_Paulo'
  ];
  return common.filter(z => z.toLowerCase().includes(query.toLowerCase()));
}

const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
  background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 6, outline: 'none', boxSizing: 'border-box' as const
};
