import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ExternalLink, Search } from 'lucide-react';
import { getMarketplaceProviders } from '../api';
import {
  CossCard,
  CossCardFrame,
  CossEmptyState,
  CossIconTile,
  CossPage,
  CossPageHeader,
  CossSearchInput,
  CossSection,
} from '../components/public/CossLayout';
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
    return providers.filter((provider) => [
      getProviderName(provider),
      getProviderCompany(provider),
      getProviderDescription(provider),
      provider.slug,
      provider[providerSlugField],
    ].filter(Boolean).join(' ').toLowerCase().includes(query));
  }, [providers, search]);

  return (
    <CossPage>
      <CossPageHeader
        eyebrow="Public directory"
        icon={Building2}
        title="Providers"
        description="Browse public provider records where they are available. The model catalog remains the primary place to choose what your app uses."
        secondary="Provider records are informational; API requests should use public model ids from the model catalog."
        actions={(
          <CossSearchInput
            aria-label="Search providers"
            icon={Search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search providers"
          />
        )}
      />

      <CossSection>
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <CossCard key={index} className="p-5">
                <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-3 w-24 animate-pulse rounded bg-slate-100" />
                <div className="mt-6 h-16 w-full animate-pulse rounded bg-slate-100" />
              </CossCard>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <CossEmptyState
            title="No provider records"
            text="No public provider records matched the current search."
            action={<Link to="/models" className="coss-button-primary">Browse models</Link>}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((provider, index) => (
              <ProviderCard key={getProviderKey(provider, index)} provider={provider} />
            ))}
          </div>
        )}
      </CossSection>
    </CossPage>
  );
}

function ProviderCard({ provider }) {
  const name = getProviderName(provider);
  const company = getProviderCompany(provider);
  const description = getProviderDescription(provider);
  const website = getProviderWebsite(provider);
  const logo = getProviderLogo(provider);

  return (
    <CossCardFrame as="article" className="flex flex-col p-5">
      <div className="flex items-start gap-3">
        {logo ? (
          <img src={logo} alt="" className="h-10 w-10 rounded-lg border border-slate-200 object-cover" />
        ) : (
          <CossIconTile icon={Building2} />
        )}
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-slate-950">{name}</h2>
          <p className="mt-1 truncate text-sm text-slate-500">{company}</p>
        </div>
      </div>
      <p className="mt-4 min-h-[72px] flex-1 text-sm leading-6 text-slate-600">
        {description || 'Public provider record.'}
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link to="/models" className="coss-button-primary flex-1">
          Browse models
        </Link>
        {website && (
          <a href={website} target="_blank" rel="noreferrer" className="coss-button-secondary">
            Website
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </CossCardFrame>
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
  return provider.logo_url || provider.logo || provider.icon_url || provider.avatar_url;
}

function getProviderDescription(provider) {
  return provider.description || provider.summary || provider.about || '';
}

function getProviderWebsite(provider) {
  return provider.website || provider.website_url || provider.homepage || provider.url || '';
}
