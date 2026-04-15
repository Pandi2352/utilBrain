import { useState, useRef } from 'react';
import { QrCode, Download, RotateCcw, Wifi, User, Globe, Type } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

/* ════════════════════════════════════════════════
   QR Code Generator — utilBrain
   ════════════════════════════════════════════════ */

type QRMode = 'url' | 'text' | 'wifi' | 'vcard';

export function QrGenerator() {
  const [mode, setMode] = useState<QRMode>('url');
  const [value, setValue] = useState('https://google.com');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [includeMargin, setIncludeMargin] = useState(true);

  // WiFi Fields
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiEnc, setWifiEnc] = useState('WPA');

  // VCard Fields
  const [vFirstName, setVFirstName] = useState('');
  const [vLastName, setVLastName] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vEmail, setVEmail] = useState('');

  const qrRef = useRef<HTMLDivElement>(null);

  const getQRValue = () => {
    switch (mode) {
      case 'url':
      case 'text':
        return value;
      case 'wifi':
        return `WIFI:S:${wifiSsid};T:${wifiEnc};P:${wifiPass};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vLastName};${vFirstName}\nFN:${vFirstName} ${vLastName}\nTEL;TYPE=CELL:${vPhone}\nEMAIL:${vEmail}\nEND:VCARD`;
      default:
        return value;
    }
  };

  const download = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <QrCode size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>QR Code Generator</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Create custom QR codes for URLs, WiFi, or Contact cards</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 400px) 1fr', gap: 24 }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 20 }}>
                <ModeBtn active={mode === 'url'} onClick={() => setMode('url')} icon={<Globe size={14} />} label="URL" />
                <ModeBtn active={mode === 'text'} onClick={() => setMode('text')} icon={<Type size={14} />} label="Text" />
                <ModeBtn active={mode === 'wifi'} onClick={() => setMode('wifi')} icon={<Wifi size={14} />} label="WiFi" />
                <ModeBtn active={mode === 'vcard'} onClick={() => setMode('vcard')} icon={<User size={14} />} label="Card" />
             </div>

             {mode === 'url' && (
               <Field label="Website URL">
                  <input value={value} onChange={e => setValue(e.target.value)} placeholder="https://..." style={inputStyle} />
               </Field>
             )}
             {mode === 'text' && (
               <Field label="Text Content">
                  <textarea value={value} onChange={e => setValue(e.target.value)} placeholder="Enter text message..." style={{ ...inputStyle, height: 100, padding: 12, resize: 'none' }} />
               </Field>
             )}
             {mode === 'wifi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   <Field label="Network SSID (Name)">
                      <input value={wifiSsid} onChange={e => setWifiSsid(e.target.value)} style={inputStyle} />
                   </Field>
                   <Field label="Password">
                      <input type="password" value={wifiPass} onChange={e => setWifiPass(e.target.value)} style={inputStyle} />
                   </Field>
                   <Field label="Encryption">
                      <select value={wifiEnc} onChange={e => setWifiEnc(e.target.value)} style={inputStyle}>
                         <option value="WPA">WPA/WPA2</option>
                         <option value="WEP">WEP</option>
                         <option value="nopass">None</option>
                      </select>
                   </Field>
                </div>
             )}
             {mode === 'vcard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <Field label="First Name">
                         <input value={vFirstName} onChange={e => setVFirstName(e.target.value)} style={inputStyle} />
                      </Field>
                      <Field label="Last Name">
                         <input value={vLastName} onChange={e => setVLastName(e.target.value)} style={inputStyle} />
                      </Field>
                   </div>
                   <Field label="Phone Number">
                      <input value={vPhone} onChange={e => setVPhone(e.target.value)} style={inputStyle} />
                   </Field>
                   <Field label="Email Address">
                      <input value={vEmail} onChange={e => setVEmail(e.target.value)} style={inputStyle} />
                   </Field>
                </div>
             )}

             <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Design</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                   <div>
                      <label style={{ display: 'block', marginBottom: 4, fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Color</label>
                      <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} style={{ width: '100%', height: 34, border: '1.5px solid var(--border)', borderRadius: 6, background: 'none', cursor: 'pointer' }} />
                   </div>
                   <div>
                      <label style={{ display: 'block', marginBottom: 4, fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Background</label>
                      <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '100%', height: 34, border: '1.5px solid var(--border)', borderRadius: 6, background: 'none', cursor: 'pointer' }} />
                   </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <input type="checkbox" checked={includeMargin} onChange={e => setIncludeMargin(e.target.checked)} id="margin" />
                   <label htmlFor="margin" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Include Margin</label>
                </div>
             </div>
          </div>
        </div>

        {/* Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
           <div ref={qrRef} style={{ background: '#fff', padding: includeMargin ? 24 : 0, borderRadius: 8, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
              <QRCodeCanvas
                value={getQRValue() || ' '}
                size={size}
                fgColor={fgColor}
                bgColor={bgColor}
                level="H"
                includeMargin={false}
              />
           </div>

           <div style={{ display: 'flex', gap: 12 }}>
             <button onClick={download} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 8,
                background: 'var(--brand)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer'
             }}>
                <Download size={18} /> Download PNG
             </button>
             <button onClick={() => { setFgColor('#000000'); setBgColor('#ffffff'); setValue(''); }} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8,
                background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1.5px solid var(--border)', fontSize: 14, fontWeight: 700, cursor: 'pointer'
             }}>
                <RotateCcw size={16} /> Reset
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function ModeBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 0', border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all 150ms',
      background: active ? 'rgba(79,107,237,0.1)' : 'transparent',
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

const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
  background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 6, outline: 'none', boxSizing: 'border-box' as const
};
