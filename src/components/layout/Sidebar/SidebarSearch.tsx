import { Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface SidebarSearchProps {
  collapsed: boolean;
  value: string;
  onChange: (val: string) => void;
}

export function SidebarSearch({ collapsed, value, onChange }: SidebarSearchProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search on "/" key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (collapsed) {
    return (
      <div style={{ padding: '8px 8px 4px' }}>
        <button
          title="Search tools"
          onClick={() => {
            // Future: Expand sidebar on search icon click?
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '7px 0',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: 'var(--sb-muted)',
            cursor: 'pointer',
            transition: 'background 150ms, color 150ms',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--sb-hover)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--sb-muted)';
          }}
        >
          <Search size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 12px 4px' }}>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          borderRadius: 8,
          border: `1.5px solid ${focused ? 'var(--brand)' : 'var(--sb-border)'}`,
          background: 'var(--sb-input-bg)',
          boxShadow: focused ? '0 0 0 3px var(--brand-ring)' : 'none',
          cursor: 'text',
          transition: 'border-color 150ms, box-shadow 150ms',
          position: 'relative',
        }}
      >
        <Search size={13} style={{ color: value ? 'var(--brand)' : 'var(--sb-muted)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Search tools..."
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 12,
            color: 'var(--sb-text)',
            width: '100%',
          }}
        />
        {value ? (
           <button 
             onClick={(e) => { e.preventDefault(); onChange(''); }}
             style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--sb-muted)', display: 'flex', padding: 2 }}
           >
             <X size={12} />
           </button>
        ) : (
          <kbd
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 5px',
              fontSize: 10,
              fontWeight: 500,
              borderRadius: 4,
              background: 'var(--sb-kbd)',
              border: '1px solid var(--sb-border)',
              color: 'var(--sb-muted)',
              flexShrink: 0,
            }}
          >
            /
          </kbd>
        )}
      </label>
    </div>
  );
}
