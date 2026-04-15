import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { EmiCalculator } from './pages/tools/EmiCalculator';
import { CurrencyConverter } from './pages/tools/CurrencyConverter';
import { GstCalculator } from './pages/tools/GstCalculator';
import { SipCalculator } from './pages/tools/SipCalculator';
import { PercentageCalculator } from './pages/tools/PercentageCalculator';
import { FdRdCalculator } from './pages/tools/FdRdCalculator';
import { LoanEligibilityCalculator } from './pages/tools/LoanEligibility';
import { JsonFormatter } from './pages/tools/JsonFormatter';
import { Base64Tool } from './pages/tools/Base64Tool';
import { JwtDecoder } from './pages/tools/JwtDecoder';
import { PasswordGenerator } from './pages/tools/PasswordGenerator';
import { InvoiceGenerator } from './pages/tools/InvoiceGenerator';
import { SalarySlipGenerator } from './pages/tools/SalarySlipGenerator';
import { RegexTester } from './pages/tools/RegexTester';
import { UnitConverter } from './pages/tools/UnitConverter';
import { CronDecoder } from './pages/tools/CronDecoder';
import { HashGenerator } from './pages/tools/HashGenerator';
import { AgeCalculator } from './pages/tools/AgeCalculator';
import { BmiCalculator } from './pages/tools/BmiCalculator';
import { WordCounter } from './pages/tools/WordCounter';
import { ColorPaletteGenerator } from './pages/tools/ColorPalette';
import { SqlBuilder } from './pages/tools/SqlBuilder';
import { ApiFormatter } from './pages/tools/ApiFormatter';
import { UuidGenerator } from './pages/tools/UuidGenerator';
import { DateDifference } from './pages/tools/DateDifference';
import { QrGenerator } from './pages/tools/QrGenerator';
import { ColorPicker } from './pages/tools/ColorPicker';
import { TimezoneConverter } from './pages/tools/TimezoneConverter';
import { LoremIpsum } from './pages/tools/LoremIpsum';
import { CsvJsonConverter } from './pages/tools/CsvJsonConverter';
import { CaseConverter } from './pages/tools/CaseConverter';
import { UrlEncoder } from './pages/tools/UrlEncoder';
import { RomanNumeralConverter } from './pages/tools/RomanNumeral';
import { NumberSystemConverter } from './pages/tools/NumberSystem';
import { DataUriGenerator } from './pages/tools/DataUriGenerator';
import { SitemapGenerator } from './pages/tools/SitemapGenerator';
import { MetaTagAnalyzer } from './pages/tools/MetaAnalyzer';
import { YamlJsonConverter } from './pages/tools/YamlJsonConverter';
import { CodeMinifier } from './pages/tools/CodeMinifier';
import { SslDecoder } from './pages/tools/SslDecoder';
import { CompoundInterestCalculator } from './pages/tools/CompoundInterest';
import { DiffChecker } from './pages/tools/DiffChecker';
import { RobotsBuilder } from './pages/tools/RobotsBuilder';
import { CaptionGenerator } from './pages/tools/CaptionGenerator';
import { TextSummarizer } from './pages/tools/TextSummarizer';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ padding: '40px 40px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
        {title}
      </h1>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
        This page is coming soon…
      </p>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />

      {/* Finance */}
      <Route path="/tools/emi"          element={<EmiCalculator />} />
      <Route path="/tools/gst"          element={<GstCalculator />} />
      <Route path="/tools/currency"     element={<CurrencyConverter />} />
      <Route path="/tools/sip"          element={<SipCalculator />} />
      <Route path="/tools/percentage"   element={<PercentageCalculator />} />
      <Route path="/tools/fd-rd"        element={<FdRdCalculator />} />
      <Route path="/tools/loan"         element={<LoanEligibilityCalculator />} />
      <Route path="/tools/invoice"      element={<InvoiceGenerator />} />
      <Route path="/tools/salary"       element={<SalarySlipGenerator />} />
      <Route path="/tools/compound"     element={<CompoundInterestCalculator />} />

      {/* Developer */}
      <Route path="/tools/json"         element={<JsonFormatter />} />
      <Route path="/tools/base64"       element={<Base64Tool />} />
      <Route path="/tools/jwt"          element={<JwtDecoder />} />
      <Route path="/tools/regex"        element={<RegexTester />} />
      <Route path="/tools/color-palette" element={<ColorPaletteGenerator />} />
      <Route path="/tools/api-formatter" element={<ApiFormatter />} />
      <Route path="/tools/sql-builder"   element={<SqlBuilder />} />
      <Route path="/tools/uuid"          element={<UuidGenerator />} />
      <Route path="/tools/yaml-json"     element={<YamlJsonConverter />} />
      <Route path="/tools/minifier"      element={<CodeMinifier />} />
      <Route path="/tools/diff"          element={<DiffChecker />} />
      
      {/* Converters */}
      <Route path="/tools/unit"         element={<UnitConverter />} />
      <Route path="/tools/age"          element={<AgeCalculator />} />
      <Route path="/tools/bmi"          element={<BmiCalculator />} />
      <Route path="/tools/date-diff"    element={<DateDifference />} />
      <Route path="/tools/timezone"     element={<TimezoneConverter />} />
      <Route path="/tools/roman"        element={<RomanNumeralConverter />} />
      <Route path="/tools/number"       element={<NumberSystemConverter />} />

      {/* Security */}
      <Route path="/tools/password"     element={<PasswordGenerator />} />
      <Route path="/tools/hash"         element={<HashGenerator />} />
      <Route path="/tools/ssl"          element={<SslDecoder />} />

      {/* Placeholder Routes */}
      <Route path="/tools/cron"         element={<CronDecoder />} />
      <Route path="/tools/qr"           element={<QrGenerator />} />
      <Route path="/tools/color-picker" element={<ColorPicker />} />
      
      {/* Text & Data */}
      <Route path="/tools/word-counter" element={<WordCounter />} />
      <Route path="/tools/lorem"        element={<LoremIpsum />} />
      <Route path="/tools/csv-json"     element={<CsvJsonConverter />} />
      <Route path="/tools/case-convert" element={<CaseConverter />} />
      <Route path="/tools/url-encode"   element={<UrlEncoder />} />
      <Route path="/tools/data-uri"     element={<DataUriGenerator />} />

      {/* Marketing & SEO */}
      <Route path="/tools/sitemap"       element={<SitemapGenerator />} />
      <Route path="/tools/meta-analyzer" element={<MetaTagAnalyzer />} />
      <Route path="/tools/robots"        element={<RobotsBuilder />} />
      <Route path="/tools/caption"       element={<CaptionGenerator />} />
      <Route path="/tools/summarizer"    element={<TextSummarizer />} />

      {/* Catch-all */}
      <Route path="/tools/:slug"        element={<PlaceholderPage title="Coming Soon" />} />

      {/* App pages */}
      <Route path="/browse"    element={<PlaceholderPage title="Browse Tools" />} />
      <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
      <Route path="/settings"  element={<PlaceholderPage title="Settings" />} />
      <Route path="/support"   element={<PlaceholderPage title="Support" />} />
    </Routes>
  );
}
