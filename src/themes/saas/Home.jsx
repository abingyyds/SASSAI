import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Code2,
  KeyRound,
  Play,
  Route,
  Server,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite, useCurrency } from '../../context/SiteContext';
import { getSitePackages, Q } from '../../api';
import CodeBlock from '../../components/CodeBlock';
import ModelBadges, { AvailabilityBadge } from '../../components/ModelBadges';
import ModelPrice from '../../components/ModelPrice';
import { PUBLIC_API_BASE_URL } from '../../constants/api';
import { getPublicModelCatalog, readPublicModelCatalog } from '../../utils/publicCatalog';
import {
  buildCurlSnippet,
  formatCompactNumber,
  getModelCategory,
  getModelDisplayName,
  getModelId,
  getModelRoute,
  sortModels,
} from '../../utils/modelMeta';

export default function SaasHome() {
  const { user } = useAuth();
  const { site } = useSite();
  const { fmtPlanPrice } = useCurrency();
  const cachedCatalog = useMemo(() => readPublicModelCatalog(), []);
  const [models, setModels] = useState(() => cachedCatalog?.models || []);
  const [packages, setPackages] = useState([]);
  const siteName = site?.name || 'SubRouter';
  const baseUrl = PUBLIC_API_BASE_URL;

  useEffect(() => {
    let cancelled = false;
    getPublicModelCatalog().then((catalog) => {
      if (!cancelled) setModels(catalog.models);
    }).catch(() => {});
    getSitePackages().then((res) => { if (res.data.success) setPackages(res.data.data || []); }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const enabledModels = useMemo(() => models.filter((model) => model.enabled !== false), [models]);
  const featuredModels = useMemo(() => sortModels(enabledModels, 'popular').slice(0, 6), [enabledModels]);
  const categoryGroups = useMemo(() => {
    const groups = new Map();
    enabledModels.forEach((model) => {
      const category = getModelCategory(model);
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(model);
    });
    return Array.from(groups.entries())
      .map(([name, items]) => ({ key: name.toLowerCase(), name, models: items }))
      .sort((a, b) => b.models.length - a.models.length || a.name.localeCompare(b.name))
      .slice(0, 8);
  }, [enabledModels]);
  const enabledPackages = useMemo(() => packages.filter((pkg) => pkg.enabled !== false), [packages]);
  const totalCredits = useMemo(
    () => enabledPackages.reduce((sum, pkg) => sum + (Number(pkg.quota_amount) || 0), 0) / Q,
    [enabledPackages],
  );
  const defaultModelId = featuredModels[0] ? getModelId(featuredModels[0]) : 'gpt-4o-mini';

  return (
    <div className="overflow-hidden bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
              <Sparkles size={16} />
              AI model catalog and global gateway
            </div>
            <h1 className="text-6xl font-semibold tracking-normal text-slate-950">
              {siteName}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Explore public model families, compare official pricing, create API keys, and use one OpenAI-compatible base URL for production AI workflows.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={user ? '/tokens' : '/register'}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 hover:bg-slate-800"
              >
                <KeyRound size={17} />
                Get API key
              </Link>
              <Link
                to="/models"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Boxes size={17} />
                Explore models
              </Link>
              <Link
                to={`/chat?model=${encodeURIComponent(defaultModelId)}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Play size={17} />
                Open playground
              </Link>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              <HeroStat label="Models" value={`${enabledModels.length || 50}+`} />
              <HeroStat label="Categories" value={`${categoryGroups.length || 6}+`} />
              <HeroStat label="Credits in plans" value={totalCredits > 0 ? `$${formatCompactNumber(totalCredits)}` : 'API'} />
            </div>
          </div>

          <GatewayPanel models={featuredModels} baseUrl={baseUrl} />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <EndpointCard title="Base URL" value={baseUrl} icon={Server} />
          <EndpointCard title="Chat completions" value={`${baseUrl}/chat/completions`} icon={Code2} />
          <EndpointCard title="Model catalog" value="/models" icon={Boxes} link="/models" />
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold text-sky-700">Featured models</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Compare models before you route traffic.</h2>
            </div>
            <Link to="/models" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950">
              View model catalog <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredModels.map((model) => (
              <Link key={getModelId(model)} to={getModelRoute(model)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-950">{getModelDisplayName(model)}</h3>
                    <p className="mt-1 truncate font-mono text-xs text-slate-500">{getModelId(model)}</p>
                  </div>
                  <AvailabilityBadge model={model} />
                </div>
                <p className="mt-3 text-sm text-slate-600">{getModelCategory(model)}</p>
                <div className="mt-4"><ModelBadges model={model} /></div>
                <div className="mt-4"><ModelPrice model={model} /></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold text-sky-700">Gateway capabilities</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">One API surface for a changing model ecosystem.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <ValueCard icon={Route} title="Stable model ids" text="Choose one public model family and keep the same id in your application code." />
            <ValueCard icon={Shuffle} title="Production-ready" text="Use one gateway base URL while the platform handles operational routing behind the scenes." />
            <ValueCard icon={Code2} title="OpenAI compatible" text={`Point OpenAI SDKs at ${PUBLIC_API_BASE_URL} and keep the standard request shape.`} />
            <ValueCard icon={Zap} title="Price-aware" text="Compare input, output, cache, and per-call economics before choosing a model." />
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold text-sky-700">Catalog families</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Models grouped by public capability.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              These groups are generated from the same public model families used by pricing, tokens, and catalog pages.
            </p>
            <Link to="/models" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              Browse models <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {categoryGroups.map((group) => (
              <Link key={group.key} to={`/models?category=${encodeURIComponent(group.name)}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:bg-white">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-800 shadow-sm">
                    <ShieldCheck size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950">{group.name}</p>
                    <p className="text-xs text-slate-500">{group.models.length} models</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold text-sky-700">Quickstart</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Use your first model in minutes.</h2>
            <div className="mt-6 space-y-4">
              <QuickStep title="Create an API key" text="Generate a key from the signed-in API Keys page." />
              <QuickStep title="Choose a model" text="Copy the exact model id from the catalog or detail page." />
              <QuickStep title="Send a request" text={`Use the OpenAI-compatible ${PUBLIC_API_BASE_URL}/chat/completions endpoint.`} />
            </div>
          </div>
          <CodeBlock
            title="First request"
            language="bash"
            code={buildCurlSnippet({ baseUrl, modelId: defaultModelId })}
          />
        </div>
      </section>

      {enabledPackages.length > 0 && (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-semibold text-sky-700">Platform access</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Plans keep the existing credit and package flow intact.</h2>
              </div>
              <Link to="/packages" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950">
                View packages <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {enabledPackages.slice(0, 3).map((pkg) => (
                <div key={pkg.id} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-950">{pkg.name}</h3>
                  <p className="mt-2 min-h-[44px] text-sm leading-6 text-slate-600">{pkg.description}</p>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-3xl font-semibold text-slate-950">{fmtPlanPrice(pkg.price, pkg.currency)}</span>
                    <span className="pb-1 text-sm text-slate-500">/{pkg.billing_interval || 'cycle'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function GatewayPanel({ models, baseUrl }) {
  const rows = models.length ? models.slice(0, 4) : [];
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 shadow-2xl shadow-slate-200">
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <p className="text-xs font-medium text-slate-400">Gateway console</p>
          <p className="mt-1 text-sm font-semibold text-white">{baseUrl}/chat/completions</p>
        </div>
        <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">Catalog live</span>
      </div>
      <div className="space-y-2">
        {rows.map((model, index) => (
          <div key={getModelId(model)} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{getModelDisplayName(model)}</p>
              <p className="mt-1 truncate font-mono text-xs text-slate-400">{getModelId(model)}</p>
            </div>
            <span className="font-mono text-xs text-slate-400">0{index + 1}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-sky-400/20 bg-sky-400/10 p-3 text-xs leading-5 text-sky-100">
        Select a model, copy its id, and send requests through the API subdomain endpoint.
      </div>
    </div>
  );
}

function EndpointCard({ title, value, icon: Icon, link }) {
  const content = (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
        <Icon size={17} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="mt-1 truncate font-mono text-sm text-slate-900">{value}</p>
      </div>
    </div>
  );
  if (link) return <Link to={link}>{content}</Link>;
  return content;
}

function ValueCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <Icon size={20} className="text-sky-700" />
      <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function QuickStep({ title, text }) {
  return (
    <div className="flex gap-3">
      <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-emerald-600" />
      <div>
        <p className="font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}
