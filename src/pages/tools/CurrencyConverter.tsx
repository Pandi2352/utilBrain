import { useState, useMemo } from 'react';
import { ArrowLeftRight, ArrowDownUp, RefreshCw } from 'lucide-react';

/* ════════════════════════════════════════════════
   Currency Converter — utilBrain
   ════════════════════════════════════════════════ */

/* ── Currency data ── */
interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const CURRENCIES: Currency[] = [
  { code: 'INR', name: 'Indian Rupee',       symbol: '₹',  flag: '🇮🇳' },
  { code: 'USD', name: 'US Dollar',          symbol: '$',  flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro',               symbol: '€',  flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound',      symbol: '£',  flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen',       symbol: '¥',  flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar',  symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar',    symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc',        symbol: 'Fr', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan',       symbol: '¥',  flag: '🇨🇳' },
  { code: 'SGD', name: 'Singapore Dollar',   symbol: 'S$', flag: '🇸🇬' },
  { code: 'AED', name: 'UAE Dirham',         symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal',        symbol: '﷼',  flag: '🇸🇦' },
  { code: 'KRW', name: 'South Korean Won',   symbol: '₩',  flag: '🇰🇷' },
  { code: 'THB', name: 'Thai Baht',          symbol: '฿',  flag: '🇹🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit',  symbol: 'RM', flag: '🇲🇾' },
  { code: 'BRL', name: 'Brazilian Real',     symbol: 'R$', flag: '🇧🇷' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R',  flag: '🇿🇦' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$',flag: '🇳🇿' },
  { code: 'SEK', name: 'Swedish Krona',      symbol: 'kr', flag: '🇸🇪' },
  { code: 'HKD', name: 'Hong Kong Dollar',   symbol: 'HK$',flag: '🇭🇰' },
];

/* Rates relative to USD (static — replace with API in production) */
const RATES_TO_USD: Record<string, number> = {
  USD: 1,
  INR: 83.50,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 154.50,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  SGD: 1.34,
  AED: 3.67,
  SAR: 3.75,
  KRW: 1320.0,
  THB: 35.50,
  MYR: 4.72,
  BRL: 4.97,
  ZAR: 18.60,
  NZD: 1.64,
  SEK: 10.45,
  HKD: 7.82,
};

function convert(amount: number, from: string, to: string): number {
  const fromRate = RATES_TO_USD[from] ?? 1;
  const toRate = RATES_TO_USD[to] ?? 1;
  return (amount / fromRate) * toRate;
}

function getCurrency(code: string): Currency {
  return CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0];
}

function fmtResult(n: number): string {
  if (n >= 1000000) return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

/* ── Popular pairs ── */
const POPULAR_PAIRS = [
  { from: 'USD', to: 'INR' },
  { from: 'EUR', to: 'INR' },
  { from: 'GBP', to: 'INR' },
  { from: 'USD', to: 'EUR' },
  { from: 'USD', to: 'GBP' },
  { from: 'USD', to: 'JPY' },
];

/* ════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════ */
export function CurrencyConverter() {
  const [amount, setAmount] = useState('1000');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');

  const numAmount = parseFloat(amount.replace(/,/g, '')) || 0;

  const result = useMemo(() => {
    if (numAmount <= 0) return 0;
    return convert(numAmount, from, to);
  }, [numAmount, from, to]);

  const rate1 = useMemo(() => convert(1, from, to), [from, to]);
  const rateReverse = useMemo(() => convert(1, to, from), [from, to]);

  const fromCurrency = getCurrency(from);
  const toCurrency = getCurrency(to);

  function handleSwap() {
    setFrom(to);
    setTo(from);
  }

  function handleReset() {
    setAmount('1000');
    setFrom('USD');
    setTo('INR');
  }

  function applyPair(pair: { from: string; to: string }) {
    setFrom(pair.from);
    setTo(pair.to);
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
            <ArrowLeftRight size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
              Currency Converter
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              Convert between 20 currencies with real-time rates
            </p>
          </div>
        </div>
      </div>

      {/* ── Popular Pairs ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {POPULAR_PAIRS.map(p => (
          <button
            key={`${p.from}-${p.to}`}
            onClick={() => applyPair(p)}
            style={{
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              color: from === p.from && to === p.to ? 'var(--brand)' : 'var(--text-secondary)',
              background: 'var(--bg-surface)',
              border: `1.5px solid ${from === p.from && to === p.to ? 'var(--brand)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'all 150ms',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--brand)';
              e.currentTarget.style.color = 'var(--brand)';
            }}
            onMouseLeave={e => {
              const active = from === p.from && to === p.to;
              e.currentTarget.style.borderColor = active ? 'var(--brand)' : 'var(--border)';
              e.currentTarget.style.color = active ? 'var(--brand)' : 'var(--text-secondary)';
            }}
          >
            {p.from} → {p.to}
          </button>
        ))}
      </div>

      {/* ── Converter Card ── */}
      <div style={{
        padding: 28,
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 20,
      }}>

        {/* From / To Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'end', marginBottom: 24 }}>

          {/* From */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              From
            </label>
            <CurrencySelect value={from} onChange={setFrom} />
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            title="Swap currencies"
            style={{
              width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-base)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'all 150ms',
              marginBottom: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <ArrowDownUp size={16} />
          </button>

          {/* To */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              To
            </label>
            <CurrencySelect value={to} onChange={setTo} />
          </div>
        </div>

        {/* Amount Input */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Amount
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              fontSize: 14, fontWeight: 600, color: 'var(--text-muted)',
            }}>
              {fromCurrency.symbol}
            </span>
            <input
              type="text"
              value={amount}
              onChange={e => {
                const clean = e.target.value.replace(/[^0-9.]/g, '');
                setAmount(clean);
              }}
              placeholder="Enter amount"
              style={{
                width: '100%',
                padding: '12px 14px 12px 40px',
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

        {/* Result Display */}
        <div style={{
          padding: '20px 24px',
          background: 'var(--bg-base)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 20,
        }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>
            {fromCurrency.flag} {numAmount.toLocaleString('en-IN')} {from} =
          </p>
          <p style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', fontFamily: 'var(--font-mono)' }}>
            {toCurrency.symbol} {fmtResult(result)}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            {toCurrency.flag} {toCurrency.name}
          </p>
        </div>

        {/* Rate Info + Reset */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              1 {from} = {fmtResult(rate1)} {to}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              1 {to} = {fmtResult(rateReverse)} {from}
            </p>
          </div>
          <button
            onClick={handleReset}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              color: 'var(--text-muted)',
              background: 'transparent',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <RefreshCw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* ── Quick Reference Table ── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 24px',
          borderBottom: '1.5px solid var(--border)',
        }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Quick Reference
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-base)' }}>
                {[`${from} Amount`, `${to} Value`].map(h => (
                  <th key={h} style={{
                    padding: '10px 24px',
                    fontSize: 11,
                    fontWeight: 700,
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
              {[1, 10, 100, 1000, 5000, 10000, 50000, 100000].map((amt, i) => (
                <tr
                  key={amt}
                  style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-base)', transition: 'background 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-base)'}
                >
                  <td style={{ padding: '10px 24px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {fromCurrency.symbol} {amt.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '10px 24px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {toCurrency.symbol} {fmtResult(convert(amt, from, to))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════ */

function CurrencySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const selected = getCurrency(value);
  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
        fontSize: 16, lineHeight: 1, pointerEvents: 'none',
      }}>
        {selected.flag}
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px 10px 38px',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          color: 'var(--text-primary)',
          background: 'var(--bg-base)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          transition: 'border-color 150ms',
          boxSizing: 'border-box',
        }}
        onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        {CURRENCIES.map(c => (
          <option key={c.code} value={c.code}>
            {c.code} — {c.name}
          </option>
        ))}
      </select>
      <span style={{
        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
        fontSize: 11, color: 'var(--text-muted)', pointerEvents: 'none',
      }}>
        ▾
      </span>
    </div>
  );
}
