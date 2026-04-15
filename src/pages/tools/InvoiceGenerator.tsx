import { useState, useMemo, useEffect, useRef } from 'react';
import { FileText, Plus, Trash2, Printer, RotateCcw, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/* ════════════════════════════════════════════════
   Invoice Generator — utilBrain
   Creates GST-compliant Indian invoices
   ════════════════════════════════════════════════ */

/* ── Types ── */
interface Party {
  name: string;
  gstin: string;
  address: string;
  phone: string;
  email: string;
}

interface LineItem {
  id: string;
  description: string;
  hsn: string;
  qty: number;
  rate: number;
  taxRate: number;
}

interface InvoiceMeta {
  number: string;
  date: string;
  dueDate: string;
  placeOfSupply: string;
}

type TaxType = 'intra' | 'inter';

/* ── Defaults ── */
const emptyParty: Party = { name: '', gstin: '', address: '', phone: '', email: '' };

const defaultItems: LineItem[] = [
  { id: crypto.randomUUID(), description: '', hsn: '', qty: 1, rate: 0, taxRate: 18 },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function plusDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmt(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function nextInvoiceNumber(): string {
  const n = new Date();
  const y = n.getFullYear().toString().slice(-2);
  const m = String(n.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `INV-${y}${m}-${rand}`;
}

/* ── Number to words (Indian) ── */
function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
  }

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let words = 'Rupees ' + inWords(rupees);
  if (paise > 0) words += ' and ' + inWords(paise) + ' Paise';
  return words + ' Only';
}

/* ════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════ */
export function InvoiceGenerator() {
  const [seller, setSeller] = useState<Party>(emptyParty);
  const [buyer, setBuyer]   = useState<Party>(emptyParty);
  const [meta, setMeta]     = useState<InvoiceMeta>({
    number: nextInvoiceNumber(),
    date: today(),
    dueDate: plusDays(today(), 15),
    placeOfSupply: '',
  });
  const [items, setItems]     = useState<LineItem[]>(defaultItems);
  const [taxType, setTaxType] = useState<TaxType>('intra');
  const [notes, setNotes]     = useState('Thank you for your business. Payment is due within 15 days.');
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  /* ── Totals ── */
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;
    const taxSlabs: Record<number, { taxable: number; tax: number }> = {};

    items.forEach(it => {
      const lineBase = it.qty * it.rate;
      const lineTax = lineBase * (it.taxRate / 100);
      subtotal += lineBase;
      totalTax += lineTax;

      if (!taxSlabs[it.taxRate]) taxSlabs[it.taxRate] = { taxable: 0, tax: 0 };
      taxSlabs[it.taxRate].taxable += lineBase;
      taxSlabs[it.taxRate].tax += lineTax;
    });

    const cgst = taxType === 'intra' ? totalTax / 2 : 0;
    const sgst = taxType === 'intra' ? totalTax / 2 : 0;
    const igst = taxType === 'inter' ? totalTax : 0;
    const grandTotal = subtotal + totalTax;

    return {
      subtotal,
      totalTax,
      cgst,
      sgst,
      igst,
      grandTotal,
      taxSlabs: Object.entries(taxSlabs).map(([rate, v]) => ({ rate: +rate, ...v })),
    };
  }, [items, taxType]);

  /* ── Item ops ── */
  function addItem() {
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      description: '',
      hsn: '',
      qty: 1,
      rate: 0,
      taxRate: 18,
    }]);
  }
  function removeItem(id: string) {
    setItems(prev => prev.length === 1 ? prev : prev.filter(it => it.id !== id));
  }
  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));
  }

  function handleReset() {
    if (!confirm('Clear all invoice data?')) return;
    setSeller(emptyParty);
    setBuyer(emptyParty);
    setMeta({
      number: nextInvoiceNumber(),
      date: today(),
      dueDate: plusDays(today(), 15),
      placeOfSupply: '',
    });
    setItems(defaultItems);
    setTaxType('intra');
    setNotes('');
  }

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPdf() {
    if (!previewRef.current || downloading) return;
    setDownloading(true);

    /* A4 at 96dpi = 794px wide. Inner width (with margins) ≈ 720px.
       Rendering the preview at this width means its text sizes land
       at natural A4 proportions — no stretching, readable output. */
    const A4_INNER_WIDTH_PX = 720;

    const el = previewRef.current;
    const originalStyle = el.getAttribute('style') ?? '';

    try {
      /* Lock preview to A4-inner width for the capture, unclip scroll + sticky. */
      el.style.width       = `${A4_INNER_WIDTH_PX}px`;
      el.style.maxWidth    = `${A4_INNER_WIDTH_PX}px`;
      el.style.maxHeight   = 'none';
      el.style.overflow    = 'visible';
      el.style.position    = 'static';
      el.style.padding     = '36px 40px';

      /* Give layout a tick to settle */
      await new Promise(r => requestAnimationFrame(r));

      const canvas = await html2canvas(el, {
        scale: 2,                    /* 2x for crisp text */
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: A4_INNER_WIDTH_PX,
      });

      /* Build PDF: canvas is already at proper A4 proportions, just place it. */
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pageWidth  = pdf.internal.pageSize.getWidth();   /* 210 */
      const pageHeight = pdf.internal.pageSize.getHeight();  /* 297 */
      const margin = 10;
      const imgWidth  = pageWidth - margin * 2;              /* 190mm */
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const imgData = canvas.toDataURL('image/png');

      if (imgHeight <= pageHeight - margin * 2) {
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      } else {
        /* Multi-page: slice canvas into page-sized chunks */
        const pageInnerHeight = pageHeight - margin * 2;
        const pxPerMm = canvas.width / imgWidth;
        const sliceHeightPx = Math.floor(pageInnerHeight * pxPerMm);

        let renderedPx = 0;
        let pageIdx = 0;
        while (renderedPx < canvas.height) {
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width  = canvas.width;
          sliceCanvas.height = Math.min(sliceHeightPx, canvas.height - renderedPx);
          const ctx = sliceCanvas.getContext('2d');
          if (!ctx) break;
          ctx.drawImage(canvas, 0, -renderedPx);
          const sliceData = sliceCanvas.toDataURL('image/png');
          const sliceHeightMm = (sliceCanvas.height / canvas.width) * imgWidth;

          if (pageIdx > 0) pdf.addPage();
          pdf.addImage(sliceData, 'PNG', margin, margin, imgWidth, sliceHeightMm);

          renderedPx += sliceCanvas.height;
          pageIdx++;
        }
      }

      const filename = `${meta.number || 'invoice'}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      /* Always restore original styles */
      el.setAttribute('style', originalStyle);
      setDownloading(false);
    }
  }

  /* ── Inject print styles once ── */
  useEffect(() => {
    const styleId = 'invoice-print-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @media print {
        body > #root > div > aside,
        body > #root > div > div > header,
        .invoice-editor,
        .invoice-toolbar { display: none !important; }
        .invoice-preview {
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          max-width: 100% !important;
        }
        main { overflow: visible !important; }
        @page { size: A4; margin: 15mm; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}>

      {/* ── Header ── */}
      <div className="invoice-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: 'var(--brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0,
          }}>
            <FileText size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
              Invoice Generator
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              Create GST-compliant invoices with itemized breakdown
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ActionButton onClick={handleReset} icon={<RotateCcw size={14} />} label="Reset" />
          <ActionButton onClick={handlePrint} icon={<Printer size={14} />} label="Print" />
          <ActionButton
            onClick={handleDownloadPdf}
            icon={<Download size={14} />}
            label={downloading ? 'Generating…' : 'Download PDF'}
            primary
            disabled={downloading}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ═══════════════════════════════
           LEFT — EDITOR
           ═══════════════════════════════ */}
        <div className="invoice-editor" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Invoice Meta */}
          <Section title="Invoice Details">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Invoice Number">
                <Input value={meta.number} onChange={v => setMeta({ ...meta, number: v })} placeholder="INV-2504-0001" />
              </Field>
              <Field label="Place of Supply">
                <Input value={meta.placeOfSupply} onChange={v => setMeta({ ...meta, placeOfSupply: v })} placeholder="e.g. Karnataka (29)" />
              </Field>
              <Field label="Invoice Date">
                <Input type="date" value={meta.date} onChange={v => setMeta({ ...meta, date: v })} />
              </Field>
              <Field label="Due Date">
                <Input type="date" value={meta.dueDate} onChange={v => setMeta({ ...meta, dueDate: v })} />
              </Field>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Tax Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {([
                  { value: 'intra', label: 'Intra-State', desc: 'CGST + SGST' },
                  { value: 'inter', label: 'Inter-State', desc: 'IGST' },
                ] as const).map(opt => {
                  const active = taxType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setTaxType(opt.value)}
                      style={{
                        padding: '8px 12px',
                        background: active ? 'var(--bg-base)' : 'transparent',
                        border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 150ms',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {opt.label}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* Seller */}
          <Section title="From (Your Business)">
            <PartyForm party={seller} onChange={setSeller} />
          </Section>

          {/* Buyer */}
          <Section title="Bill To (Customer)">
            <PartyForm party={buyer} onChange={setBuyer} />
          </Section>

          {/* Line items */}
          <Section
            title="Line Items"
            right={
              <button
                onClick={addItem}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px',
                  fontSize: 12, fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--brand)',
                  background: 'transparent',
                  border: '1.5px solid var(--brand)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                <Plus size={12} /> Add Item
              </button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((it, idx) => (
                <div key={it.id} style={{
                  padding: 12,
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Item #{idx + 1}
                    </span>
                    <button
                      onClick={() => removeItem(it.id)}
                      disabled={items.length === 1}
                      title="Remove item"
                      style={{
                        width: 24, height: 24,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none',
                        background: 'transparent',
                        color: items.length === 1 ? 'var(--border)' : 'var(--text-muted)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                        transition: 'color 150ms',
                      }}
                      onMouseEnter={e => { if (items.length > 1) e.currentTarget.style.color = 'var(--danger)'; }}
                      onMouseLeave={e => { if (items.length > 1) e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, marginBottom: 8 }}>
                    <Input
                      value={it.description}
                      onChange={v => updateItem(it.id, { description: v })}
                      placeholder="Description"
                    />
                    <Input
                      value={it.hsn}
                      onChange={v => updateItem(it.id, { hsn: v })}
                      placeholder="HSN / SAC"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                    <NumInput label="Qty" value={it.qty} onChange={v => updateItem(it.id, { qty: v })} min={0} />
                    <NumInput label="Rate (₹)" value={it.rate} onChange={v => updateItem(it.id, { rate: v })} min={0} />
                    <NumInput label="Tax %" value={it.taxRate} onChange={v => updateItem(it.id, { taxRate: v })} min={0} max={100} />
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Total
                      </label>
                      <div style={{
                        padding: '8px 10px',
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        textAlign: 'right',
                      }}>
                        ₹ {fmt(it.qty * it.rate * (1 + it.taxRate / 100))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Notes */}
          <Section title="Notes / Terms">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Payment terms, bank details, etc."
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 13,
                fontFamily: 'var(--font-sans)',
                color: 'var(--text-primary)',
                background: 'var(--bg-base)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 150ms',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </Section>
        </div>

        {/* ═══════════════════════════════
           RIGHT — PREVIEW
           ═══════════════════════════════ */}
        <div
          ref={previewRef}
          className="invoice-preview"
          style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 32,
            position: 'sticky',
            top: 20,
            alignSelf: 'start',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-primary)',
          }}
        >
          {/* Preview Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, paddingBottom: 20, borderBottom: '2px solid var(--text-primary)' }}>
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                {seller.name || 'Your Business Name'}
              </h2>
              {seller.gstin && (
                <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  GSTIN: {seller.gstin}
                </p>
              )}
              {seller.address && (
                <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
                  {seller.address}
                </p>
              )}
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {seller.phone && <span>{seller.phone}</span>}
                {seller.phone && seller.email && <span> · </span>}
                {seller.email && <span>{seller.email}</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 2px', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                INVOICE
              </p>
              <p style={{ margin: 0, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                # {meta.number}
              </p>
            </div>
          </div>

          {/* Meta + Bill To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Bill To
              </p>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                {buyer.name || 'Customer Name'}
              </p>
              {buyer.gstin && (
                <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  GSTIN: {buyer.gstin}
                </p>
              )}
              {buyer.address && (
                <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
                  {buyer.address}
                </p>
              )}
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {buyer.phone && <span>{buyer.phone}</span>}
                {buyer.phone && buyer.email && <span> · </span>}
                {buyer.email && <span>{buyer.email}</span>}
              </div>
            </div>
            <div>
              <PreviewMetaRow label="Invoice Date" value={formatDate(meta.date)} />
              <PreviewMetaRow label="Due Date" value={formatDate(meta.dueDate)} />
              {meta.placeOfSupply && <PreviewMetaRow label="Place of Supply" value={meta.placeOfSupply} />}
              <PreviewMetaRow label="Tax Type" value={taxType === 'intra' ? 'Intra-State' : 'Inter-State'} />
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'var(--bg-base)' }}>
                {['#', 'Description', 'HSN', 'Qty', 'Rate', 'Tax', 'Amount'].map((h, i) => (
                  <th key={h} style={{
                    padding: '10px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-muted)',
                    textAlign: i === 1 ? 'left' : i === 0 || i === 2 ? 'center' : 'right',
                    borderBottom: '1.5px solid var(--border)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const lineTotal = it.qty * it.rate;
                const lineTotalWithTax = lineTotal * (1 + it.taxRate / 100);
                return (
                  <tr key={it.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 8px', fontSize: 11, textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ padding: '10px 8px', fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>
                      {it.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>(no description)</span>}
                    </td>
                    <td style={{ padding: '10px 8px', fontSize: 11, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{it.hsn || '—'}</td>
                    <td style={{ padding: '10px 8px', fontSize: 12, textAlign: 'right', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{it.qty}</td>
                    <td style={{ padding: '10px 8px', fontSize: 12, textAlign: 'right', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{fmt(it.rate)}</td>
                    <td style={{ padding: '10px 8px', fontSize: 11, textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{it.taxRate}%</td>
                    <td style={{ padding: '10px 8px', fontSize: 12, textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{fmt(lineTotalWithTax)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <div style={{ minWidth: 260 }}>
              <TotalRow label="Subtotal" value={fmt(totals.subtotal)} />
              {totals.taxSlabs.length > 0 && taxType === 'intra' && totals.taxSlabs.map(s => (
                <div key={s.rate}>
                  <TotalRow label={`CGST @ ${s.rate / 2}%`} value={fmt(s.tax / 2)} muted />
                  <TotalRow label={`SGST @ ${s.rate / 2}%`} value={fmt(s.tax / 2)} muted />
                </div>
              ))}
              {totals.taxSlabs.length > 0 && taxType === 'inter' && totals.taxSlabs.map(s => (
                <TotalRow key={s.rate} label={`IGST @ ${s.rate}%`} value={fmt(s.tax)} muted />
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '12px 0',
                borderTop: '2px solid var(--text-primary)',
                marginTop: 4,
              }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Grand Total</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  ₹ {fmt(totals.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Amount in words */}
          {totals.grandTotal > 0 && (
            <div style={{
              padding: '12px 16px',
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
            }}>
              <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Amount in Words
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, fontStyle: 'italic' }}>
                {numberToWords(totals.grandTotal)}
              </p>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Notes
              </p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {notes}
              </p>
            </div>
          )}

          {/* Footer */}
          <p style={{ margin: '32px 0 0', textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>
            This is a computer-generated invoice and does not require a signature.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════ */

function Section({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1.5px solid var(--border)',
      }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</p>
        {right}
      </div>
      <div style={{ padding: 16 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 4, fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '8px 10px',
        fontSize: 13,
        fontWeight: 500,
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
  );
}

function NumInput({ label, value, onChange, min, max }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 4, fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(Math.max(min ?? -Infinity, parseFloat(e.target.value) || 0))}
        style={{
          width: '100%',
          padding: '8px 10px',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)',
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          textAlign: 'right',
          transition: 'border-color 150ms',
          boxSizing: 'border-box',
        }}
        onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
      />
    </div>
  );
}

function PartyForm({ party, onChange }: { party: Party; onChange: (p: Party) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Name">
          <Input value={party.name} onChange={v => onChange({ ...party, name: v })} placeholder="Business / Customer name" />
        </Field>
        <Field label="GSTIN">
          <Input value={party.gstin} onChange={v => onChange({ ...party, gstin: v })} placeholder="29ABCDE1234F2Z5" />
        </Field>
      </div>
      <Field label="Address">
        <textarea
          value={party.address}
          onChange={e => onChange({ ...party, address: e.target.value })}
          rows={2}
          placeholder="Street, City, State, PIN"
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: 13,
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-primary)',
            background: 'var(--bg-base)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            resize: 'vertical',
            transition: 'border-color 150ms',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
        />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Phone">
          <Input value={party.phone} onChange={v => onChange({ ...party, phone: v })} placeholder="+91 98765 43210" />
        </Field>
        <Field label="Email">
          <Input type="email" value={party.email} onChange={v => onChange({ ...party, email: v })} placeholder="name@example.com" />
        </Field>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, primary, disabled }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 14px',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        color: primary ? '#fff' : 'var(--text-secondary)',
        background: primary ? 'var(--brand)' : 'var(--bg-surface)',
        border: `1.5px solid ${primary ? 'var(--brand)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 150ms',
      }}
      onMouseEnter={e => {
        if (disabled) return;
        if (primary) e.currentTarget.style.background = 'var(--brand-dark)';
        else { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }
      }}
      onMouseLeave={e => {
        if (disabled) return;
        if (primary) e.currentTarget.style.background = 'var(--brand)';
        else { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }
      }}
    >
      {icon} {label}
    </button>
  );
}

function PreviewMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 11 }}>
      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function TotalRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
      <span style={{ fontSize: 12, color: muted ? 'var(--text-muted)' : 'var(--text-secondary)', fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: muted ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
        {value}
      </span>
    </div>
  );
}

