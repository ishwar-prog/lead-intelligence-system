import { useState, type FormEvent } from 'react';
import { createLead, extractLeadFromText } from '../api/leads.api.ts';
import type { CompanySize, CreateLeadInput } from '../types/lead.types';
import { LiquidButton } from './ui/liquid-glass-button';

interface LeadFormProps {
  onLeadCreated: () => void;
}

const EMPTY_FORM: CreateLeadInput = {
  company: '',
  industry: '',
  role: '',
  companySize: '1-10',
  painPoint: '',
  budgetSignal: '',
  timeline: '',
  leadSource: '',
};

const glassField =
  'w-full rounded-xl border border-white/40 bg-white/[0.06] px-3 py-2 text-[#1c1c1e] placeholder:text-[#1c1c1e]/40 ' +
  'backdrop-blur-sm outline-none transition-all duration-200 ' +
  'focus:border-white/80 focus:bg-white/[0.14] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.25)]';

// The SVG displacement filter that gives true liquid-glass refraction.
// Rendered once, referenced via backdropFilter: url(#container-glass).
function GlassFilter() {
  return (
    <svg className="hidden">
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.02"
            numOctaves={1}
            seed={1}
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation={2} result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale={120}
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation={4} result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export function LeadForm({ onLeadCreated }: LeadFormProps) {
  const [mode, setMode] = useState<'manual' | 'paste'>('manual');
  const [form, setForm] = useState<CreateLeadInput>(EMPTY_FORM);
  const [pasteText, setPasteText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractionNote, setExtractionNote] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof CreateLeadInput>(field: K, value: CreateLeadInput[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleExtract() {
    setExtracting(true);
    setError(null);
    setExtractionNote(null);
    try {
      const result = await extractLeadFromText(pasteText);
      setForm({
        company: result.company ?? '',
        industry: result.industry ?? '',
        role: result.role ?? '',
        companySize: (result.companySize ?? '') as CompanySize,
        painPoint: result.painPoint ?? '',
        budgetSignal: result.budgetSignal ?? '',
        timeline: result.timeline ?? '',
        leadSource: result.leadSource ?? '',
      });
      if (result.fieldsNotFound.length > 0) {
        setExtractionNote(
          `Couldn't confidently find: ${result.fieldsNotFound.join(', ')}. Please review and fill these in.`
        );
      }
      setMode('manual');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
    } finally {
      setExtracting(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createLead(form);
      setForm(EMPTY_FORM);
      setPasteText('');
      setExtractionNote(null);
      onLeadCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit lead');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div
        data-slot="card"
        style={{ backdropFilter: 'url("#container-glass")' }}
        className="text-card-foreground bg-white/[0.05] flex flex-col gap-6 rounded-2xl border border-white/30 p-6
          shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(255,255,255,0.9),inset_-3px_-3px_0.5px_-3px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(255,255,255,0.15)]
          transition-all"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold tracking-tight text-[#1c1c1e]">New Lead</h2>
          <div className="flex gap-2 font-mono text-xs">
            <LiquidButton
              type="button"
              onClick={() => setMode('manual')}
              className={mode === 'manual' ? 'font-semibold underline px-3 py-1 text-xs' : 'text-[#1c1c1e]/50 px-3 py-1 text-xs'}
            >
              Fill manually
            </LiquidButton>
            <span className="text-[#1c1c1e]/40">/</span>
            <LiquidButton
              type="button"
              onClick={() => setMode('paste')}
              className={mode === 'paste' ? 'font-semibold underline px-3 py-1 text-xs' : 'text-[#1c1c1e]/50 px-3 py-1 text-xs'}
            >
              Paste &amp; extract
            </LiquidButton>
          </div>
        </div>

        {mode === 'paste' && (
          <div>
            <textarea
              rows={5}
              placeholder="Paste an email, LinkedIn bio, call notes - anything with lead details in it"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              maxLength={4000}
              className={glassField}
            />
            <LiquidButton
              type="button"
              onClick={handleExtract}
              disabled={extracting || pasteText.trim().length < 20}
              className="mt-2 w-full rounded-full py-2.5 font-medium text-white"
            >
              {extracting ? 'Extracting…' : 'Extract fields ✨'}
            </LiquidButton>
            {error && <p className="text-[#b3261e] mt-2">{error}</p>}
          </div>
        )}

        {mode === 'manual' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {extractionNote && (
              <p className="rounded-xl border border-white/40 bg-white/[0.1] p-2 font-mono text-xs text-[#1c1c1e]/80 backdrop-blur-sm">
                {extractionNote}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm text-[#1c1c1e]/80">
                Company
                <input required value={form.company} onChange={(e) => updateField('company', e.target.value)} className={glassField} />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[#1c1c1e]/80">
                Industry
                <input required value={form.industry} onChange={(e) => updateField('industry', e.target.value)} className={glassField} />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm text-[#1c1c1e]/80">
                Role
                <input required value={form.role} onChange={(e) => updateField('role', e.target.value)} className={glassField} />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[#1c1c1e]/80">
                Company Size
                <select
                  value={form.companySize}
                  onChange={(e) => updateField('companySize', e.target.value as CompanySize)}
                  className={`${glassField} appearance-none`}
                >
                  <option className="text-black" value="1-10">1-10</option>
                  <option className="text-black" value="11-50">11-50</option>
                  <option className="text-black" value="51-200">51-200</option>
                  <option className="text-black" value="201-1000">201-1000</option>
                  <option className="text-black" value="1000+">1000+</option>
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm text-[#1c1c1e]/80">
              Pain Point
              <textarea
                required
                minLength={10}
                rows={3}
                value={form.painPoint}
                onChange={(e) => updateField('painPoint', e.target.value)}
                className={glassField}
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm text-[#1c1c1e]/80">
                Budget Signal
                <input
                  value={form.budgetSignal}
                  onChange={(e) => updateField('budgetSignal', e.target.value)}
                  placeholder="Unknown"
                  className={glassField}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[#1c1c1e]/80">
                Timeline
                <input
                  value={form.timeline}
                  onChange={(e) => updateField('timeline', e.target.value)}
                  placeholder="Unknown"
                  className={glassField}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm text-[#1c1c1e]/80">
              Lead Source
              <input required value={form.leadSource} onChange={(e) => updateField('leadSource', e.target.value)} className={glassField} />
            </label>

            {error && <p className="text-[#b3261e]">{error}</p>}

            <LiquidButton type="submit" disabled={submitting} className="mt-2 w-full">
              {submitting ? 'Submitting…' : 'Submit Lead'}
            </LiquidButton>
          </form>
        )}
      </div>
      <GlassFilter />
    </div>
  );
}