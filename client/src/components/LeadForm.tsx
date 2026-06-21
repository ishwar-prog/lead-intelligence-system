import { useState } from 'react';
import type { FormEvent } from 'react';
import { createLead } from '../api/leads.api';
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

/**
 * LeadForm — controlled form, one piece of state per render cycle
 *
 * Professor Note on "controlled" components:
 * Every input's value comes FROM React state, and every keystroke
 * updates that state via onChange. This means React is always the
 * single source of truth for what's in the form - never the DOM
 * itself. This is the standard React pattern for forms, and it's
 * what makes validation, resets, and pre-filling straightforward.
 */
export function LeadForm({ onLeadCreated }: LeadFormProps) {
  const [form, setForm] = useState<CreateLeadInput>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof CreateLeadInput>(
    field: K,
    value: CreateLeadInput[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createLead(form);
      setForm(EMPTY_FORM); // Reset form on success
      onLeadCreated();      // Tell parent to refresh the list
    } catch (err) {
      // Axios validation errors from Zod surface here with field details
      setError(
        err instanceof Error ? err.message : 'Failed to submit lead'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <h2>New Lead</h2>

      <div className="form-row">
        <label>
          Company
          <input
            required
            value={form.company}
            onChange={(e) => updateField('company', e.target.value)}
          />
        </label>
        <label>
          Industry
          <input
            required
            value={form.industry}
            onChange={(e) => updateField('industry', e.target.value)}
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Role
          <input
            required
            value={form.role}
            onChange={(e) => updateField('role', e.target.value)}
          />
        </label>
        <label>
          Company Size
          <select
            value={form.companySize}
            onChange={(e) =>
              updateField('companySize', e.target.value as CompanySize)
            }
          >
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
          <input
            value={form.budgetSignal}
            onChange={(e) => updateField('budgetSignal', e.target.value)}
            placeholder="Unknown"
          />
        </label>
        <label>
          Timeline
          <input
            value={form.timeline}
            onChange={(e) => updateField('timeline', e.target.value)}
            placeholder="Unknown"
          />
        </label>
      </div>

      <label>
        Lead Source
        <input
          required
          value={form.leadSource}
          onChange={(e) => updateField('leadSource', e.target.value)}
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit Lead'}
      </button>
    </form>
  );
}