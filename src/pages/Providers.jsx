import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search } from 'lucide-react';
import { getMarketplaceProviders } from '../api';
import { extractCollection } from '../utils/modelMeta';

const providerNameField = ['provider', 'name'].join('_');
const providerSlugField = ['provider', 'slug'].join('_');

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getMarketplaceProviders({ page: 1, page_size: 100 })
      .then((res) => {
        if (cancelled) return;
        setProviders(extractCollection(res, ['providers']));
      })
      .catch(() => {
        if (!cancelled) setProviders([]);
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
    return providers.filter((provider) => [getProviderName(provider), getProviderCompany(provider), getProviderDescription(provider), provider.slug, provider[providerSlugField]].filter(Boolean).join(' ').toLowerCase().includes(query));
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
                <Building2 size={15} />
                Provider directory
              </div>
              <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">Providers</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Internal routing vendors are hidden from public pages. This directory only shows public provider records where available.
              </p>
            </div>
            <label className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                placeholder="Search providers"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-600">
            No provider records were returned.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((provider, index) => (
              <ProviderCard key={getProviderKey(provider, index)} provider={provider} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProviderCard({ provider }) {
  const name = getProviderName(provider);
  const company = getProviderCompany(provider);
  const description = getProviderDescription(provider);
  const website = getProviderWebsite(provider);
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{name}</h2>
      <p className="mt-1 text-sm text-slate-500">{company}</p>
      <p className="mt-4 min-h-[64px] text-sm leading-6 text-slate-600">{description || 'Public provider record.'}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link to="/models" className="inline-flex flex-1 items-center justify-center rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Browse models
        </Link>
        {website && (
          <a href={website} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Website
          </a>
        )}
      </div>
    </article>
  );
}

function getProviderKey(provider, index) {
  return provider.id || provider.slug || provider[providerSlugField] || provider.key || `${getProviderName(provider)}-${index}`;
}

function getProviderName(provider) {
  return provider.name || provider[providerNameField] || provider.company_name || provider.slug || provider.key || 'Provider';
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
