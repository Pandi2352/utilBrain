import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
   Search, Sparkles, LayoutGrid, 
   Clock, Star, Zap, ChevronRight 
} from 'lucide-react';
import { NAV_SECTIONS } from '../constants/navigation';
import { DynamicIcon } from '../components/ui/DynamicIcon';
import { useWorkspace } from '../context/WorkspaceContext';
import { Pin } from 'lucide-react';

/* ─── Modern Home Dashboard ─── */

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const allTools = useMemo(() => {
    return NAV_SECTIONS.flatMap(section => 
      section.items.map(item => ({ ...item, category: section.title }))
    );
  }, []);

  const { pinnedTools, togglePin, isPinned } = useWorkspace();

  const pinnedList = useMemo(() => 
    pinnedTools.map(path => allTools.find(t => t.path === path)).filter(Boolean),
  [pinnedTools, allTools]);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allTools.filter(t => 
      t.label.toLowerCase().includes(query) || 
      t.category?.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [searchQuery, allTools]);

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', overflowY: 'auto' }}>
      
      {/* ── Hero Section ── */}
      <div style={{ marginBottom: 40, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
           <div style={{ width: 40, height: 40, background: 'var(--brand)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Zap size={22} fill="currentColor" />
           </div>
           <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--brand)', letterSpacing: '0.1em' }}>UTILBRAIN v2.0</span>
        </div>
        
        <h1 style={{ margin: '0 0 16px', fontSize: 42, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          The Tactical Suite for <br/> 
          <span style={{ color: 'var(--brand)' }}>Modern Workflows.</span>
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 600 }}>
          A high-density collection of 50+ developer, finance, and SEO utilities engineering for speed and surgical precision. No fluff, just tools.
        </p>

        {/* Global Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 500 }}>
           <div style={{ 
             display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-surface)', 
             border: '2px solid var(--brand)', borderRadius: 12, padding: '14px 20px'
           }}>
              <Search size={20} style={{ color: 'var(--brand)' }} />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && filteredTools.length > 0) {
                    navigate(filteredTools[0].path);
                    setSearchQuery('');
                  }
                }}
                placeholder="Find a tool (JSON, EMI, SSL, Cron...)" 
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}
              />
              <kbd style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 4, fontSize: 11, color: 'var(--text-muted)' }}>CTRL + F</kbd>
           </div>

           {/* Search Results Dropdown */}
           {filteredTools.length > 0 && (
             <div style={{ 
               position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, 
               background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12, 
               zIndex: 100, overflow: 'hidden'
             }}>
                {filteredTools.map(tool => (
                  <Link 
                    key={tool.path} 
                    to={tool.path} 
                    onClick={() => setSearchQuery('')}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-base)' }} className="search-result-item">
                       <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{tool.label}</span>
                       <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{tool.category}</span>
                    </div>
                  </Link>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 60 }}>
         <StatBox icon={<LayoutGrid size={18} />} color="#4f6bed" label="Total Assets" value="50+" />
         <StatBox icon={<Sparkles size={18} />} color="#8b5cf6" label="AI Engines" value="12 Active" />
         <StatBox icon={<Clock size={18} />} color="#10b981" label="Last Sync" value="Real-time" />
         <StatBox icon={<Star size={18} />} color="#f59e0b" label="License" value="Professional" />
      </div>

      {/* ── Main Dashboard Grid ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        
        {/* Surgical Workspace (Pinned) */}
        {pinnedList.length > 0 && (
          <div style={{
            padding: '24px',
            background: 'rgba(79, 107, 237, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(79, 107, 237, 0.15)',
            borderRadius: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, background: 'var(--brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                     <Pin size={16} fill="currentColor" />
                  </div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Surgical Workspace</h2>
               </div>
               <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand)', background: 'rgba(79,107,237,0.1)', padding: '4px 10px', borderRadius: 6 }}>{pinnedList.length} PINNED TOOLS</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
               {pinnedList.map(tool => (
                  <ToolCard key={tool.id} tool={tool} isPinned={true} onPinToggle={() => togglePin(tool.path)} />
               ))}
            </div>
          </div>
        )}

        {NAV_SECTIONS.filter(s => s.id !== 'main').map(section => (
          <div key={section.id}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{section.title}</h2>
                <span style={{ height: 1.5, flex: 1, background: 'var(--border)', margin: '0 20px', opacity: 0.5 }}></span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{section.items.length} TOOLS</span>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {section.items.map(tool => (
                   <ToolCard key={tool.id} tool={tool} />
                ))}
             </div>
          </div>
        ))}
      </div>

      {/* ── Minimal Footer ── */}
      <div style={{ marginTop: 100, borderTop: '1px solid var(--border)', paddingTop: 40, textAlign: 'center' }}>
         <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>UTILBRAIN • SYSTEM OPERATIONAL • 2026</p>
      </div>
    </div>
  );
}

function StatBox({ icon, color, label, value }: any) {
  return (
    <div style={{ 
      padding: '20px 24px', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12,
      display: 'flex', alignItems: 'center', gap: 16 
    }}>
       <div style={{ color, background: `${color}15`, width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
       </div>
       <div>
          <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{label}</p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>{value}</p>
       </div>
    </div>
  );
}

function ToolCard({ tool, isPinned: forcePinned, onPinToggle: forceToggle }: any) {
  const { isPinned, togglePin } = useWorkspace();
  const pinned = forcePinned ?? isPinned(tool.path);

  return (
    <div style={{ position: 'relative' }}>
      <Link to={tool.path} style={{ textDecoration: 'none' }}>
        <div 
          style={{ 
            padding: '24px', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 12,
            transition: 'all 200ms ease', position: 'relative', overflow: 'hidden'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--brand)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
             <div style={{ width: 40, height: 40, background: 'var(--bg-base)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <DynamicIcon name={tool.icon} size={20} />
             </div>
             {tool.badge && (
               <span style={{ 
                 fontSize: 9, fontWeight: 900, background: tool.badge.variant === 'new' ? 'var(--brand)' : 'var(--bg-base)', 
                 color: tool.badge.variant === 'new' ? '#fff' : 'var(--text-muted)',
                 padding: '2px 6px', borderRadius: 4
               }}>{tool.badge.label}</span>
             )}
          </div>
          <div>
             <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{tool.label}</h3>
             <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.4 }}>
                Execute {tool.label} procedures with surgical reliability.
             </p>
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand)', fontSize: 11, fontWeight: 800 }}>
             OPEN MODULE <ChevronRight size={12} />
          </div>
        </div>
      </Link>
      
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          (forceToggle || togglePin)(tool.path);
        }}
        style={{ 
          position: 'absolute', top: 12, right: 12, 
          width: 28, height: 28, borderRadius: 6,
          background: pinned ? 'var(--brand)' : 'var(--bg-base)',
          color: pinned ? '#fff' : 'var(--text-muted)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 200ms',
          zIndex: 10
        }}
        title={pinned ? 'Unpin tool' : 'Pin to Workspace'}
      >
        <Pin size={14} fill={pinned ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
