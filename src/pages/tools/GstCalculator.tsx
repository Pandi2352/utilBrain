import { useState, useMemo } from 'react';
import { Receipt, RotateCcw, Copy, Check } from 'lucide-react';

/* ════════════════════════════════════════════════
   GST Calculator — utilBrain MVP Tool #2
   ════════════════════════════════════════════════ */

type GstMode = 'exclusive' | 'inclusive';
type TaxType = 'intra' | 'inter';

const GST_RATES = [5, 12, 18, 28];

interface GstResult {
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  rate: number;
}

function calculateGst(amount: number, rate: number, mode: GstMode, taxType: TaxType): GstResult {
  let baseAmount: number;
  let gstAmount: number;
  let totalAmount: number;

  if (mode === 'exclusive') {
    baseAmount = amount;
    gstAmount = amount * (rate / 100);
    totalAmount = baseAmount + gstAmount;
  } else {
    totalAmount = amount;
    baseAmount = amount / (1 + rate / 100);
    gstAmount = totalAmount - baseAmount;
  }

  const cgst = taxType === 'intra' ? gstAmount / 2 : 0;
  const sgst = taxType === 'intra' ? gstAmount / 2 : 0;
  const igst = taxType === 'inter' ? gstAmount : 0;

  return {
    baseAmount: Math.round(baseAmount * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    igst: Math.round(igst * 100) / 100,
    rate,
  };
}

function fmt(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════ */
export function GstCalculator() {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(18);
  const [mode, setMode] = useState<GstMode>('exclusive');
  const [taxType, setTaxType] = useState<TaxType>('intra');
  const [copied, setCopied] = useState(false);

  const numAmount = parseFloat(amount.replace(/,/g, '')) || 0;

  const result = useMemo<GstResult | null>(() => {
    if (numAmount <= 0) return null;
    return calculateGst(numAmount, rate, mode, taxType);
  }, [numAmount, rate, mode, taxType]);

  function handleReset() {
    setAmount('');
    setRate(18);
    setMode('exclusive');
    setTaxType('intra');
  }

  function handleCopy() {
    if (!result) return;
    const lines = [
      `Base Amount: ${fmt(result.baseAmount)}`,
      `GST (${result.rate}%): ${fmt(result.gstAmount)}`,
      taxType === 'intra'
        ? `CGST (${result.rate / 2}%): ${fmt(result.cgst)}\nSGST (${result.rate / 2}%): ${fmt(result.sgst)}`
        : `IGST (${result.rate}%): ${fmt(result.igst)}`,
      `Total: ${fmt(result.totalAmount)}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: 'var(--brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0,
          }}>
            <Receipt size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
              GST Calculator
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              Compute GST inclusive/exclusive amounts for Indian tax rates
            </p>
          </div>
        </div>
      </div>

      {/* ── Rate Chips ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {GST_RATES.map(r => (
          <button
            key={r}
            onClick={() => setRate(r)}
            style={{
              padding: '6px 16px',
              fontSize: 13,
              fontWeight: 700,
              color: rate === r ? 'var(--brand)' : 'var(--text-secondary)',
              background: 'var(--bg-surface)',
              border: `1.5px solid ${rate === r ? 'var(--brand)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'all 150ms',
              fontFamily: 'var(--font-mono)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
            onMouseLeave={e => {
              const active = rate === r;
              e.currentTarget.style.borderColor = active ? 'var(--brand)' : 'var(--border)';
              e.currentTarget.style.color = active ? 'var(--brand)' : 'var(--text-secondary)';
            }}
          >
            {r}%
          </button>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ── LEFT: Inputs ── */}
        <div style={{
          padding: 24,
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>

          {/* Mode Toggle */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Calculation Mode
            </label>
            <ToggleGroup
              options={[
                { value: 'exclusive', label: 'GST Exclusive', desc: 'Add GST to amount' },
                { value: 'inclusive', label: 'GST Inclusive', desc: 'Extract GST from amount' },
              ]}
              value={mode}
              onChange={v => setMode(v as GstMode)}
            />
          </div>

          {/* Tax Type Toggle */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Tax Type
            </label>
            <ToggleGroup
              options={[
                { value: 'intra', label: 'Intra-State', desc: 'CGST + SGST' },
                { value: 'inter', label: 'Inter-State', desc: 'IGST' },
              ]}
              value={taxType}
              onChange={v => setTaxType(v as TaxType)}
            />
          </div>

          {/* Amount */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {mode === 'exclusive' ? 'Amount (before GST)' : 'Amount (including GST)'}
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                fontSize: 14, fontWeight: 600, color: 'var(--text-muted)',
              }}>
                ₹
              </span>
              <input
                type="text"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="Enter amount"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 34px',
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-base)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  transition: 'border-color 150ms',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* GST Rate (custom input) */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              GST Rate (%)
            </label>
            <input
              type="number"
              value={rate}
              onChange={e => setRate(Math.max(0, parseFloat(e.target.value) || 0))}
              min={0}
              step={0.5}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                background: 'var(--bg-base)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                transition: 'border-color 150ms',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Reset */}
          <button
            onClick={handleReset}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 0',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              color: 'var(--text-muted)',
              background: 'var(--bg-base)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        {/* ── RIGHT: Result ── */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 24px',
            borderBottom: '1.5px solid var(--border)',
          }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Breakdown
            </p>
            <button
              onClick={handleCopy}
              disabled={!result}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', fontSize: 12, fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                color: copied ? 'var(--success)' : 'var(--text-muted)',
                background: 'transparent',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: result ? 'pointer' : 'not-allowed',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { if (result && !copied) e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>

          {result ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Rows */}
              <div style={{ flex: 1, padding: '0' }}>
                <BreakdownRow label="Base Amount" value={`₹ ${fmt(result.baseAmount)}`} />
                <BreakdownRow
                  label={`GST @ ${result.rate}%`}
                  value={`₹ ${fmt(result.gstAmount)}`}
                  muted
                />

                {/* Tax split */}
                {taxType === 'intra' ? (
                  <>
                    <BreakdownRow label={`CGST @ ${result.rate / 2}%`} value={`₹ ${fmt(result.cgst)}`} indent muted />
                    <BreakdownRow label={`SGST @ ${result.rate / 2}%`} value={`₹ ${fmt(result.sgst)}`} indent muted />
                  </>
                ) : (
                  <BreakdownRow label={`IGST @ ${result.rate}%`} value={`₹ ${fmt(result.igst)}`} indent muted />
                )}
              </div>

              {/* Total */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1.5px solid var(--border)',
                background: 'var(--bg-base)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Total Amount
                </p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  ₹ {fmt(result.totalAmount)}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
              <div style={{ textAlign: 'center' }}>
                <Receipt size={40} style={{ color: 'var(--border)', marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                  Enter an amount to see GST breakdown
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Rate Reference Table ── */}
      {result && (
        <div style={{
          marginTop: 20,
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 24px', borderBottom: '1.5px solid var(--border)' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              All Rates for ₹ {fmt(result.baseAmount)}
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-base)' }}>
                  {['GST Rate', 'GST Amount', 'Total Amount'].map(h => (
                    <th key={h} style={{
                      padding: '10px 24px',
                      fontSize: 11, fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--text-muted)',
                      textAlign: 'right',
                      borderBottom: '1.5px solid var(--border)',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GST_RATES.map((r, i) => {
                  const gst = result.baseAmount * (r / 100);
                  const total = result.baseAmount + gst;
                  const isActive = r === rate;
                  return (
                    <tr
                      key={r}
                      style={{
                        background: isActive ? 'var(--bg-raised)' : i % 2 === 0 ? 'transparent' : 'var(--bg-base)',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                      onMouseLeave={e => e.currentTarget.style.background = isActive ? 'var(--bg-raised)' : i % 2 === 0 ? 'transparent' : 'var(--bg-base)'}
                    >
                      <td style={{
                        padding: '10px 24px', textAlign: 'right',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontFamily: 'var(--font-sans)',
                      }}>
                        {r}%
                      </td>
                      <td style={{ padding: '10px 24px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500 }}>
                        ₹ {fmt(gst)}
                      </td>
                      <td style={{
                        padding: '10px 24px', textAlign: 'right',
                        color: 'var(--text-primary)',
                        fontWeight: isActive ? 700 : 600,
                      }}>
                        ₹ {fmt(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* ── About GST ── */}
      <div style={{
        marginTop: 20,
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 24px', borderBottom: '1.5px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            What is GST?
          </p>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Goods and Services Tax (GST) is a unified indirect tax levied on the supply of goods and services across India.
            It replaced multiple taxes like VAT, Service Tax, and Excise Duty when it was introduced on 1st July 2017.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InfoCard
              title="CGST + SGST"
              subtitle="Intra-State (within same state)"
              desc="When buyer and seller are in the same state, GST is split equally into Central GST and State GST. Each gets half of the total GST amount."
            />
            <InfoCard
              title="IGST"
              subtitle="Inter-State (across states)"
              desc="When buyer and seller are in different states, the full GST is collected as Integrated GST by the central government."
            />
          </div>

          <div>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              GST Rate Slabs
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { rate: '5%', items: 'Essential goods, transport, small restaurants' },
                { rate: '12%', items: 'Processed food, business class flights, mobile phones' },
                { rate: '18%', items: 'Most goods & services, IT services, restaurants with AC' },
                { rate: '28%', items: 'Luxury items, automobiles, tobacco, aerated drinks' },
              ].map(slab => (
                <div key={slab.rate} style={{
                  padding: '12px 14px',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {slab.rate}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {slab.items}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              How is GST Calculated?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <FormulaRow
                label="GST Exclusive (adding GST)"
                formula="Total = Base Amount + (Base Amount x GST Rate / 100)"
              />
              <FormulaRow
                label="GST Inclusive (extracting GST)"
                formula="Base Amount = Total / (1 + GST Rate / 100)"
              />
            </div>
          </div>

          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            GST is administered by the GST Council. Businesses with annual turnover above ₹40 lakh (₹20 lakh for services)
            must register for GST and file regular returns. Composition scheme is available for small businesses with turnover up to ₹1.5 crore.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════ */

function InfoCard({ title, subtitle, desc }: { title: string; subtitle: string; desc: string }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: 'var(--bg-base)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
    }}>
      <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</p>
      <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{subtitle}</p>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

function FormulaRow({ label, formula }: { label: string; formula: string }) {
  return (
    <div style={{
      padding: '10px 14px',
      background: 'var(--bg-base)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
    }}>
      <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{formula}</p>
    </div>
  );
}

function BreakdownRow({ label, value, indent, muted }: {
  label: string;
  value: string;
  indent?: boolean;
  muted?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: `10px 24px 10px ${indent ? 40 : 24}px`,
      borderBottom: '1px solid var(--border)',
    }}>
      <p style={{
        margin: 0, fontSize: 13,
        fontWeight: indent ? 500 : 600,
        color: muted ? 'var(--text-muted)' : 'var(--text-primary)',
      }}>
        {indent && '└ '}{label}
      </p>
      <p style={{
        margin: 0, fontSize: 13,
        fontWeight: 600,
        color: muted ? 'var(--text-muted)' : 'var(--text-primary)',
        fontFamily: 'var(--font-mono)',
      }}>
        {value}
      </p>
    </div>
  );
}

function ToggleGroup({ options, value, onChange }: {
  options: { value: string; label: string; desc: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${options.length}, 1fr)`,
      gap: 8,
    }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '10px 12px',
              background: active ? 'var(--bg-base)' : 'transparent',
              border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 150ms',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <p style={{
              margin: '0 0 2px', fontSize: 13,
              fontWeight: 600,
              color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}>
              {opt.label}
            </p>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>
              {opt.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}
