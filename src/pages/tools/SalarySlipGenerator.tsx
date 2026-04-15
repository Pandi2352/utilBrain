import { useState, useMemo, useRef } from 'react';
import { Wallet, Plus, Trash2, Printer, RotateCcw, Download, Landmark, User, CalendarDays } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/* ════════════════════════════════════════════════
   Salary Slip Generator — utilBrain
   ════════════════════════════════════════════════ */

interface DetailItem {
  id: string;
  label: string;
  amount: number;
}

interface EmployeeInfo {
  name: string;
  employeeId: string;
  designation: string;
  department: string;
  month: string;
  year: string;
  bankName: string;
  accountNumber: string;
  pan: string;
  uan: string;
  doj: string;
  workingDays: number;
  paidDays: number;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

const defaultEarnings: DetailItem[] = [
  { id: '1', label: 'Basic Salary', amount: 25000 },
  { id: '2', label: 'House Rent Allowance (HRA)', amount: 10000 },
  { id: '3', label: 'Conveyance Allowance', amount: 1600 },
  { id: '4', label: 'Medical Allowance', amount: 1250 },
  { id: '5', label: 'Special Allowance', amount: 5000 },
];

const defaultDeductions: DetailItem[] = [
  { id: 'd1', label: 'Provident Fund (PF)', amount: 1800 },
  { id: 'd2', label: 'Professional Tax (PT)', amount: 200 },
  { id: 'd3', label: 'TDS / Income Tax', amount: 0 },
];

function fmt(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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
  let words = 'Rupees ' + inWords(rupees);
  return words + ' Only';
}

export function SalarySlipGenerator() {
  const [emp, setEmp] = useState<EmployeeInfo>({
    name: '',
    employeeId: '',
    designation: '',
    department: '',
    month: months[new Date().getMonth()],
    year: currentYear.toString(),
    bankName: '',
    accountNumber: '',
    pan: '',
    uan: '',
    doj: '',
    workingDays: 30,
    paidDays: 30,
  });

  const [earnings, setEarnings] = useState<DetailItem[]>(defaultEarnings);
  const [deductions, setDeductions] = useState<DetailItem[]>(defaultDeductions);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const totals = useMemo(() => {
    const grossVal = earnings.reduce((acc, it) => acc + it.amount, 0);
    const deductionVal = deductions.reduce((acc, it) => acc + it.amount, 0);
    return {
      gross: grossVal,
      deductions: deductionVal,
      net: grossVal - deductionVal,
    };
  }, [earnings, deductions]);

  const handleReset = () => {
    if (!confirm('Reset all salary slip data?')) return;
    setEarnings(defaultEarnings);
    setDeductions(defaultDeductions);
    setEmp({
      ...emp,
      name: '',
      employeeId: '',
      designation: '',
      department: '',
      bankName: '',
      accountNumber: '',
      pan: '',
      uan: '',
      doj: '',
    });
  };

  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    if (!previewRef.current || downloading) return;
    setDownloading(true);
    const A4_INNER_WIDTH_PX = 720;
    const el = previewRef.current;
    const originalStyle = el.getAttribute('style') ?? '';

    try {
      el.style.width = `${A4_INNER_WIDTH_PX}px`;
      el.style.maxWidth = `${A4_INNER_WIDTH_PX}px`;
      el.style.maxHeight = 'none';
      el.style.overflow = 'visible';
      el.style.position = 'static';
      el.style.padding = '36px 40px';
      el.style.boxShadow = 'none';
      el.style.border = 'none';

      await new Promise(r => requestAnimationFrame(r));
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: A4_INNER_WIDTH_PX });

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      pdf.save(`SalarySlip_${emp.name || 'Employee'}_${emp.month}_${emp.year}.pdf`);
    } catch (err) {
      console.error('PDF fail:', err);
      alert('PDF generation failed.');
    } finally {
      el.setAttribute('style', originalStyle);
      setDownloading(false);
    }
  };

  const addEarning = () => setEarnings([...earnings, { id: crypto.randomUUID(), label: '', amount: 0 }]);
  const addDeduction = () => setDeductions([...deductions, { id: crypto.randomUUID(), label: '', amount: 0 }]);

  const updateItem = (list: DetailItem[], setList: Function, id: string, patch: Partial<DetailItem>) => {
    setList(list.map(it => it.id === id ? { ...it, ...patch } : it));
  };

  const removeItem = (list: DetailItem[], setList: Function, id: string) => {
    if (list.length > 1) setList(list.filter(it => it.id !== id));
  };

  return (
    <div style={{ padding: '28px 28px 60px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      {/* ── Header ── */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Wallet size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Salary Slip Generator</h1>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Create professional payslips with earnings and deductions</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ActionButton onClick={handleReset} icon={<RotateCcw size={14} />} label="Reset" />
          <ActionButton onClick={handlePrint} icon={<Printer size={14} />} label="Print" />
          <ActionButton onClick={handleDownloadPdf} icon={<Download size={14} />} label={downloading ? 'Gen...' : 'Download PDF'} primary disabled={downloading} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20 }}>
        {/* ── LEFT: EDITOR ── */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Employee Info */}
          <Section icon={<User size={14} />} title="Employee & Organization">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Employee Name"><Input value={emp.name} onChange={v => setEmp({ ...emp, name: v })} placeholder="e.g. John Doe" /></Field>
              <Field label="Employee ID"><Input value={emp.employeeId} onChange={v => setEmp({ ...emp, employeeId: v })} placeholder="EMP001" /></Field>
              <Field label="Designation"><Input value={emp.designation} onChange={v => setEmp({ ...emp, designation: v })} placeholder="Software Engineer" /></Field>
              <Field label="Department"><Input value={emp.department} onChange={v => setEmp({ ...emp, department: v })} placeholder="Engineering" /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 10 }}>
              <Field label="Month">
                <Select value={emp.month} onChange={v => setEmp({ ...emp, month: v })} options={months} />
              </Field>
              <Field label="Year">
                <Select value={emp.year} onChange={v => setEmp({ ...emp, year: v })} options={years} />
              </Field>
              <Field label="Date of Joining"><Input type="date" value={emp.doj} onChange={v => setEmp({ ...emp, doj: v })} /></Field>
            </div>
          </Section>

          {/* Bank & Tax Details */}
          <Section icon={<Landmark size={14} />} title="Bank & Statutory Details">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Bank Name"><Input value={emp.bankName} onChange={v => setEmp({ ...emp, bankName: v })} placeholder="ICICI Bank" /></Field>
              <Field label="Account Number"><Input value={emp.accountNumber} onChange={v => setEmp({ ...emp, accountNumber: v })} placeholder="XXXX XXXX XXXX" /></Field>
              <Field label="PAN Card"><Input value={emp.pan} onChange={v => setEmp({ ...emp, pan: v })} placeholder="ABCDE1234F" /></Field>
              <Field label="UAN (PF Number)"><Input value={emp.uan} onChange={v => setEmp({ ...emp, uan: v })} placeholder="100XXXXXXXXX" /></Field>
            </div>
          </Section>

          {/* Attendance */}
          <Section icon={<CalendarDays size={14} />} title="Attendance">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Working Days"><Input type="number" value={emp.workingDays.toString()} onChange={v => setEmp({ ...emp, workingDays: +v })} /></Field>
              <Field label="Paid Days"><Input type="number" value={emp.paidDays.toString()} onChange={v => setEmp({ ...emp, paidDays: +v })} /></Field>
            </div>
          </Section>

          {/* Earnings & Deductions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Section title="Earnings" right={<AddBtn onClick={addEarning} />}>
              <ItemList items={earnings} onUpdate={(id, p) => updateItem(earnings, setEarnings, id, p)} onRemove={id => removeItem(earnings, setEarnings, id)} />
            </Section>
            <Section title="Deductions" right={<AddBtn onClick={addDeduction} />}>
              <ItemList items={deductions} onUpdate={(id, p) => updateItem(deductions, setDeductions, id, p)} onRemove={id => removeItem(deductions, setDeductions, id)} />
            </Section>
          </div>
        </div>

        {/* ── RIGHT: PREVIEW ── */}
        <div ref={previewRef} className="payslip-preview" style={{
          background: '#fff', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 32,
          position: 'sticky', top: 20, alignSelf: 'start', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto'
        }}>
          {/* Organization Header Placeholder */}
          <div style={{ textAlign: 'center', paddingBottom: 20, borderBottom: '2px solid #000', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Salary Slip</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 700, opacity: 0.7 }}>{emp.month} {emp.year}</p>
          </div>

          {/* Emp Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24, fontSize: 11 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <InfoRow label="Employee Name" value={emp.name || '—'} />
              <InfoRow label="Employee ID" value={emp.employeeId || '—'} />
              <InfoRow label="Designation" value={emp.designation || '—'} />
              <InfoRow label="Department" value={emp.department || '—'} />
              <InfoRow label="DOJ" value={emp.doj || '—'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <InfoRow label="Bank Name" value={emp.bankName || '—'} />
              <InfoRow label="Account No" value={emp.accountNumber || '—'} />
              <InfoRow label="PAN Number" value={emp.pan || '—'} />
              <InfoRow label="UAN Number" value={emp.uan || '—'} />
              <InfoRow label="Paid Days" value={emp.paidDays.toString()} />
            </div>
          </div>

          {/* Main Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
            <thead>
              <tr style={{ background: '#f8f8f8', borderBottom: '1px solid #000' }}>
                <th style={{ padding: '8px', textAlign: 'left', fontSize: 11, borderRight: '1px solid #000' }}>Earnings</th>
                <th style={{ padding: '8px', textAlign: 'right', fontSize: 11, borderRight: '1px solid #000' }}>Amount</th>
                <th style={{ padding: '8px', textAlign: 'left', fontSize: 11, borderRight: '1px solid #000' }}>Deductions</th>
                <th style={{ padding: '8px', textAlign: 'right', fontSize: 11 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.max(earnings.length, deductions.length) }).map((_, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '6px 8px', fontSize: 11, borderRight: '1px solid #000' }}>{earnings[idx]?.label || ''}</td>
                  <td style={{ padding: '6px 8px', fontSize: 11, textAlign: 'right', borderRight: '1px solid #000', fontFamily: 'var(--font-mono)' }}>{earnings[idx] ? fmt(earnings[idx].amount) : ''}</td>
                  <td style={{ padding: '6px 8px', fontSize: 11, borderRight: '1px solid #000' }}>{deductions[idx]?.label || ''}</td>
                  <td style={{ padding: '6px 8px', fontSize: 11, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{deductions[idx] ? fmt(deductions[idx].amount) : ''}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid #000', background: '#f8f8f8', fontWeight: 800 }}>
                <td style={{ padding: '8px', fontSize: 11, borderRight: '1px solid #000' }}>Total Earnings</td>
                <td style={{ padding: '8px', fontSize: 11, textAlign: 'right', borderRight: '1px solid #000', fontFamily: 'var(--font-mono)' }}>{fmt(totals.gross)}</td>
                <td style={{ padding: '8px', fontSize: 11, borderRight: '1px solid #000' }}>Total Deductions</td>
                <td style={{ padding: '8px', fontSize: 11, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmt(totals.deductions)}</td>
              </tr>
            </tbody>
          </table>

          {/* Summary */}
          <div style={{ marginTop: 24, border: '1px solid #000', padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', opacity: 0.6 }}>Net Salary Payable</p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, fontStyle: 'italic' }}>{numberToWords(totals.net)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>₹ {fmt(totals.net)}</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 60, display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 120, borderBottom: '1px solid #000', marginBottom: 4 }} />
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700 }}>Employee Signature</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 120, borderBottom: '1px solid #000', marginBottom: 4 }} />
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700 }}>Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── UI Helpers ── */
function ActionButton({ onClick, icon, label, primary, disabled }: any) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 36,
      fontSize: 13, fontWeight: 700, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 150ms',
      background: primary ? 'var(--brand)' : 'var(--bg-surface)', border: primary ? 'none' : '1.5px solid var(--border)',
      color: primary ? '#fff' : 'var(--text-secondary)'
    }}>{icon} {label}</button>
  );
}

function Section({ title, children, right, icon }: any) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1.5px solid var(--border)', background: 'rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && <span style={{ color: 'var(--brand)' }}>{icon}</span>}
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{title}</h3>
        </div>
        {right}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: any) {
  return <div style={{ marginBottom: 10 }}><label style={{ display: 'block', marginBottom: 4, fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>{children}</div>;
}

function Input({ value, onChange, placeholder, type = 'text' }: any) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
      width: '100%', padding: '8px 10px', fontSize: 13, fontWeight: 500, background: 'var(--bg-base)',
      border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color 150ms', boxSizing: 'border-box'
    }} />
  );
}

function Select({ value, onChange, options }: any) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      width: '100%', padding: '7.5px 10px', fontSize: 13, fontWeight: 500, background: 'var(--bg-base)',
      border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', cursor: 'pointer', boxSizing: 'border-box'
    }}>
      {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function AddBtn({ onClick }: any) {
  return <button onClick={onClick} style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add</button>;
}

function ItemList({ items, onUpdate, onRemove }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((it: any) => (
        <div key={it.id} style={{ display: 'flex', gap: 6 }}>
          <input value={it.label} onChange={e => onUpdate(it.id, { label: e.target.value })} placeholder="Item" style={{ flex: 2, padding: '6px 8px', fontSize: 12, border: '1px solid var(--border)', background: 'var(--bg-base)', borderRadius: 4 }} />
          <input type="number" value={it.amount} onChange={e => onUpdate(it.id, { amount: parseFloat(e.target.value) || 0 })} style={{ flex: 1, padding: '6px 8px', fontSize: 12, border: '1px solid var(--border)', background: 'var(--bg-base)', borderRadius: 4, textAlign: 'right' }} />
          <button onClick={() => onRemove(it.id)} style={{ padding: '0 8px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={13} /></button>
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 4 }}>
      <span style={{ fontWeight: 700, color: '#666' }}>{label}:</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
