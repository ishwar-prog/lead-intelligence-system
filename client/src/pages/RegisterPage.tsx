import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--color-paper)' }}>
      <div className="grain-texture" />
      <form onSubmit={handleSubmit} className="instrument-card screw relative z-10 w-full max-w-sm p-8">
        <h1 className="text-xl font-semibold">Create an account</h1>

        <label className="mt-5 block text-sm font-medium">
          Name
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
            style={{ borderColor: 'var(--color-groove)' }}
          />
        </label>

        <label className="mt-3 block text-sm font-medium">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
            style={{ borderColor: 'var(--color-groove)' }}
          />
        </label>

        <label className="mt-3 block text-sm font-medium">
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
            style={{ borderColor: 'var(--color-groove)' }}
          />
          <span className="mt-1 block text-xs text-[#7a7164]">At least 8 characters</span>
        </label>

        {error && <p className="mt-3 text-sm text-[#9C3B3B]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-full py-2.5 font-medium text-white"
          style={{ background: 'var(--color-ink)' }}
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="mt-4 text-center text-sm text-[#7a7164]">
          Already have an account? <Link to="/login" className="font-medium underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
