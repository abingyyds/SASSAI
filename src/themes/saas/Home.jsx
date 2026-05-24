import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Code2,
  Cpu,
  Gauge,
  Globe2,
  KeyRound,
  Layers3,
  Play,
  Route,
  Server,
  ShieldCheck,
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

const fallbackDisplayModels = [
  { id: 'gpt-4o-mini', model_name: 'gpt-4o-mini', display_name: 'GPT-4o Mini', category: 'Fast reasoning' },
  { id: 'claude-sonnet-4-5', model_name: 'claude-sonnet-4-5', display_name: 'Claude Sonnet 4.5', category: 'Advanced reasoning' },
  { id: 'gemini-2.5-pro', model_name: 'gemini-2.5-pro', display_name: 'Gemini 2.5 Pro', category: 'Multimodal' },
  { id: 'deepseek-chat', model_name: 'deepseek-chat', display_name: 'DeepSeek Chat', category: 'General purpose' },
];

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
  const displayModels = featuredModels.length ? featuredModels : fallbackDisplayModels;
  const routeModels = displayModels.slice(0, 4);
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
  const defaultModelId = displayModels[0] ? getModelId(displayModels[0]) : 'gpt-4o-mini';

  const heroStats = [
    { label: 'Public models', value: `${enabledModels.length || 50}+`, detail: 'catalog ready' },
    { label: 'Model groups', value: `${categoryGroups.length || 6}+`, detail: 'public capabilities' },
    { label: 'Plan credits', value: totalCredits > 0 ? `$${formatCompactNumber(totalCredits)}` : 'API', detail: 'billing intact' },
  ];

  const valueCards = [
    {
      icon: Route,
      title: 'Stable model ids',
      text: 'Choose one public model family and keep the same id in your application code.',
    },
    {
      icon: Globe2,
      title: 'Production gateway',
      text: 'Use one gateway base URL while the platform keeps the public API surface stable.',
    },
    {
      icon: Code2,
      title: 'OpenAI compatible',
      text: `Point OpenAI SDKs at ${baseUrl} and keep the standard request shape.`,
    },
    {
      icon: Gauge,
      title: 'Price-aware choices',
      text: 'Compare input, output, cache, and per-call economics before choosing a model.',
    },
  ];

  return (
    <div className="overflow-hidden bg-[#f7f9fc] text-slate-950">
      <HomeMotionStyles />

      <section className="saas-home-field relative isolate overflow-hidden border-b border-white/10 text-white">
        <div className="saas-home-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="saas-home-sweep pointer-events-none absolute inset-y-0 -left-1/4 w-1/2 opacity-60" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f7f9fc] to-transparent" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-20 lg:pt-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.15] bg-white/[0.08] px-3 py-1.5 text-sm font-medium text-cyan-50 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75 saas-home-pulse" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>
              AI model catalog and global gateway
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              {siteName}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              Explore public model families, compare official pricing, create API keys, and run production AI workflows through one OpenAI-compatible base URL.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={user ? '/tokens' : '/register'}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-950/20 transition hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                <KeyRound size={17} />
                Get API key
              </Link>
              <Link
                to="/models"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.15] bg-white/[0.08] px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-200/60 hover:bg-white/[0.14]"
              >
                <Boxes size={17} />
                Explore models
              </Link>
              <Link
                to={`/chat?model=${encodeURIComponent(defaultModelId)}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-slate-200 transition hover:text-white"
              >
                <Play size={17} />
                Open playground
              </Link>
            </div>

            <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <HeroStat key={stat.label} {...stat} />
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-300" />
                OpenAI-compatible
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-300" />
                Public model catalog
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-300" />
                Base URL: {baseUrl}
              </span>
            </div>
          </div>

          <GatewayPanel models={routeModels} baseUrl={baseUrl} totalModels={enabledModels.length} />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <EndpointCard title="Base URL" value={baseUrl} icon={Server} />
          <EndpointCard title="Chat completions" value={`${baseUrl}/chat/completions`} icon={Code2} />
          <EndpointCard title="Model catalog" value="/models" icon={Boxes} link="/models" />
        </div>
      </section>

      <section className="bg-[#f7f9fc] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Featured models"
            title="Compare models before you route traffic."
            text="Public model cards keep capability, status, and pricing signals visible before you commit a production workload."
            action={{ to: '/models', label: 'View model catalog' }}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredModels.length > 0 ? (
              featuredModels.map((model) => (
                <FeaturedModelCard key={getModelId(model)} model={model} />
              ))
            ) : (
              <CatalogSyncState />
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ModelRoutingVisual models={routeModels} baseUrl={baseUrl} />
        </div>
      </section>

      <section className="bg-[#f7f9fc] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Gateway capabilities"
            title="One API surface for a changing model ecosystem."
            text="Keep integration work small while the model catalog, public pricing, and production access evolve around your app."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {valueCards.map((card) => (
              <ValueCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold text-cyan-700">Catalog families</p>
            <h2 className="mt-2 max-w-xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Models grouped by public capability.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              These groups are generated from the same public model families used by pricing, tokens, and catalog pages.
            </p>
            <Link to="/models" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
              Browse models <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {categoryGroups.length > 0 ? (
              categoryGroups.map((group) => (
                <CategoryCard key={group.key} group={group} />
              ))
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 sm:col-span-2">
                The catalog is syncing. Model families will appear here when public catalog data is available.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold text-cyan-300">Quickstart</p>
            <h2 className="mt-2 max-w-xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Use your first model in minutes.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Keep the request shape familiar: generate a key, choose a public model id, and send traffic to the SubRouter API base.
            </p>
            <div className="mt-7 space-y-4">
              <QuickStep title="Create an API key" text="Generate a key from the signed-in API Keys page." />
              <QuickStep title="Choose a model" text="Copy the exact model id from the catalog or detail page." />
              <QuickStep title="Send a request" text={`Use the OpenAI-compatible ${baseUrl}/chat/completions endpoint.`} />
            </div>
          </div>
          <div className="grid gap-4">
            <UsagePanel baseUrl={baseUrl} modelId={defaultModelId} />
            <CodeBlock
              title="First request"
              language="bash"
              code={buildCurlSnippet({ baseUrl, modelId: defaultModelId })}
              className="border-white/10 shadow-2xl shadow-cyan-950/30"
            />
          </div>
        </div>
      </section>

      {enabledPackages.length > 0 && (
        <section className="bg-[#f7f9fc] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Platform access"
              title="Plans keep the existing credit and package flow intact."
              text="Public package cards stay focused on plan value while billing, activation, and access controls continue through the existing platform flow."
              action={{ to: '/packages', label: 'View packages' }}
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {enabledPackages.slice(0, 3).map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} fmtPlanPrice={fmtPlanPrice} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function HomeMotionStyles() {
  return (
    <style>{`
      @keyframes saas-home-gradient {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      @keyframes saas-home-sweep {
        0% { transform: translateX(-40%) skewX(-12deg); opacity: 0; }
        16% { opacity: 0.55; }
        54% { opacity: 0.2; }
        100% { transform: translateX(280%) skewX(-12deg); opacity: 0; }
      }
      @keyframes saas-home-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      @keyframes saas-home-flow {
        0% { transform: translateX(-120%); }
        100% { transform: translateX(120%); }
      }
      @keyframes saas-home-pulse {
        0%, 100% { transform: scale(1); opacity: 0.45; }
        50% { transform: scale(2.4); opacity: 0; }
      }
      .saas-home-field {
        background:
          linear-gradient(118deg, rgba(2, 6, 23, 0.98), rgba(8, 47, 73, 0.9), rgba(6, 78, 59, 0.86), rgba(15, 23, 42, 0.98));
        background-size: 170% 170%;
        animation: saas-home-gradient 18s ease-in-out infinite;
      }
      .saas-home-grid {
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
        background-size: 48px 48px;
        mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.88), rgba(0, 0, 0, 0.2));
      }
      .saas-home-sweep {
        background: linear-gradient(90deg, transparent, rgba(125, 211, 252, 0.22), transparent);
        animation: saas-home-sweep 12s ease-in-out infinite;
      }
      .saas-home-float {
        animation: saas-home-float 8s ease-in-out infinite;
      }
      .saas-home-flow {
        position: relative;
        overflow: hidden;
      }
      .saas-home-flow::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.28), transparent);
        animation: saas-home-flow 3.8s ease-in-out infinite;
      }
      .saas-home-pulse {
        animation: saas-home-pulse 2.5s ease-in-out infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .saas-home-field,
        .saas-home-sweep,
        .saas-home-float,
        .saas-home-flow::after,
        .saas-home-pulse {
          animation: none !important;
        }
      }
    `}</style>
  );
}

function HeroStat({ label, value, detail }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.08] px-4 py-3 shadow-sm backdrop-blur transition hover:border-cyan-200/40 hover:bg-white/[0.12]">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-cyan-100">{detail}</p>
    </div>
  );
}

function GatewayPanel({ models, baseUrl, totalModels }) {
  const rows = models.length ? models.slice(0, 4) : fallbackDisplayModels;
  const signals = [
    { label: 'Catalog', value: `${totalModels || 50}+ models`, icon: Boxes, tone: 'emerald' },
    { label: 'Base URL', value: baseUrl, icon: Server, tone: 'cyan' },
    { label: 'Mode', value: 'Production', icon: Activity, tone: 'amber' },
  ];

  return (
    <div className="saas-home-float relative hidden lg:block">
      <div className="rounded-lg border border-white/[0.12] bg-slate-950/[0.76] p-4 shadow-2xl shadow-cyan-950/[0.35] backdrop-blur">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-cyan-200">Gateway console</p>
            <p className="mt-1 truncate font-mono text-sm font-semibold text-white">{baseUrl}/chat/completions</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Live
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {signals.map((signal) => (
            <SignalMetric key={signal.label} {...signal} />
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Model lanes</p>
              <p className="mt-1 text-sm font-semibold text-white">Public catalog selection</p>
            </div>
            <Route size={18} className="text-cyan-200" />
          </div>
          <div className="space-y-2">
            {rows.map((model, index) => (
              <div key={getModelId(model)} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-slate-900/80 p-3 transition hover:border-cyan-300/30 hover:bg-slate-900">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{getModelDisplayName(model)}</p>
                  <p className="mt-1 truncate font-mono text-xs text-slate-400">{getModelId(model)}</p>
                </div>
                <span className="font-mono text-xs text-cyan-200">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-3 text-xs text-slate-300">
          <FlowNode label="Request" icon={Zap} />
          <FlowLine />
          <FlowNode label="Model id" icon={Cpu} />
          <FlowLine />
          <FlowNode label="Response" icon={CheckCircle2} />
        </div>
      </div>
    </div>
  );
}

function SignalMetric({ label, value, icon: Icon, tone }) {
  const toneClasses = {
    emerald: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
    cyan: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100',
    amber: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
  };

  return (
    <div className={`grid grid-cols-[auto_1fr] items-center gap-3 rounded-lg border p-3 ${toneClasses[tone] || toneClasses.cyan}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
        <Icon size={17} />
      </span>
      <div className="min-w-0">
        <p className="text-xs opacity-80">{label}</p>
        <p className="mt-0.5 truncate font-mono text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function FlowNode({ label, icon: Icon }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2">
      <Icon size={14} className="text-cyan-200" />
      <span>{label}</span>
    </div>
  );
}

function FlowLine() {
  return <div className="saas-home-flow h-px min-w-14 bg-white/[0.12]" />;
}

function EndpointCard({ title, value, icon: Icon, link }) {
  const content = (
    <div className="group flex min-h-[92px] items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-950/5">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white transition group-hover:bg-cyan-700">
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

function SectionHeader({ eyebrow, title, text, action }) {
  return (
    <div className="mb-9 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-cyan-700">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">{title}</h2>
        {text && <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{text}</p>}
      </div>
      {action && (
        <Link to={action.to} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-cyan-700">
          {action.label} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

function FeaturedModelCard({ model }) {
  return (
    <Link
      to={getModelRoute(model)}
      className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-950/[0.08]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-950">{getModelDisplayName(model)}</h3>
          <p className="mt-1 truncate font-mono text-xs text-slate-500">{getModelId(model)}</p>
        </div>
        <AvailabilityBadge model={model} />
      </div>
      <p className="mt-3 text-sm text-slate-600">{getModelCategory(model)}</p>
      <div className="mt-4"><ModelBadges model={model} /></div>
      <div className="mt-5 border-t border-slate-100 pt-4"><ModelPrice model={model} /></div>
    </Link>
  );
}

function CatalogSyncState() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 md:col-span-2 xl:col-span-3">
      Public catalog data is loading. Featured model cards will appear as soon as pricing and availability are available.
    </div>
  );
}

function ModelRoutingVisual({ models, baseUrl }) {
  const rows = models.length ? models.slice(0, 4) : fallbackDisplayModels;

  return (
    <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
      <div>
        <p className="text-sm font-semibold text-cyan-700">Model routing visual</p>
        <h2 className="mt-2 max-w-xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
          One request path, many public model choices.
        </h2>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Keep the endpoint stable while your app selects the public model id that fits cost, speed, context, or capability needs.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <MiniCapability icon={ShieldCheck} title="Stable access" text="API keys and model ids stay predictable." />
          <MiniCapability icon={Code2} title="SDK ready" text="Use familiar OpenAI-compatible clients." />
          <MiniCapability icon={Gauge} title="Pricing context" text="Compare economics before launch." />
          <MiniCapability icon={Activity} title="Live catalog" text="Public availability stays visible." />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 shadow-2xl shadow-slate-950/[0.12]">
        <div className="mb-4 flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">OpenAI-compatible endpoint</p>
            <p className="mt-1 break-all font-mono text-sm font-semibold text-white">{baseUrl}/chat/completions</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
            <Route size={13} />
            Public route
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[0.88fr_auto_1.12fr] sm:items-stretch">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-medium text-slate-400">Request</p>
            <div className="mt-4 space-y-2 font-mono text-xs text-slate-200">
              <p>POST /v1/chat/completions</p>
              <p>Authorization: Bearer sk-...</p>
              <p>model: {getModelId(rows[0])}</p>
            </div>
          </div>

          <div className="hidden min-w-16 items-center sm:flex">
            <FlowLine />
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-medium text-slate-400">Public model choices</p>
            <div className="mt-4 space-y-2">
              {rows.map((model, index) => (
                <div key={getModelId(model)} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-slate-900 p-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-300/10 text-xs font-semibold text-cyan-100">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{getModelDisplayName(model)}</p>
                    <p className="truncate font-mono text-xs text-slate-500">{getModelId(model)}</p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniCapability({ icon: Icon, title, text }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <Icon size={18} className="text-cyan-700" />
      <p className="mt-3 font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
    </div>
  );
}

function ValueCard({ icon: Icon, title, text }) {
  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-950/[0.07]">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white transition group-hover:bg-cyan-700">
        <Icon size={20} />
      </span>
      <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function CategoryCard({ group }) {
  return (
    <Link
      to={`/models?category=${encodeURIComponent(group.name)}`}
      className="group rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white hover:shadow-lg hover:shadow-cyan-950/5"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-800 shadow-sm transition group-hover:bg-slate-950 group-hover:text-white">
          <Layers3 size={16} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-950">{group.name}</p>
          <p className="text-xs text-slate-500">{group.models.length} models</p>
        </div>
      </div>
    </Link>
  );
}

function UsagePanel({ baseUrl, modelId }) {
  const rows = [
    { label: 'API base', value: baseUrl },
    { label: 'Model id', value: modelId },
    { label: 'Format', value: 'OpenAI-compatible JSON' },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.label} className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
          <p className="text-xs text-slate-400">{row.label}</p>
          <p className="mt-2 truncate font-mono text-sm font-semibold text-white">{row.value}</p>
        </div>
      ))}
    </div>
  );
}

function QuickStep({ title, text }) {
  return (
    <div className="flex gap-3">
      <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-emerald-300" />
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
      </div>
    </div>
  );
}

function PackageCard({ pkg, fmtPlanPrice }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-950/[0.07]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{pkg.name}</h3>
          <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-600">{getPackageDescription(pkg)}</p>
        </div>
        <Sparkles size={18} className="mt-1 flex-shrink-0 text-cyan-700" />
      </div>
      <div className="mt-6 flex items-end gap-2">
        <span className="text-3xl font-semibold text-slate-950">{fmtPlanPrice(pkg.price, pkg.currency)}</span>
        <span className="pb-1 text-sm text-slate-500">/{pkg.billing_interval || 'cycle'}</span>
      </div>
      <Link to="/packages" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 transition hover:text-slate-950">
        View plan <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function getPackageDescription(pkg) {
  const description = String(pkg?.description || '').trim();
  if (!description || /[\u4e00-\u9fff]/.test(description)) {
    return 'Managed credits, billing, and access controls for production usage.';
  }
  return description;
}
