import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--color-paper)' }}>
      <div className="grain-texture" />
      <form onSubmit={handleSubmit} className="instrument-card screw relative z-10 w-full max-w-sm p-8">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <label className="mt-5 block text-sm font-medium">
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                 className="mt-1 w-full rounded-md border px-3 py-2" style={{ borderColor: 'var(--color-groove)' }} />
        </label>
        <label className="mt-3 block text-sm font-medium">
          Password
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                 className="mt-1 w-full rounded-md border px-3 py-2" style={{ borderColor: 'var(--color-groove)' }} />
        </label>
        {error && <p className="mt-3 text-sm text-[#9C3B3B]">{error}</p>}
        <button type="submit" disabled={submitting}
                className="mt-6 w-full rounded-full py-2.5 font-medium text-white"
                style={{ background: 'var(--color-ink)' }}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="mt-4 text-center text-sm text-[#7a7164]">
          No account? <Link to="/register" className="font-medium underline">Register</Link>
        </p>
      </form>
    </div>
  );
}