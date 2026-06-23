import type { useState, FormEvent } from 'react';
import { createLead, extractLeadFromText } from '../api/leads.api.ts';
import type { CompanySize, CreateLeadInput } from '../types/lead.types';

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
      // Pre-fill the SAME fields the manual form uses. Nothing is created
      // yet - the person reviews and edits before this becomes a real lead.
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
      setMode('manual'); // drop into the editable form for review
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
    <div className="lead-form">
      <div className="flex items-center justify-between">
        <h2>New Lead</h2>
        <div className="flex gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={mode === 'manual' ? 'font-semibold underline' : 'text-[#7a7164]'}
          >
            Fill manually
          </button>
          <span className="text-[#7a7164]">/</span>
          <button
            type="button"
            onClick={() => setMode('paste')}
            className={mode === 'paste' ? 'font-semibold underline' : 'text-[#7a7164]'}
          >
            Paste &amp; extract
          </button>
        </div>
      </div>

      {mode === 'paste' && (
        <div className="mt-4">
          <textarea
            rows={5}
            placeholder="Paste an email, LinkedIn bio, call notes - anything with lead details in it"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            maxLength={4000}
            className="w-full rounded-md border px-3 py-2"
            style={{ borderColor: 'var(--color-groove)' }}
          />
          <button
            type="button"
            onClick={handleExtract}
            disabled={extracting || pasteText.trim().length < 20}
            className="mt-2 rounded-full px-5 py-2 text-sm font-medium text-white"
            style={{ background: 'var(--color-ink)' }}
          >
            {extracting ? 'Extracting…' : 'Extract fields →'}
          </button>
          {error && <p className="form-error mt-2">{error}</p>}
        </div>
      )}

      {mode === 'manual' && (
        <form onSubmit={handleSubmit}>
          {extractionNote && (
            <p
              className="mt-3 rounded-md p-2 font-mono text-xs"
              style={{ background: '#FFF8EC', color: 'var(--color-brass-dark)' }}
            >
              {extractionNote}
            </p>
          )}

          <div className="form-row">
            <label>
              Company
              <input required value={form.company} onChange={(e) => updateField('company', e.target.value)} />
            </label>
            <label>
              Industry
              <input required value={form.industry} onChange={(e) => updateField('industry', e.target.value)} />
            </label>
          </div>

          <div className="form-row">
            <label>
              Role
              <input required value={form.role} onChange={(e) => updateField('role', e.target.value)} />
            </label>
            <label>
              Company Size
              <select value={form.companySize} onChange={(e) => updateField('companySize', e.target.value as CompanySize)}>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-1000">201-1000</option>
                <option value="1000+">1000+</option>
              </select>
            </label>
          </div>

          <label>
            Pain Point
            <textarea
              required
              minLength={10}
              rows={3}
              value={form.painPoint}
              onChange={(e) => updateField('painPoint', e.target.value)}
            />
          </label>

          <div className="form-row">
            <label>
              Budget Signal
              <input value={form.budgetSignal} onChange={(e) => updateField('budgetSignal', e.target.value)} placeholder="Unknown" />
            </label>
            <label>
              Timeline
              <input value={form.timeline} onChange={(e) => updateField('timeline', e.target.value)} placeholder="Unknown" />
            </label>
          </div>

          <label>
            Lead Source
            <input required value={form.leadSource} onChange={(e) => updateField('leadSource', e.target.value)} />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Lead'}
          </button>
        </form>
      )}
    </div>
  );
}