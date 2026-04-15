import { Search, Moon, Sun, Home, Settings, HelpCircle, ChevronRight, X } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, NavLink, useNavigate, Link } from 'react-router-dom';
import { NAV_SECTIONS } from '../../constants/navigation';

/* ── Route → label map ── */
const ROUTE_LABELS: Record<string, string> = {
  '/':          'Home',
  '/browse':    'Browse Tools',
  '/trending':  'Trending',
  '/recent':    'Recently Used',
  '/dashboard': 'Dashboard',
  '/history':   'History',
  '/saved':     'Saved Tools',
  '/favorites': 'Favorites',
  '/settings':  'Settings',
  '/support':   'Support',
};

function getPageLabel(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  if (pathname.startsWith('/tools/'))
    return pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? 'Tool';
  return 'utilBrain';
}

/* ── Reusable icon link button ── */
function NavIconLink({
  to,
  title,
  children,
}: {
  to: string;
  title: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <NavLink
      to={to}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'none',
        background: isActive
          ? 'var(--sb-active-bg)'
          : hovered
          ? 'var(--bg-raised)'
          : 'transparent',
        color: isActive ? 'var(--brand)' : hovered ? 'var(--text-primary)' : 'var(--text-muted)',
        transition: 'background 150ms, color 150ms',
        flexShrink: 0,
      })}
    >
      {children}
    </NavLink>
  );
}

/* ── Plain icon button (for dark toggle) ── */
function IconBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        background: hovered ? 'var(--bg-raised)' : 'transparent',
        color: hovered ? 'var(--text-primary)' : 'var(--text-muted)',
        transition: 'background 150ms, color 150ms',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

/* ── Navbar props ── */
interface NavbarProps {
  dark: boolean;
  onToggleDark: () => void;
}

export function Navbar({ dark, onToggleDark }: NavbarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const label = getPageLabel(pathname);
  
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const allTools = useMemo(() => {
    return NAV_SECTIONS.flatMap(section => 
      section.items.map(item => ({ ...item, category: section.title }))
    );
  }, []);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allTools.filter(t => 
      t.label.toLowerCase().includes(q) || 
      t.category?.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery, allTools]);

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchQuery('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        height: 56,
        width: '100%',
        padding: '0 20px',
        flexShrink: 0,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Left: breadcrumb ── */}
      <nav
        style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, minWidth: 140 }}
        aria-label="Breadcrumb"
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
          utilBrain
        </span>
        <ChevronRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </span>
      </nav>

      {/* ── Center: global search bar ── */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 16px', position: 'relative' }}>
        <div style={{ width: '100%', maxWidth: 480, position: 'relative' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '7px 12px',
              borderRadius: 8,
              background: 'var(--bg-base)',
              border: `1.5px solid ${searchFocused ? 'var(--brand)' : 'var(--border)'}`,
              boxShadow: searchFocused ? '0 0 0 3px var(--brand-ring)' : 'none',
              cursor: 'text',
              transition: 'all 150ms',
            }}
          >
            <Search size={14} style={{ color: searchQuery ? 'var(--brand)' : 'var(--text-muted)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && filteredResults.length > 0) {
                  navigate(filteredResults[0].path);
                  setSearchQuery('');
                  inputRef.current?.blur();
                }
              }}
              placeholder="Search tools, calculators, AI..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-primary)',
                minWidth: 0,
              }}
            />
            {searchQuery ? (
               <X size={14} onClick={() => setSearchQuery('')} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
            ) : (
              <kbd
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 5px',
                  fontSize: 9,
                  fontWeight: 800,
                  borderRadius: 4,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                ⌘K
              </kbd>
            )}
          </label>

          {/* Search Dropdown */}
          {searchQuery && searchFocused && (
            <div 
              onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking results
              style={{ 
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, 
                background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 10, 
                boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 110
              }}
            >
               {filteredResults.length > 0 ? (
                 <>
                   <div style={{ padding: '8px 12px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                      MATCHING TOOLS
                   </div>
                   {filteredResults.map(tool => (
                     <Link 
                       key={tool.id} 
                       to={tool.path} 
                       onClick={() => {
                         setSearchQuery('');
                         inputRef.current?.blur();
                       }}
                       style={{ 
                         display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                         padding: '10px 14px', textDecoration: 'none', transition: 'background 100ms'
                       }}
                       onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-base)'}
                       onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                     >
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{tool.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{tool.category}</span>
                     </Link>
                   ))}
                 </>
               ) : (
                 <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
                    No modules match "{searchQuery}"
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: nav actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <NavIconLink to="/" title="Home"><Home size={17} /></NavIconLink>
        <NavIconLink to="/settings" title="Settings"><Settings size={17} /></NavIconLink>
        <NavIconLink to="/support" title="Support"><HelpCircle size={17} /></NavIconLink>
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 6px' }} />
        <IconBtn title={dark ? 'Light Mode' : 'Dark Mode'} onClick={onToggleDark}>
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </IconBtn>
      </div>
    </header>
  );
}
