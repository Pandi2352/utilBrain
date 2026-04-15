import { useState, useMemo } from 'react';
import { Database, Copy, Check, RotateCcw, Plus, Trash2, Code2 } from 'lucide-react';

/* ════════════════════════════════════════════════
   SQL Builder — utilBrain
   ════════════════════════════════════════════════ */

type SQLType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';

export function SqlBuilder() {
  const [type, setType] = useState<SQLType>('SELECT');
  const [table, setTable] = useState('users');
  const [columns, setColumns] = useState<string[]>(['id', 'name', 'email']);
  const [where, setWhere] = useState('active = 1');
  const [limit, setLimit] = useState('10');
  const [orderBy, setOrderBy] = useState('created_at DESC');
  
  const [insertData, setInsertData] = useState<{ k: string; v: string }[]>([
    { k: 'name', v: "'John Doe'" },
    { k: 'email', v: "'john@example.com'" }
  ]);

  const [copied, setCopied] = useState(false);

  const query = useMemo(() => {
    let sql = '';
    const t = table.trim() || '[table]';

    switch (type) {
      case 'SELECT':
        const cols = columns.length > 0 ? columns.join(', ') : '*';
        sql = `SELECT ${cols}\nFROM ${t}`;
        if (where.trim()) sql += `\nWHERE ${where.trim()}`;
        if (orderBy.trim()) sql += `\nORDER BY ${orderBy.trim()}`;
        if (limit.trim()) sql += `\nLIMIT ${limit.trim()}`;
        break;

      case 'INSERT':
        const keys = insertData.map(d => d.k).join(', ');
        const vals = insertData.map(d => d.v).join(', ');
        sql = `INSERT INTO ${t} (${keys})\nVALUES (${vals})`;
        break;

      case 'UPDATE':
        const sets = insertData.map(d => `${d.k} = ${d.v}`).join(', ');
        sql = `UPDATE ${t}\nSET ${sets}`;
        if (where.trim()) sql += `\nWHERE ${where.trim()}`;
        break;

      case 'DELETE':
        sql = `DELETE FROM ${t}`;
        if (where.trim()) sql += `\nWHERE ${where.trim()}`;
        break;
    }

    return sql + ';';
  }, [type, table, columns, where, limit, orderBy, insertData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Database size={18} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>SQL Query Builder</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Visually construct SQL queries without writing a single line of code</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 420px) 1fr', gap: 24 }}>
        {/* Editor Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 20 }}>
              {(['SELECT', 'INSERT', 'UPDATE', 'DELETE'] as SQLType[]).map(t => (
                <button key={t} onClick={() => setType(t)} style={tabStyle(type === t)}>{t}</button>
              ))}
            </div>

            <Field label="Table Name">
               <input value={table} onChange={e => setTable(e.target.value)} style={inputStyle} />
            </Field>

            {type === 'SELECT' && (
              <Field label="Columns (comma separated)">
                <input value={columns.join(', ')} onChange={e => setColumns(e.target.value.split(',').map(s => s.trim()))} style={inputStyle} />
              </Field>
            )}

            {(type === 'INSERT' || type === 'UPDATE') && (
               <div style={{ marginBottom: 16 }}>
                 <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Data Fields</label>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                   {insertData.map((d, i) => (
                     <div key={i} style={{ display: 'flex', gap: 6 }}>
                       <input value={d.k} placeholder="col" onChange={e => { const n = [...insertData]; n[i].k = e.target.value; setInsertData(n); }} style={{ ...inputStyle, flex: 1 }} />
                       <input value={d.v} placeholder="val" onChange={e => { const n = [...insertData]; n[i].v = e.target.value; setInsertData(n); }} style={{ ...inputStyle, flex: 1.5 }} />
                       <button onClick={() => setInsertData(insertData.filter((_, idx) => idx !== i))} style={iconBtnStyle}><Trash2 size={13} /></button>
                     </div>
                   ))}
                   <button onClick={() => setInsertData([...insertData, { k: '', v: '' }])} style={{ 
                     display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', 
                     border: '1.5px dashed var(--border)', borderRadius: 6, color: 'var(--text-muted)', background: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600
                   }}>
                     <Plus size={12} /> Add Field
                   </button>
                 </div>
               </div>
            )}

            {type !== 'INSERT' && (
              <Field label="WHERE Conditions">
                <input value={where} onChange={e => setWhere(e.target.value)} style={inputStyle} placeholder="e.g. status = 'active'" />
              </Field>
            )}

            {type === 'SELECT' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10 }}>
                <Field label="ORDER BY">
                  <input value={orderBy} onChange={e => setOrderBy(e.target.value)} style={inputStyle} placeholder="created_at DESC" />
                </Field>
                <Field label="LIMIT">
                  <input value={limit} onChange={e => setLimit(e.target.value)} style={inputStyle} placeholder="10" />
                </Field>
              </div>
            )}

            <button onClick={() => { setTable('users'); setColumns(['id', 'name', 'email']); setWhere(''); }} style={{
              width: '100%', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)',
              background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer'
            }}>
              <RotateCcw size={14} /> Clear All
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <div style={{ 
             flex: 1, padding: 32, background: 'var(--bg-surface)', border: '1.5px solid var(--border)', 
             borderRadius: 'var(--radius-lg)', minHeight: 400, position: 'relative' 
           }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Code2 size={16} style={{ color: 'var(--brand)' }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>PREVIEW</span>
                </div>
                <button onClick={handleCopy} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 6,
                  background: 'var(--brand)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Query'}
                </button>
             </div>
             
             <div style={{ 
               padding: 24, background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', 
               fontFamily: 'var(--font-mono)', fontSize: 18, lineHeight: 1.6, color: 'var(--text-primary)',
               whiteSpace: 'pre-wrap', wordBreak: 'break-all', minHeight: 200
             }}>
                {formatSQL(query)}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function formatSQL(sql: string) {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'LIMIT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'AND', 'OR', 'JOIN', 'LEFT JOIN'];
  let formatted = sql;

  // Simple visual highlighting via fragments
  const parts = sql.split(/(\s+)/);
  return parts.map((p, i) => {
    const clean = p.trim().toUpperCase();
    if (keywords.includes(clean)) {
      return <span key={i} style={{ color: 'var(--brand)', fontWeight: 700 }}>{p}</span>;
    }
    if (p.startsWith("'") && p.endsWith("'")) {
       return <span key={i} style={{ color: '#10b981' }}>{p}</span>;
    }
    return <span key={i}>{p}</span>;
  });
}

function Field({ label, children, optional }: any) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
        {label} {optional && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>}
      </label>
      {children}
    </div>
  );
}

const tabStyle = (active: boolean) => ({
  flex: 1, padding: '8px 0', fontSize: 11, fontWeight: 800, borderRadius: 4, cursor: 'pointer', transition: 'all 150ms',
  background: active ? 'var(--brand)' : 'var(--bg-base)',
  color: active ? '#fff' : 'var(--text-muted)',
  border: 'none',
});

const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
  background: 'var(--bg-base)', border: '1.5px solid var(--border)', borderRadius: 6, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'var(--font-mono)'
};

const iconBtnStyle = {
  width: 38, height: 38, border: '1.5px solid var(--border)', background: 'var(--bg-base)', 
  color: 'var(--danger)', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
};
