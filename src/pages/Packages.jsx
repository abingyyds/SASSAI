import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/SiteContext';
import {
  createSiteSaasCheckout,
  getSiteSaasSubscriptions,
  getSiteModels,
  getSitePackages,
  Q,
} from '../api';

const resetLabelKeys = {
  never: 'packages.resetNever',
  daily: 'packages.resetDaily',
  weekly: 'packages.resetWeekly',
  monthly: 'packages.resetMonthly',
};

function formatDate(value) {
  if (!value) return '—';
  const numeric = Number(value);
  const date = Number.isFinite(numeric)
    ? (numeric > 10000000000 ? new Date(numeric) : new Date(numeric * 1000))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function normalizeInterval(pkg) {
  const interval = pkg.billing_interval || pkg.interval || pkg.period || '';
  if (interval) return String(interval).replace(/^every_/, '');
  if (pkg.duration >= 365) return 'year';
  if (pkg.duration >= 90) return 'quarter';
  return 'month';
}

function getSubscriptionStatus(sub) {
  return String(sub.status || sub.subscription_status || 'active').toLowerCase();
}

function BillingStep({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <Icon size={20} className="text-cyan-700" />
      <h3 className="mt-4 text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
    </div>
  );
}

export default function Packages() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const { fmtPlanPrice, symbol, rate } = useCurrency();

  const [packages, setPackages] = useState([]);
  const [models, setModels] = useState([]);
  const [activeSubs, setActiveSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  const getResetLabel = (period) => t(resetLabelKeys[period] || resetLabelKeys.never);

  const loadSubscriptions = async () => {
    if (!user) return;
    const res = await getSiteSaasSubscriptions({ skipErrorHandler: true }).catch(() => null);
    if (res?.data?.success) setActiveSubs(res.data.data || []);
  };

  useEffect(() => {
    Promise.all([
      getSitePackages().then((r) => { if (r.data.success) setPackages(r.data.data || []); }).catch(() => {}),
      getSiteModels().then((r) => { if (r.data.success) setModels(r.data.data || []); }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [user]);

  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout_status') || searchParams.get('status') || searchParams.get('payment');
    if (!user || !checkoutStatus) return;

    const sync = async () => {
      if (checkoutStatus === 'success' || checkoutStatus === 'return') {
        toast.success('Checkout completed. Your subscription will activate automatically after payment confirmation.');
      } else if (checkoutStatus === 'cancelled' || checkoutStatus === 'cancel') {
        toast.error('Checkout was cancelled.');
      }
      await Promise.all([refreshUser({ skipErrorHandler: true }), loadSubscriptions()]);
      setSearchParams({}, { replace: true });
    };

    sync();
  }, [user, searchParams, setSearchParams, refreshUser]);

  const enabledPackages = useMemo(
    () => packages.filter((pkg) => pkg.enabled !== false),
    [packages],
  );
  const enabledModels = useMemo(
    () => models.filter((model) => model.enabled !== false),
    [models],
  );

  const packageById = useMemo(() => {
    const map = new Map();
    enabledPackages.forEach((pkg) => map.set(String(pkg.id), pkg));
    return map;
  }, [enabledPackages]);

  const handleSubscribe = async (pkg) => {
    if (!user) {
      navigate('/register');
      return;
    }

    setCheckoutLoading(pkg.id);
    try {
      const returnUrl = `${window.location.origin}/packages?checkout_status=success`;
      const productId = pkg.creem_product_id || pkg.product_id || pkg.creemProductId || pkg.creem_product || pkg.id;
      const res = await createSiteSaasCheckout({
        product_id: productId,
        package_id: pkg.id,
        package_name: pkg.name,
        billing_interval: normalizeInterval(pkg),
        return_url: returnUrl,
      });

      const checkoutUrl = res.data?.data?.checkout_url || res.data?.data?.pay_link || res.data?.checkout_url;
      if ((res.data?.success || res.data?.message === 'success') && checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error(res.data?.message || 'Site SaaS billing is not configured yet.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Site SaaS billing is not configured yet.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-slate-400" size={28} />
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm font-medium text-cyan-800">
              <RefreshCcw size={16} />
              SaaS subscription billing
            </div>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl lg:text-5xl">
              Subscribe once. Credits renew automatically.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Pick a plan, complete Creem checkout, and the subscription activates automatically. Renewals keep your credits flowing without manual top-ups or extra purchase steps.
            </p>
          </div>
        </div>
      </section>

      {activeSubs.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{t('packages.mySubscriptions')}</h2>
                <p className="mt-1 text-sm text-slate-500">Your active plans, renewal windows, and available credits are managed automatically.</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {activeSubs.map((sub) => {
                const pkg = packageById.get(String(sub.package_id));
                const total = sub.amount_total || sub.quota_amount || pkg?.quota_amount || 0;
                const used = sub.amount_used || sub.used_quota || 0;
                const remain = Math.max(0, total - used);
                const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
                const status = getSubscriptionStatus(sub);

                return (
                  <div key={sub.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{pkg?.name || sub.package_name || t('packages.subscriptionId', { id: sub.id })}</p>
                        <p className="mt-1 text-xs text-slate-500">Site subscription #{sub.id}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        ['active', 'trialing'].includes(status)
                          ? 'bg-emerald-50 text-emerald-700'
                          : status.includes('cancel')
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-200 text-slate-700'
                      }`}>
                        {status}
                      </span>
                    </div>
                    <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Current period ends</p>
                        <p className="mt-1 font-medium text-slate-950">{formatDate(sub.current_period_end || sub.end_time)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Next renewal</p>
                        <p className="mt-1 font-medium text-slate-950">{formatDate(sub.next_renewal_time || sub.next_reset_time || sub.current_period_end)}</p>
                      </div>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>Credit used</span>
                      <span>{symbol}{(remain / Q * rate).toFixed(2)} remaining</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-cyan-600" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {enabledPackages.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-600">{t('packages.noPackages')}</p>
            <Link to="/models?sort=price" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700">
              {t('packages.checkPricing')} <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {enabledPackages.map((pkg, index) => {
              const resetPeriod = pkg.quota_reset_period || 'monthly';
              const isSubscription = resetPeriod !== 'never' || pkg.creem_product_id || pkg.billing_interval;
              const monthlyCredit = pkg.quota_amount > 0 ? pkg.quota_amount / Q : 0;
              const interval = normalizeInterval(pkg);
              const isFeatured = index === 1 || pkg.recommended || pkg.is_popular;
              return (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm sm:p-6 ${
                    isFeatured ? 'border-slate-950 shadow-lg shadow-slate-200' : 'border-slate-200'
                  }`}
                >
                  {isFeatured && (
                    <span className="mb-5 inline-flex w-fit rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                      Recommended
                    </span>
                  )}
                  <div className="flex-1">
                    <h3 className="break-words text-lg font-semibold text-slate-950 sm:text-xl">{pkg.name}</h3>
                    {pkg.description && (
                      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-600">{pkg.description}</p>
                    )}

                    <div className="mt-6 flex items-end gap-2">
                      <span className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
                        {fmtPlanPrice(pkg.price, pkg.currency)}
                      </span>
                      <span className="pb-1 text-sm text-slate-500">/ {interval}</span>
                    </div>
                    {pkg.original_price > 0 && pkg.original_price > pkg.price && (
                      <p className="mt-1 text-sm text-slate-400 line-through">
                        {fmtPlanPrice(pkg.original_price, pkg.currency)}
                      </p>
                    )}

                    <div className="mt-6 rounded-xl border border-cyan-100 bg-cyan-50 p-4">
                      <div className="flex items-start gap-3">
                        <RefreshCcw className="mt-0.5 text-cyan-700" size={18} />
                        <div>
                          <p className="text-sm font-semibold text-cyan-950">
                           {isSubscription ? 'Auto-renewing subscription' : 'One-time plan'}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-cyan-800">
                            {isSubscription
                              ? 'Checkout, activation, and future renewals are handled automatically.'
                              : 'This plan can be activated immediately after checkout.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <ul className="mt-6 space-y-3 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <BadgeCheck size={16} className="text-cyan-700" />
                        <span>{monthlyCredit > 0 ? `${symbol}${(monthlyCredit * rate).toFixed(2)} ${getResetLabel(resetPeriod)} credit` : 'Custom credit allocation'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BadgeCheck size={16} className="text-cyan-700" />
                        <span>{enabledModels.length || 50}+ model routing catalog</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BadgeCheck size={16} className="text-cyan-700" />
                        <span>Automatic plan activation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BadgeCheck size={16} className="text-cyan-700" />
                        <span>OpenAI-compatible API keys</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubscribe(pkg)}
                    disabled={checkoutLoading === pkg.id}
                    className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      isFeatured
                        ? 'bg-slate-950 text-white hover:bg-slate-800'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {checkoutLoading === pkg.id ? (
                      <>
                        <Loader2 className="animate-spin" size={17} />
                        Creating checkout
                      </>
                    ) : (
                      <>
                        {user ? 'Pay with Creem' : t('packages.signUpToSubscribe')}
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          <BillingStep
            icon={CreditCard}
            title="Subscribe"
            desc="Choose a recurring plan and complete secure Creem checkout."
          />
          <BillingStep
            icon={ShieldCheck}
            title="Confirm"
            desc="Payment confirmation is processed by the subscription system."
          />
          <BillingStep
            icon={Sparkles}
            title="Activate"
            desc="Your credits and API access are applied automatically."
          />
          <BillingStep
            icon={CalendarClock}
            title="Renewal applied"
            desc="Successful renewals extend the plan without manual action."
          />
        </div>
      </section>
    </div>
  );
}
