import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, ExternalLink, Globe2, Layers3, Search, Star } from 'lucide-react';
import { getMarketplaceProviders, getSiteModels } from '../api';
import ModelBadges, { AvailabilityBadge } from '../components/ModelBadges';
import ModelPrice from '../components/ModelPrice';
import {
  extractCollection,
  firstNumber,
  formatCompactNumber,
  getAvailability,
  getModelDisplayName,
  getModelId,
  getModelRoute,
  getPriceValue,
  getProviderGroups,
} from '../utils/modelMeta';

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dataSource, setDataSource] = useState('marketplace');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getMarketplaceProviders({ page: 1, page_size: 100 })
      .then((res) => {
        if (cancelled) return;
        setProviders(extractCollection(res, ['providers']));
        setDataSource('marketplace');
      })
      .catch(() => getSiteModels().then((res) => {
        if (cancelled) return;
        setProviders(getProviderGroups(extractCollection(res, ['models'])));
        setDataSource('fallback');
      }))
      .catch(() => {
        if (!cancelled) {
          setProviders([]);
          setDataSource('fallback');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return providers;
    return providers.filter((provider) => {
      const models = Array.isArray(provider.models) ? provider.models : [];
      return [
        getProviderName(provider),
        getProviderCompany(provider),
        getProviderDescription(provider),
        provider.slug,
        provider.provider_slug,
        ...models.flatMap((model) => [getModelDisplayName(model), getModelId(model)]),
      ].filter(Boolean).join(' ').toLowerCase().includes(query);
    });
  }, [providers, search]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
                <Building2 size={15} />
                Provider directory
              </div>
              <h1 className="text-4xl font-semibold tracking-normal text-slate-950">Providers</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Browse the companies and routing providers behind the model marketplace, including availability, ratings, counts, and provider links when exposed.
              </p>
              <div className="mt-5 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                {dataSource === 'marketplace' ? 'Live marketplace data' : 'Site catalog fallback'}
              </div>
            </div>
            <label className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                placeholder="Search providers or models"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-600">
            No providers match the current search.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((provider, index) => (
              <ProviderCard key={getProviderKey(provider, index)} provider={provider} source={dataSource} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProviderCard({ provider, source }) {
  const name = getProviderName(provider);
  const company = getProviderCompany(provider);
  const logo = getProviderLogo(provider);
  const description = getProviderDescription(provider);
  const rating = getProviderRating(provider);
  const modelCount = getProviderModelCount(provider);
  const subscriptionCount = getProviderSubscriptionCount(provider);
  const website = getProviderWebsite(provider);
  const detailsUrl = getProviderDetailsUrl(provider);
  const availability = getProviderAvailability(provider);
  const models = Array.isArray(provider.models) ? provider.models : [];
  const startingModel = [...models].sort((a, b) => getPriceValue(a) - getPriceValue(b))[0];
  const featured = models.slice(0, 3);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {logo ? (
            <img src={logo} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg border border-slate-200 object-cover" loading="lazy" />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Layers3 size={18} />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate text-lg font-semibold text-slate-950">{name}</h2>
              {isVerifiedProvider(provider) && (
                <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 size={12} />
                  Verified
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-sm text-slate-500">{company}</p>
          </div>
        </div>
        <AvailabilityPill availability={availability} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <ProviderStat label="Models" value={modelCount == null ? '-' : formatCompactNumber(modelCount)} />
        <ProviderStat label="Subs" value={subscriptionCount == null ? '-' : formatCompactNumber(subscriptionCount)} />
        <ProviderStat label="Rating" value={rating == null ? '-' : rating.toFixed(rating > 10 ? 0 : 1)} icon={Star} />
      </div>

      <p className="mt-5 min-h-[48px] text-sm leading-6 text-slate-600">
        {description || (source === 'fallback'
          ? 'Derived from the public site model catalog because provider marketplace data was unavailable.'
          : 'No provider description was returned by the marketplace API.')}
      </p>

      {startingModel && (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-slate-500">Starting price</p>
            <AvailabilityBadge model={startingModel} />
          </div>
          <ModelPrice model={startingModel} compact />
        </div>
      )}

      {featured.length > 0 && (
        <div className="mt-5 space-y-3">
          {featured.map((model) => (
            <Link key={getModelId(model)} to={getModelRoute(model)} className="block rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{getModelDisplayName(model)}</p>
                  <p className="mt-1 truncate font-mono text-xs text-slate-500">{getModelId(model)}</p>
                </div>
                <AvailabilityBadge model={model} />
              </div>
              <div className="mt-3">
                <ModelBadges model={model} limit={3} />
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link to={`/models?provider=${encodeURIComponent(name)}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Browse models
          <ArrowRight size={15} />
        </Link>
        {(detailsUrl || website) && (
          <a
            href={detailsUrl || website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {detailsUrl ? 'Details' : 'Website'}
            <ExternalLink size={15} />
          </a>
        )}
        {website && detailsUrl && (
          <a href={website} target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-950" aria-label={`${name} website`}>
            <Globe2 size={16} />
          </a>
        )}
      </div>
    </article>
  );
}

function ProviderStat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="flex items-center gap-1 text-xs text-slate-500">
        {Icon && <Icon size={12} />}
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function AvailabilityPill({ availability }) {
  const classes = availability.score >= 3
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : availability.score === 2
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-slate-200 bg-slate-100 text-slate-600';

  return (
    <span className={`inline-flex flex-shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${classes}`}>
      {availability.label}
    </span>
  );
}

function getProviderKey(provider, index) {
  return provider.id || provider.slug || provider.provider_slug || provider.key || `${getProviderName(provider)}-${index}`;
}

function getProviderName(provider) {
  return provider.name || provider.provider_name || provider.company_name || provider.slug || provider.key || 'Provider';
}

function getProviderCompany(provider) {
  return provider.company_name || provider.company || provider.legal_name || provider.display_name || getProviderName(provider);
}

function getProviderLogo(provider) {
  return provider.logo_url || provider.logo || provider.provider_logo || provider.icon_url || provider.avatar_url;
}

function getProviderDescription(provider) {
  return provider.description || provider.provider_description || provider.summary || provider.about || '';
}

function getProviderWebsite(provider) {
  return provider.website || provider.website_url || provider.provider_website || provider.homepage || provider.url || '';
}

function getProviderDetailsUrl(provider) {
  return provider.details_url || provider.profile_url || provider.marketplace_url || provider.docs_url || '';
}

function getProviderRating(provider) {
  return firstNumber(provider, ['rating', 'quality_score', 'provider_score', 'score']);
}

function getProviderModelCount(provider) {
  return firstNumber(provider, ['model_count', 'models_count', 'available_models', 'model_total']) ?? (Array.isArray(provider.models) ? provider.models.length : null);
}

function getProviderSubscriptionCount(provider) {
  return firstNumber(provider, ['subscription_count', 'subscriptions_count', 'subscriber_count', 'users_count', 'usage_count']);
}

function isVerifiedProvider(provider) {
  return Boolean(provider.verified || provider.is_verified || provider.official || provider.is_official);
}

function getProviderAvailability(provider) {
  const label = provider.availability || provider.status || provider.health || provider.state;
  if (label) return getAvailability({ status: label });
  const uptime = firstNumber(provider, ['availability_score', 'uptime', 'uptime_30d']);
  if (uptime == null) return { label: 'Listed', score: 1 };
  if (uptime >= 99 || uptime > 0.98) return { label: 'Online', score: 3 };
  if (uptime >= 95 || uptime > 0.9) return { label: 'Limited', score: 2 };
  return { label: 'Listed', score: 1 };
}
