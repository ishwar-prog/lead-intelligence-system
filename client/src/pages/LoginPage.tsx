import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LiquidButton } from '../components/ui/liquid-glass-button';
import { Eye, EyeOff } from 'lucide-react';

const glassField =
  'mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/30 ' +
  'backdrop-blur-md outline-none transition-all duration-300 font-sans ' +
  'hover:border-white/20 hover:bg-white/10 focus:border-white/35 focus:bg-white/[0.08] focus:scale-[1.01]';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex min-h-screen items-center justify-center">
      <div className="grain-texture" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-white/15 screw"
      >
        <h1 className="text-xl font-semibold text-white font-display">Sign in</h1>

        <label className="mt-5 block text-sm font-medium text-white/80 font-sans">
          Email
          <input 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className={glassField} 
          />
        </label>

        <label className="mt-3 block text-sm font-medium text-white/80 font-sans">
          Password
          <div className="relative mt-1.5">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${glassField} !mt-0 pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors cursor-pointer focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        {error && <p className="mt-3 text-sm text-[#f87171] font-sans">{error}</p>}

        <LiquidButton 
          type="submit" 
          disabled={submitting} 
          className="mt-6 w-full rounded-full py-2.5 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer font-sans"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </LiquidButton>

        <p className="mt-4 text-center text-sm text-white/60 font-sans">
          No account?{' '}
          <Link to="/register" className="font-medium underline hover:text-white transition-colors">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}