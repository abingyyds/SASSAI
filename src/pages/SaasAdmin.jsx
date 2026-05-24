import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { KeyRound, Loader2, RefreshCcw, Save, UploadCloud } from 'lucide-react';
import {
  getSitePackages,
  getSiteSaasAdminState,
  importSiteSaasCodes,
  updateSiteSaasAdminConfig,
} from '../api';

const adminTokenKey = 'site_saas_admin_token';

function emptyConfig() {
  return {
    creem_api_key: '',
    creem_api_base_url: 'https://api.creem.io',
    creem_checkout_path: '/v1/checkouts',
    creem_webhook_secret: '',
    subrouter_base_url: 'http://localhost:3000',
    subrouter_internal_token: '',
  };
}

export default function SaasAdmin() {
  const [token, setToken] = useState(() => localStorage.getItem(adminTokenKey) || '');
  const [state, setState] = useState(null);
  const [packages, setPackages] = useState([]);
  const [config, setConfig] = useState(emptyConfig());
  const [mappings, setMappings] = useState({});
  const [selectedPackage, setSelectedPackage] = useState('');
  const [codesInput, setCodesInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const enabledPackages = useMemo(
    () => packages.filter((pkg) => pkg.enabled !== false),
    [packages],
  );

  const loadPackages = async () => {
    const res = await getSitePackages().catch(() => null);
    if (res?.data?.success) {
      const data = res.data.data || [];
      setPackages(data);
      setSelectedPackage((current) => current || data[0]?.id || '');
    }
  };

  const loadState = async () => {
    setLoading(true);
    localStorage.setItem(adminTokenKey, token);
    const res = await getSiteSaasAdminState(token).catch((error) => {
      toast.error(error.response?.data?.message || 'Unable to load SaaS admin state');
      return null;
    });
    if (res?.data?.success) {
      const data = res.data.data;
      setState(data);
      setConfig((current) => ({
        ...current,
        creem_api_base_url: data.config?.creem_api_base_url || current.creem_api_base_url,
        creem_checkout_path: data.config?.creem_checkout_path || current.creem_checkout_path,
        subrouter_base_url: data.config?.subrouter_base_url || current.subrouter_base_url,
      }));
      setMappings(data.config?.package_mappings || {});
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    loadState();
  }, []);

  const updateMapping = (packageId, value) => {
    setMappings((current) => ({
      ...current,
      [packageId]: {
        ...(current[packageId] || {}),
        creem_product_id: value,
      },
    }));
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    const payload = {
      creem_api_base_url: config.creem_api_base_url,
      creem_checkout_path: config.creem_checkout_path,
      subrouter_base_url: config.subrouter_base_url,
      package_mappings: mappings,
    };
    if (config.creem_api_key.trim()) payload.creem_api_key = config.creem_api_key.trim();
    if (config.creem_webhook_secret.trim()) payload.creem_webhook_secret = config.creem_webhook_secret.trim();
    if (config.subrouter_internal_token.trim()) payload.subrouter_internal_token = config.subrouter_internal_token.trim();

    const res = await updateSiteSaasAdminConfig(token, payload).catch((error) => {
      toast.error(error.response?.data?.message || 'Failed to save SaaS config');
      return null;
    });
    if (res?.data?.success) {
      toast.success('SaaS billing config saved');
      setConfig((current) => ({
        ...current,
        creem_api_key: '',
        creem_webhook_secret: '',
        subrouter_internal_token: '',
      }));
      setState(res.data.data);
    }
    setSaving(false);
  };

  const handleImportCodes = async () => {
    if (!selectedPackage || !codesInput.trim()) {
      toast.error('Select a target package and paste internal activation codes first');
      return;
    }
    setImporting(true);
    const res = await importSiteSaasCodes(token, {
      package_id: selectedPackage,
      codes: codesInput,
    }).catch((error) => {
      toast.error(error.response?.data?.message || 'Failed to import codes');
      return null;
    });
    if (res?.data?.success) {
      toast.success(`Imported ${res.data.data.imported} new codes`);
      setCodesInput('');
      setState(res.data.data.state);
    }
    setImporting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Site-owned SaaS backend</p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">SaaS Billing Admin</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Configure Creem, map SubRouter packages to Creem products, and upload the internal code pool used to activate subscriptions after payment.
            </p>
          </div>
          <button
            type="button"
            onClick={loadState}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
            Refresh
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-slate-950">Site admin token</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                type="password"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="SITE_ADMIN_TOKEN"
              />
            </div>
            <button
              type="button"
              onClick={loadState}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Connect
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">Set SITE_ADMIN_TOKEN on the site backend in production. If it is empty, local development allows access without a token.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Payment and backend settings</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Creem API key" value={config.creem_api_key} onChange={(value) => setConfig({ ...config, creem_api_key: value })} placeholder={state?.config?.creem_api_key_configured ? 'Configured. Leave blank to keep.' : 'Enter API key'} secret />
              <Field label="Creem webhook secret" value={config.creem_webhook_secret} onChange={(value) => setConfig({ ...config, creem_webhook_secret: value })} placeholder={state?.config?.creem_webhook_secret_configured ? 'Configured. Leave blank to keep.' : 'Webhook signing secret'} secret />
              <Field label="Creem API base URL" value={config.creem_api_base_url} onChange={(value) => setConfig({ ...config, creem_api_base_url: value })} />
              <Field label="Checkout path" value={config.creem_checkout_path} onChange={(value) => setConfig({ ...config, creem_checkout_path: value })} />
              <Field label="SubRouter API base URL" value={config.subrouter_base_url} onChange={(value) => setConfig({ ...config, subrouter_base_url: value })} />
              <Field label="SubRouter internal token" value={config.subrouter_internal_token} onChange={(value) => setConfig({ ...config, subrouter_internal_token: value })} placeholder={state?.config?.subrouter_internal_token_configured ? 'Configured. Leave blank to keep.' : 'Optional'} secret />
            </div>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-slate-500">Package to Creem product mapping</h3>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              {enabledPackages.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">No SubRouter packages loaded.</p>
              ) : (
                enabledPackages.map((pkg) => (
                  <div key={pkg.id} className="grid gap-3 border-b border-slate-100 p-4 last:border-0 md:grid-cols-[1fr_1.2fr] md:items-center">
                    <div>
                      <p className="font-medium text-slate-950">{pkg.name}</p>
                      <p className="mt-1 font-mono text-xs text-slate-500">{pkg.id}</p>
                    </div>
                    <input
                      value={mappings[pkg.id]?.creem_product_id || pkg.creem_product_id || ''}
                      onChange={(event) => updateMapping(pkg.id, event.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      placeholder="prod_xxx"
                    />
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={saving}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save settings
            </button>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Internal code pool</h2>
            <p className="mt-1 text-sm text-slate-500">Paste one code per line. Codes are grouped by target package and consumed automatically after payment confirmation.</p>
            <select
              value={selectedPackage}
              onChange={(event) => setSelectedPackage(event.target.value)}
              className="mt-5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              {enabledPackages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>{pkg.name} ({pkg.id})</option>
              ))}
            </select>
            <textarea
              value={codesInput}
              onChange={(event) => setCodesInput(event.target.value)}
              rows={9}
              className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              placeholder={'code_1\ncode_2\ncode_3'}
            />
            <button
              type="button"
              onClick={handleImportCodes}
              disabled={importing}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60"
            >
              {importing ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              Import codes
            </button>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
              <div className="hidden grid-cols-5 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
                <span>Package</span>
                <span>Total</span>
                <span>Free</span>
                <span>Activated</span>
                <span>Failed</span>
              </div>
              {(state?.code_stats || []).length === 0 ? (
                <p className="p-4 text-sm text-slate-500">No codes imported yet.</p>
              ) : (
                state.code_stats.map((stat) => (
                  <div key={stat.package_id} className="grid gap-2 border-t border-slate-100 px-3 py-3 text-sm sm:grid-cols-5 sm:py-2">
                    <span className="truncate font-mono text-xs text-slate-600">{stat.package_id}</span>
                    <span><span className="text-xs text-slate-500 sm:hidden">Total </span>{stat.total}</span>
                    <span className="text-emerald-700"><span className="text-xs text-slate-500 sm:hidden">Free </span>{stat.available}</span>
                    <span><span className="text-xs text-slate-500 sm:hidden">Activated </span>{stat.subscribed}</span>
                    <span className="text-rose-700"><span className="text-xs text-slate-500 sm:hidden">Failed </span>{stat.failed}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Recent backend events</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            {(state?.events || []).length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No events yet.</p>
            ) : (
              state.events.slice(0, 12).map((event) => (
                <div key={event.id} className="grid gap-2 border-b border-slate-100 p-3 text-sm last:border-0 md:grid-cols-[180px_180px_1fr]">
                  <span className="text-slate-500">{new Date(event.created_at).toLocaleString()}</span>
                  <span className="font-semibold text-slate-950">{event.type}</span>
                  <code className="break-all rounded bg-slate-50 px-2 py-1 text-xs text-slate-600">{JSON.stringify(event.detail || {})}</code>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, secret = false }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={secret ? 'password' : 'text'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}
