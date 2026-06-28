import { useState, type FormEvent } from 'react';
import { createLead, extractLeadFromText } from '../api/leads.api.ts';
import type { CompanySize, CreateLeadInput } from '../types/lead.types';
import { LiquidButton } from './ui/liquid-glass-button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/30 ' +
  'backdrop-blur-md outline-none transition-all duration-300 font-sans ' +
  'hover:border-white/20 hover:bg-white/10 focus:border-white/35 focus:bg-white/[0.08] focus:scale-[1.01]';

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
        className="text-card-foreground bg-white/5 flex flex-col gap-6 rounded-[32px] border border-white/10 p-6 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-white/15 screw relative"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold tracking-tight text-white font-display">New Lead</h2>
          
          {/* Custom Pill Toggle (No underlines, overall font-sans, subtle hover anims) */}
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full border border-white/5 font-sans">
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer",
                mode === 'manual'
                  ? "bg-white/15 border border-white/15 text-white shadow-sm"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              Fill manually
            </button>
            <button
              type="button"
              onClick={() => setMode('paste')}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer",
                mode === 'paste'
                  ? "bg-white/15 border border-white/15 text-white shadow-sm"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              Paste &amp; extract
            </button>
          </div>
        </div>

        {mode === 'paste' && (
          <div className="font-sans">
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
              className="mt-4 w-full rounded-full py-2.5 font-medium text-white hover:scale-[1.01] active:scale-[0.99]"
            >
              {extracting ? 'Extracting…' : 'Extract fields ✨'}
            </LiquidButton>
            {error && <p className="text-[#f87171] mt-2 text-xs">{error}</p>}
          </div>
        )}

        {mode === 'manual' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
            {extractionNote && (
              <p className="rounded-xl border border-white/10 bg-white/5 p-2 font-mono text-xs text-white backdrop-blur-md">
                {extractionNote}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-white/80">
                Company
                <input required value={form.company} onChange={(e) => updateField('company', e.target.value)} className={glassField} />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-white/80">
                Industry
                <input required value={form.industry} onChange={(e) => updateField('industry', e.target.value)} className={glassField} />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-white/80">
                Role
                <input required value={form.role} onChange={(e) => updateField('role', e.target.value)} className={glassField} />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-white/80">
                Company Size
                <select
                  value={form.companySize}
                  onChange={(e) => updateField('companySize', e.target.value as CompanySize)}
                  className={`${glassField} appearance-none`}
                >
                  <option className="text-black bg-white" value="1-10">1-10</option>
                  <option className="text-black bg-white" value="11-50">11-50</option>
                  <option className="text-black bg-white" value="51-200">51-200</option>
                  <option className="text-black bg-white" value="201-1000">201-1000</option>
                  <option className="text-black bg-white" value="1000+">1000+</option>
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-white/80">
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
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-white/80">
                Budget Signal
                <input
                  value={form.budgetSignal}
                  onChange={(e) => updateField('budgetSignal', e.target.value)}
                  placeholder="Unknown"
                  className={glassField}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-white/80">
                Timeline
                <input
                  value={form.timeline}
                  onChange={(e) => updateField('timeline', e.target.value)}
                  placeholder="Unknown"
                  className={glassField}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-white/80">
              Lead Source
              <input required value={form.leadSource} onChange={(e) => updateField('leadSource', e.target.value)} className={glassField} />
            </label>

            {error && <p className="text-[#f87171] text-xs mt-2">{error}</p>}

            <LiquidButton 
              type="submit" 
              disabled={submitting} 
              className="mt-4 w-full rounded-full py-2.5 font-medium hover:scale-[1.01] active:scale-[0.99]"
            >
              {submitting ? 'Submitting…' : 'Submit Lead'}
            </LiquidButton>
          </form>
        )}
      </div>
    </div>
  );
}