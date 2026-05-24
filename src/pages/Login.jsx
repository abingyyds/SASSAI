import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Boxes, CheckCircle2, Code2, KeyRound, LockKeyhole, Play, Route, Server, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { PUBLIC_API_BASE_URL } from '../constants/api';
import toast from 'react-hot-toast';

export default function Login() {
  const { t } = useTranslation();
  const { login, user } = useAuth();
  const { site } = useSite();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect via component (not navigate in render)
  if (user) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error(t('login.fillAllFields'));
      return;
    }
    setLoading(true);
    try {
      const result = await login(form.username, form.password);
      if (result.success) {
        toast.success(t('login.welcomeBackToast'));
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
        return; // component may unmount — skip setLoading
      }
      // error toast is handled by api interceptor for success:false
    } catch (err) {
      // Network error handled by interceptor
    }
    setLoading(false);
  };

  const siteName = site?.name || 'SubRouter';
  const promiseBullets = [
    { icon: Route, title: 'Unified API gateway', text: 'Route production workloads through one OpenAI-compatible base URL.' },
    { icon: Boxes, title: 'Model marketplace', text: 'Compare public model families, pricing, and availability before you ship.' },
    { icon: ShieldCheck, title: 'Enterprise routing', text: 'Keep keys, usage, and call logs inside a focused console workflow.' },
    { icon: Code2, title: 'Fast quickstart', text: 'Generate a key, choose a model id, and run your first request quickly.' },
  ];

  return (
    <div className="relative isolate overflow-hidden bg-[#f7f9fc] px-3 py-6 text-slate-950 sm:px-6 sm:py-10 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(14,165,233,0.22),transparent_30%),radial-gradient(circle_at_82%_10%,rgba(99,102,241,0.18),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_48%,#ffffff_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.28] [background-image:linear-gradient(rgba(15,23,42,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.14)_1px,transparent_1px)] [background-size:52px_52px]" />

      <div className="mx-auto grid min-h-[calc(100dvh-12rem)] max-w-7xl items-center gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(390px,0.72fr)] lg:gap-10">
        <section className="order-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/[0.15] sm:p-7 lg:order-1 lg:p-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-cyan-100 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.75)]" />
            Console access for {siteName}
          </div>

          <div className="grid gap-7 lg:grid-cols-[minmax(0,0.92fr)_minmax(280px,1fr)]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">AI model gateway</p>
              <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl lg:text-5xl">
                Sign in and route AI traffic through a polished SubRouter console.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Manage API keys, explore public model options, and keep usage visibility close to the workflow you already use.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Link
                  to="/models"
                  className="group flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-4 text-left transition hover:border-cyan-200/40 hover:bg-white/[0.1]"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">Browse the model catalog</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-400">Review public model ids and pricing before you create requests.</span>
                  </span>
                  <ArrowRight size={17} className="shrink-0 text-cyan-200 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/docs/quickstart"
                  className="group flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-4 text-left transition hover:border-cyan-200/40 hover:bg-white/[0.1]"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">Open the quickstart</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-400">Use the standard chat completions shape with the SubRouter base URL.</span>
                  </span>
                  <ArrowRight size={17} className="shrink-0 text-cyan-200 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur">
              <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">API endpoint</p>
                    <p className="mt-1 truncate font-mono text-sm text-cyan-100">{PUBLIC_API_BASE_URL}</p>
                  </div>
                  <Server size={18} className="shrink-0 text-cyan-200" />
                </div>
                <div className="mt-4 grid gap-3">
                  {promiseBullets.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                        <Icon size={17} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-white">{title}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-400">{text}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="order-1 lg:order-2">
          <div className="glass overflow-hidden rounded-2xl border border-white/70 bg-white/[0.86] shadow-2xl shadow-slate-950/[0.12] backdrop-blur-xl">
            <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 px-5 py-5 text-white sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Secure console</p>
                  <h2 className="mt-2 text-2xl font-heading font-semibold tracking-normal text-white">{t('login.welcomeBack')}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {site?.name ? t('login.signInTo', { name: site.name }) : t('login.signInToDefault')}
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-cyan-100">
                  <LockKeyhole size={19} />
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <KeyRound size={14} />
                    Keys
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-950">Create and manage</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <Play size={14} />
                    Test
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-950">Open playground</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('login.username')}</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="input border-slate-200 bg-white text-slate-950 placeholder:text-slate-400"
                    placeholder={t('login.enterUsername')}
                    autoComplete="username"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('login.password')}</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input border-slate-200 bg-white text-slate-950 placeholder:text-slate-400"
                    placeholder={t('login.enterPassword')}
                    autoComplete="current-password"
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
                  {loading ? t('login.signingIn') : t('login.signInBtn')}
                </button>
              </form>

              <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50/80 p-3">
                <p className="flex items-start gap-2 text-xs leading-5 text-cyan-900">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-cyan-700" />
                  Use your console account to access API keys, logs, model catalog tools, and playground workflows.
                </p>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  {t('login.noAccount')}{' '}
                  <Link to="/register" className="font-semibold text-slate-950 transition-colors hover:text-cyan-700">
                    {t('login.createOne')}
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
