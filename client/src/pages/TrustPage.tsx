import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    label: '01 · PURPOSE',
    title: 'What this system does',
    body: 'Scores inbound B2B leads against a fixed five-factor rubric, drafts outreach, and queues a follow-up action. It never contacts a prospect directly — every output is a draft for a human to review.',
  },
  {
    label: '02 · DATA IN',
    title: 'What we ask for',
    body: 'Company, role, industry, a stated pain point, and optional budget/timeline signals — entered manually or pasted from notes. We never request or infer protected attributes (age, gender, health, religion, etc.).',
  },
  {
    label: '03 · HUMAN REVIEW',
    title: 'Where a person must approve',
    body: 'Every AI-drafted email, LinkedIn message, and lead score sits in a review queue. No outreach is sent automatically. The Human Review panel on each lead requires a named reviewer before a lead is considered actioned.',
  },
  {
    label: '04 · LIMITATIONS',
    title: "What the AI can't guarantee",
    body: 'Scores reflect only the information provided — missing or false input produces a misleading score. The model can occasionally misjudge ambiguous pain points. It is told explicitly to return "unknown" rather than guess, but is not infallible.',
  },
  {
    label: '05 · MITIGATION',
    title: 'How risk is reduced in this build',
    body: 'Every AI response is schema-validated before storage — malformed output is rejected, not silently accepted. Extraction defaults to null over invention. Rate limiting prevents runaway API usage. All data is scoped per-account; no user can see another\'s leads.',
  },
];

export function TrustPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-paper)' }}>
      <div className="grain-texture" />
      <nav className="relative z-10 mx-auto flex max-w-4xl items-center justify-between px-8 py-7">
        <Link to="/" className="font-mono text-sm uppercase tracking-[0.15em]" style={{ color: 'var(--color-brass-dark)' }}>
          LEAD-INTEL // 01
        </Link>
        <Link to="/dashboard" className="instrument-card rounded-full px-5 py-2 text-sm font-medium">
          Open Console
        </Link>
      </nav>

      <div className="relative z-10 mx-auto max-w-3xl px-8 pb-24 pt-8">
        <h1 className="text-3xl font-semibold tracking-tight">How this AI is built to be trusted</h1>
        <p className="mt-3 text-[15px] text-[#5b5347]">
          This isn't a disclaimer page. It's the actual design decisions behind every score you see.
        </p>

        <div className="mt-10 flex flex-col gap-5">
          {SECTIONS.map((s) => (
            <div key={s.title} className="screw relative instrument-card p-7">
              <span className="font-mono text-[11px] tracking-[0.1em]" style={{ color: 'var(--color-steel)' }}>{s.label}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5b5347]">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}