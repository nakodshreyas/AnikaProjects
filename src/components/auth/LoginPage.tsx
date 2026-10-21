import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';
import { AnikaLogo } from '../layout/AnikaLogo';
import { ClientSession } from '../../utils/auth';

interface LoginPageProps {
  onLoginSuccess: (session: ClientSession) => void;
  onNavigateHome: () => void;
  initialNotice?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
  initialNotice,
}) => {
  // const configured = getConfiguredCredentials();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setIsLoading(true);

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        identifier: identifier.trim(),
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success || !data.session) {
      setError(
        data.error || data.message ||
          'Invalid credentials. Please try again.'
      );
      return;
    }

    onLoginSuccess(data.session as ClientSession);
  } catch {
    setError(
      'Unable to connect to the authentication server. Please try again.'
    );
  } finally {
    setIsLoading(false);
  }
};

  // const handleFillDemoCredentials = () => {
  //   setIdentifier(configured.email);
  //   setPassword(configured.password);
  //   setError(null);
  // };

  return (
    <div className="min-h-screen bg-[#111922] text-brand-goldPale flex flex-col justify-between relative overflow-hidden selection:bg-brand-gold selection:text-brand-deepNavy">
      {/* Background Architectural Patterns */}
      <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#c5935a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-navy/60 blur-3xl pointer-events-none" />

      {/* Top Bar with Back Link */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-goldLight hover:text-white transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Main Website</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-deepNavy/80 border border-brand-gold/30 text-[11px] font-medium text-brand-goldLight">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
          <span>Restricted Client Access</span>
        </div>
      </header>

      {/* Center Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md bg-[#182430]/95 backdrop-blur-xl border border-brand-gold/30 rounded-2xl p-6 sm:p-9 shadow-2xl relative">
          {/* Subtle Top Gold Highlight */}
          <div className="absolute -top-[1px] left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent" />

          {/* Logo & Headline */}
          <div className="text-center mb-7">
            <div className="flex justify-center mb-4">
              <AnikaLogo variant="inverted" className="h-16 w-auto" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              Client & Project Portal
            </h1>
            <p className="text-xs text-brand-goldPale/75 mt-1.5 leading-relaxed">
              Strictly protected portal. You must provide authorized credentials on every visit.
            </p>
          </div>

          {/* Prompt Notice if redirected from /dashboard or /dashbord */}
          {initialNotice && !error && (
            <div className="mb-5 p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{initialNotice}</div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-goldLight mb-1.5">
                Client Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-goldPale/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#111922] border border-brand-navyLight/60 text-white placeholder-brand-goldPale/40 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-goldLight">
                  Password
                </label>
                <span className="text-[11px] text-brand-goldPale/50 font-normal">
                  Secure server-side authentication
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-goldPale/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#111922] border border-brand-navyLight/60 text-white placeholder-brand-goldPale/40 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-goldPale/50 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-brand-goldPale/60 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-brand-gold" />
                <span>Strict single-session auth</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-gradient-to-r from-brand-gold to-brand-goldDark hover:from-brand-goldLight hover:to-brand-gold text-brand-deepNavy font-bold text-xs uppercase tracking-wider shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-brand-goldPale/50 relative z-10">
        <p>© {new Date().getFullYear()} Anika Projects. Private client dashboard. Unauthorized access prohibited.</p>
      </footer>
    </div>
  );
};
