import type { NavSection } from '../types/navigation';

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'finance',
    title: 'Finance & Business',
    items: [
      { id: 'emi',        label: 'EMI Calculator',     icon: 'IndianRupee',    path: '/tools/emi' },
      { id: 'gst',        label: 'GST Calculator',     icon: 'Receipt',        path: '/tools/gst' },
      { id: 'sip',        label: 'SIP Calculator',     icon: 'TrendingUp',     path: '/tools/sip' },
      { id: 'fd-rd',      label: 'FD / RD Calculator', icon: 'PiggyBank',      path: '/tools/fd-rd' },
      { id: 'currency',   label: 'Currency Converter', icon: 'ArrowLeftRight', path: '/tools/currency' },
      { id: 'invoice',    label: 'Invoice Generator',  icon: 'FileText',       path: '/tools/invoice',   badge: { label: 'NEW', variant: 'new' } },
      { id: 'salary',     label: 'Salary Slip Gen',    icon: 'Wallet',         path: '/tools/salary' },
      { id: 'loan',       label: 'Loan Eligibility',   icon: 'Landmark',       path: '/tools/loan' },
      { id: 'compound',   label: 'Compound Interest',  icon: 'TrendingUp',     path: '/tools/compound' },
      { id: 'percentage', label: 'Percentage Calc',    icon: 'Percent',        path: '/tools/percentage' },
    ],
  },
  {
    id: 'developer',
    title: 'Developer Tools',
    items: [
      { id: 'json',         label: 'JSON Formatter',     icon: 'Braces',        path: '/tools/json' },
      { id: 'base64',       label: 'Base64 Tool',        icon: 'Binary',        path: '/tools/base64' },
      { id: 'regex',        label: 'Regex Tester',       icon: 'Terminal',      path: '/tools/regex' },
      { id: 'jwt',          label: 'JWT Decoder',        icon: 'KeyRound',      path: '/tools/jwt' },
      { id: 'cron',         label: 'Cron Decoder',       icon: 'CalendarClock', path: '/tools/cron' },
      { id: 'color-palette',label: 'Color Palette',      icon: 'Palette',       path: '/tools/color-palette' },
      { id: 'api-formatter',label: 'API Formatter',      icon: 'Webhook',       path: '/tools/api-formatter' },
      { id: 'sql-builder',  label: 'SQL Builder',        icon: 'Database',      path: '/tools/sql-builder' },
      { id: 'uuid',         label: 'UUID Generator',     icon: 'Hash',          path: '/tools/uuid' },
      { id: 'data-uri',     label: 'Data URI Generator', icon: 'FileCode',      path: '/tools/data-uri' },
      { id: 'yaml-json',    label: 'YAML ↔ JSON Conv',   icon: 'FileJson',      path: '/tools/yaml-json' },
      { id: 'minifier',     label: 'Code Minifier',      icon: 'Minimize2',     path: '/tools/minifier' },
      { id: 'diff',         label: 'Visual Diff Checker',icon: 'Split',         path: '/tools/diff' },
    ],
  },
  {
    id: 'ai',
    title: 'AI Tools',
    items: [
      { id: 'summarizer',  label: 'Text Summarizer',    icon: 'BookOpen',      path: '/tools/summarizer',  badge: { label: 'AI', variant: 'beta' } },
      { id: 'caption',     label: 'Caption Generator',  icon: 'MessageSquare', path: '/tools/caption',     badge: { label: 'AI', variant: 'beta' } },
      { id: 'resume',      label: 'Resume Builder',     icon: 'ScrollText',    path: '/tools/resume',      badge: { label: 'AI', variant: 'beta' } },
      { id: 'cover-letter',label: 'Cover Letter Gen',   icon: 'FileEdit',      path: '/tools/cover-letter',badge: { label: 'AI', variant: 'beta' } },
      { id: 'blog',        label: 'Blog Generator',     icon: 'PenLine',       path: '/tools/blog',        badge: { label: 'AI', variant: 'beta' } },
      { id: 'email',       label: 'Email Rewriter',     icon: 'Mail',          path: '/tools/email',       badge: { label: 'AI', variant: 'beta' } },
      { id: 'paraphrase',  label: 'Paraphraser',        icon: 'RefreshCw',     path: '/tools/paraphrase',  badge: { label: 'AI', variant: 'beta' } },
      { id: 'grammar',     label: 'Grammar Checker',    icon: 'SpellCheck',    path: '/tools/grammar',     badge: { label: 'AI', variant: 'beta' } },
      { id: 'linkedin',    label: 'LinkedIn Post Gen',  icon: 'Linkedin',      path: '/tools/linkedin',    badge: { label: 'AI', variant: 'beta' } },
      { id: 'code-gen',    label: 'Code Generator',     icon: 'Code2',         path: '/tools/code-gen',    badge: { label: 'AI', variant: 'beta' } },
    ],
  },
  {
    id: 'converters',
    title: 'Converters',
    items: [
      { id: 'age',       label: 'Age Calculator',      icon: 'Cake',           path: '/tools/age' },
      { id: 'unit',      label: 'Unit Converter',      icon: 'ArrowRightLeft', path: '/tools/unit' },
      { id: 'bmi',       label: 'BMI Calculator',      icon: 'Activity',       path: '/tools/bmi' },
      { id: 'timezone',  label: 'Time Zone Converter', icon: 'Globe',          path: '/tools/timezone' },
      { id: 'date-diff', label: 'Date Difference',     icon: 'CalendarDays',   path: '/tools/date-diff' },
      { id: 'roman',     label: 'Roman Numeral Conv',  icon: 'Type',           path: '/tools/roman' },
      { id: 'number',    label: 'Number System Conv',  icon: 'Binary',         path: '/tools/number' },
    ],
  },
  {
    id: 'text',
    title: 'Text & Data',
    items: [
      { id: 'word-counter', label: 'Word Counter',       icon: 'FileType',    path: '/tools/word-counter' },
      { id: 'lorem',        label: 'Lorem Ipsum Gen',    icon: 'AlignLeft',   path: '/tools/lorem' },
      { id: 'csv-json',     label: 'CSV ↔ JSON',         icon: 'Table',       path: '/tools/csv-json' },
      { id: 'case-convert', label: 'Text Case Converter',icon: 'CaseSensitive',path: '/tools/case-convert' },
      { id: 'url-encode',   label: 'URL Encoder',        icon: 'Link',        path: '/tools/url-encode' },
    ],
  },
  {
    id: 'image',
    title: 'Image & Media',
    items: [
      { id: 'bg-remover',   label: 'Background Remover', icon: 'ImageMinus', path: '/tools/bg-remover',  badge: { label: 'AI', variant: 'beta' } },
      { id: 'img-upscaler', label: 'Image Upscaler',     icon: 'ZoomIn',     path: '/tools/img-upscaler',badge: { label: 'AI', variant: 'beta' } },
      { id: 'qr',           label: 'QR Code Generator',  icon: 'QrCode',     path: '/tools/qr' },
      { id: 'color-picker', label: 'Color Picker',       icon: 'Pipette',    path: '/tools/color-picker' },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    items: [
      { id: 'password', label: 'Password Generator', icon: 'ShieldCheck', path: '/tools/password' },
      { id: 'hash',     label: 'Hash Generator',      icon: 'Lock',        path: '/tools/hash' },
      { id: 'ssl',      label: 'SSL Decoder',         icon: 'ShieldCheck', path: '/tools/ssl' },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing & SEO',
    items: [
      { id: 'meta-analyzer', label: 'Meta Tag Analyzer',  icon: 'Search',      path: '/tools/meta-analyzer' },
      { id: 'sitemap',       label: 'Sitemap Generator',  icon: 'Network',     path: '/tools/sitemap' },
      { id: 'robots',        label: 'Robots.txt Builder', icon: 'Bot',         path: '/tools/robots' },
    ],
  },
];

export const SIDEBAR_WIDTH           = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 60;
