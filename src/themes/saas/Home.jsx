import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Gauge,
  KeyRound,
  LockKeyhole,
  RefreshCcw,
  Route,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite, useCurrency } from '../../context/SiteContext';
import { getSiteModels, getSitePackages, Q } from '../../api';
import ApiEndpoints from '../../components/ApiEndpoints';

function formatCompactNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

function ProductMockup({ modelCount }) {
  const routes = [
    { label: 'GPT-5 mini', value: '41ms', color: 'bg-cyan-500' },
    { label: 'Claude Sonnet', value: '58ms', color: 'bg-violet-500' },
    { label: 'Gemini Pro', value: '64ms', color: 'bg-emerald-500' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/80">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Routing Console</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">Global AI Gateway</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Live</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_0.72fr]">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Monthly credit</p>
              <p className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">$8,420</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="space-y-3">
            {routes.map((route) => (
              <div key={route.label} className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${route.color}`} />
                <div className="h-2 flex-1 rounded-full bg-slate-200">
                  <div className={`h-full rounded-full ${route.color}`} style={{ width: route.value === '41ms' ? '86%' : route.value === '58ms' ? '68%' : '52%' }} />
                </div>
                <span className="w-12 text-right text-xs font-mono text-slate-500">{route.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">Models</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{modelCount || 50}+</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">Renewal state</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">Auto renews monthly</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">Checkout</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">Creem subscription</p>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-xs text-cyan-800">
        Subscription renewed and credits were applied automatically.
      </div>
    </div>
  );
}

export default function SaasHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { site } = useSite();
  const { fmtPlanPrice } = useCurrency();
  const [models, setModels] = useState([]);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    getSiteModels().then((r) => { if (r.data.success) setModels(r.data.data || []); }).catch(() => {});
    getSitePackages().then((r) => { if (r.data.success) setPackages(r.data.data || []); }).catch(() => {});
  }, []);

  const siteName = site?.name || 'AstraLayer';
  const enabledModels = models.filter((m) => m.enabled !== false);
  const enabledPackages = packages.filter((p) => p.enabled !== false);
  const totalMonthlyQuota = useMemo(
    () => enabledPackages.reduce((sum, pkg) => sum + (Number(pkg.quota_amount) || 0), 0) / Q,
    [enabledPackages],
  );

  const benefits = [
    {
      icon: RefreshCcw,
      title: 'Subscription-native billing',
      desc: 'Users subscribe once. Renewals run through Creem and the platform grants the next cycle automatically.',
    },
    {
      icon: KeyRound,
      title: 'Automatic activation',
      desc: 'Successful checkout activates the plan, applies credits, and records the customer entitlement.',
    },
    {
      icon: Route,
      title: 'Unified model routing',
      desc: 'Offer premium access to OpenAI-compatible models behind one stable API surface.',
    },
    {
      icon: ShieldCheck,
      title: 'SaaS-grade operations',
      desc: 'Customer state, entitlement windows, billing status, and API keys are visible after sign-in.',
    },
  ];

  return (
    <div className="overflow-hidden">
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#eef7fb_100%)]">
        <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-sm font-medium text-cyan-800 shadow-sm">
              <BadgeCheck size={16} />
              Creem-powered AI SaaS subscriptions
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
              {siteName}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              A premium AI subscription platform for teams that want one checkout, automatic renewals, auto-issued credits, and a clean API experience across leading AI models.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to={user ? '/packages' : '/register'}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition-colors hover:bg-slate-800"
              >
                {user ? 'Choose subscription' : t('home.getStarted')}
                <ArrowRight size={17} />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                {t('home.viewPricing')}
              </Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-slate-200 pt-6">
              <div>
                <p className="text-2xl font-semibold text-slate-950">{enabledModels.length || 50}+</p>
                <p className="mt-1 text-sm text-slate-500">AI models</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-950">99.9%</p>
                <p className="mt-1 text-sm text-slate-500">target uptime</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-950">${formatCompactNumber(totalMonthlyQuota || 675)}</p>
                <p className="mt-1 text-sm text-slate-500">monthly credits</p>
              </div>
            </div>
          </div>

          <ProductMockup modelCount={enabledModels.length} />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Billing architecture</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">From checkout to entitlement, without manual recharge.</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              The front end now presents plans as renewable SaaS subscriptions. Checkout, activation, renewal, and credit delivery are handled automatically behind the scenes.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              { icon: CreditCard, title: 'Subscribe', desc: 'Customer selects a recurring plan.' },
              { icon: LockKeyhole, title: 'Checkout', desc: 'Server creates a Creem session.' },
              { icon: Zap, title: 'Webhook', desc: 'Paid event confirms entitlement.' },
              { icon: Gauge, title: 'Activate', desc: 'Credits and API access are applied automatically.' },
            ].map(({ icon: Icon, title, desc }, index) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-900 shadow-sm">
                    <Icon size={18} />
                  </span>
                  <span className="font-mono text-xs text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {enabledPackages.length > 0 && (
        <section className="border-y border-slate-200 bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Subscriptions</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">Plans that renew like a real SaaS product.</h2>
              </div>
              <Link to="/packages" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950">
                View all plans <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {enabledPackages.slice(0, 3).map((pkg, index) => (
                <div key={pkg.id} className={`rounded-2xl border bg-white p-6 shadow-sm ${index === 1 ? 'border-slate-950' : 'border-slate-200'}`}>
                  {index === 1 && (
                    <span className="mb-4 inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">Most popular</span>
                  )}
                  <h3 className="text-xl font-semibold text-slate-950">{pkg.name}</h3>
                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-600">{pkg.description}</p>
                  <div className="mt-6 flex items-end gap-2">
                    <span className="text-4xl font-semibold text-slate-950">{fmtPlanPrice(pkg.price, pkg.currency)}</span>
                    <span className="pb-1 text-sm text-slate-500">/ {pkg.billing_interval || 'month'}</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-sm text-slate-600">
                    <li className="flex items-center gap-2"><BadgeCheck size={16} className="text-cyan-700" /> Auto-renewing Creem subscription</li>
                    <li className="flex items-center gap-2"><BadgeCheck size={16} className="text-cyan-700" /> Automatic credit activation</li>
                    <li className="flex items-center gap-2"><BadgeCheck size={16} className="text-cyan-700" /> OpenAI-compatible API access</li>
                  </ul>
                  <Link to={user ? '/packages' : '/register'} className={`mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold ${
                    index === 1 ? 'bg-slate-950 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}>
                    {user ? 'Subscribe' : t('home.getStarted')}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-slate-200 p-5">
              <Icon size={20} className="text-cyan-700" />
              <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-slate-50 py-10">
        <ApiEndpoints />
      </div>
    </div>
  );
}
