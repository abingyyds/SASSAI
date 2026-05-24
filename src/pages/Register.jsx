import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Boxes, CheckCircle2, Code2, CreditCard, KeyRound, LockKeyhole, Play, Route, Server, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { PUBLIC_API_BASE_URL } from '../constants/api';
import toast from 'react-hot-toast';

export default function Register() {
  const { t } = useTranslation();
  const { register, user } = useAuth();
  const { site } = useSite();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', password2: '', email: '' });
  const [loading, setLoading] = useState(false);

  // Capture aff code from URL and persist in localStorage
  useEffect(() => {
    const affCode = new URLSearchParams(window.location.search).get('aff');
    if (affCode) {
      localStorage.setItem('dist_aff', affCode);
    }
  }, []);

  // If already logged in, redirect via component
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error(t('register.fillRequired'));
      return;
    }
    if (form.password !== form.password2) {
      toast.error(t('register.passwordMismatch'));
      return;
    }
    if (form.password.length < 8) {
      toast.error(t('register.passwordLength'));
      return;
    }
    if (form.password.length > 20) {
      toast.error(t('register.passwordLength'));
      return;
    }
    setLoading(true);
    try {
      const affCode = new URLSearchParams(window.location.search).get('aff') || localStorage.getItem('dist_aff') || '';
      const result = await register({
        username: form.username,
        password: form.password,
        email: form.email || undefined,
        aff_code: affCode || undefined,
      });
      if (result.success) {
        toast.success(t('register.accountCreated'));
        navigate('/login', { replace: true });
        return; // component may unmount — skip setLoading
      }
      // error toast is handled by api interceptor for success:false
    } catch (err) {
      // Network error handled by interceptor
    }
    setLoading(false);
  };

  const siteName = site?.name || 'SubRouter';
  const quickstart = [
    { icon: KeyRound, title: 'Create an API key', text: 'Generate production keys from the console after sign-in.' },
    { icon: Boxes, title: 'Choose a model', text: 'Use the public catalog to copy stable model ids.' },
    { icon: Code2, title: 'Send a request', text: `Point your client at ${PUBLIC_API_BASE_URL}/chat/completions.` },
  ];
  const trustCues = [
    { icon: Route, label: 'Unified API' },
    { icon: ShieldCheck, label: 'Usage visibility' },
    { icon: CreditCard, label: 'Transparent pricing' },
  ];

  return (
    <div className="relative isolate overflow-hidden bg-[#f7f9fc] px-3 py-6 text-slate-950 sm:px-6 sm:py-10 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(14,165,233,0.22),transparent_30%),radial-gradient(circle_at_82%_10%,rgba(99,102,241,0.18),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_48%,#ffffff_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.28] [background-image:linear-gradient(rgba(15,23,42,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.14)_1px,transparent_1px)] [background-size:52px_52px]" />

      <div className="mx-auto grid min-h-[calc(100dvh-12rem)] max-w-7xl items-center gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(430px,0.78fr)] lg:gap-10">
        <section className="order-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/[0.15] sm:p-7 lg:order-1 lg:p-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-cyan-100 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.75)]" />
            Start building on {siteName}
          </div>

          <div className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(290px,1fr)]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">SubRouter onboarding</p>
              <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl lg:text-5xl">
                Create your console account and launch with one AI gateway.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Register to manage API keys, compare model choices, and keep routing, pricing, and usage signals in one place.
              </p>

              <div className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {trustCues.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                      <Icon size={17} />
                    </span>
                    <span className="text-sm font-semibold text-white">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur">
              <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Quickstart path</p>
                    <p className="mt-1 truncate font-mono text-sm text-cyan-100">{PUBLIC_API_BASE_URL}</p>
                  </div>
                  <Server size={18} className="shrink-0 text-cyan-200" />
                </div>
                <div className="mt-4 grid gap-3">
                  {quickstart.map(({ icon: Icon, title, text }, index) => (
                    <div key={title} className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                        <Icon size={17} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-white">{index + 1}. {title}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-400">{text}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link
              to="/models"
              className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-4 text-left transition hover:border-cyan-200/40 hover:bg-white/[0.1] sm:col-span-1"
            >
              <span className="min-w-0 text-sm font-semibold text-white">Models</span>
              <ArrowRight size={17} className="shrink-0 text-cyan-200 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/docs/quickstart"
              className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-4 text-left transition hover:border-cyan-200/40 hover:bg-white/[0.1] sm:col-span-1"
            >
              <span className="min-w-0 text-sm font-semibold text-white">Docs</span>
              <ArrowRight size={17} className="shrink-0 text-cyan-200 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/chat"
              className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-4 text-left transition hover:border-cyan-200/40 hover:bg-white/[0.1] sm:col-span-1"
            >
              <span className="min-w-0 text-sm font-semibold text-white">Playground</span>
              <ArrowRight size={17} className="shrink-0 text-cyan-200 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>

        <section className="order-1 lg:order-2">
          <div className="glass overflow-hidden rounded-2xl border border-white/70 bg-white/[0.86] shadow-2xl shadow-slate-950/[0.12] backdrop-blur-xl">
            <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 px-5 py-5 text-white sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Create access</p>
                  <h2 className="mt-2 text-2xl font-heading font-semibold tracking-normal text-white">{t('register.createAccount')}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {site?.name ? t('register.getStartedWith', { name: site.name }) : t('register.getStartedDefault')}
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-cyan-100">
                  <Sparkles size={19} />
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <LockKeyhole size={14} />
                    Account
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-950">Console login</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <Play size={14} />
                    Build
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-950">Keys and tests</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('register.username')} *</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="input border-slate-200 bg-white text-slate-950 placeholder:text-slate-400"
                    placeholder={t('register.chooseUsername')}
                    autoComplete="username"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('register.email')}</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input border-slate-200 bg-white text-slate-950 placeholder:text-slate-400"
                    placeholder={t('register.emailPlaceholder')}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('register.password')} *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input border-slate-200 bg-white text-slate-950 placeholder:text-slate-400"
                    placeholder={t('register.passwordPlaceholder')}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('register.confirmPassword')} *</label>
                  <input
                    type="password"
                    value={form.password2}
                    onChange={(e) => setForm({ ...form, password2: e.target.value })}
                    className="input border-slate-200 bg-white text-slate-950 placeholder:text-slate-400"
                    placeholder={t('register.repeatPassword')}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 shadow-lg shadow-cyan-900/[0.15] hover:bg-slate-800"
                >
                  {loading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {loading ? t('register.creating') : t('register.createAccountBtn')}
                </button>
              </form>

              <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50/80 p-3">
                <p className="flex items-start gap-2 text-xs leading-5 text-cyan-900">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-cyan-700" />
                  Registration keeps the existing console flow intact while preparing API key, catalog, and playground access.
                </p>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  {t('register.hasAccount')}{' '}
                  <Link to="/login" className="font-semibold text-slate-950 transition-colors hover:text-cyan-700">
                    {t('register.signIn')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
