import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, BarChart3, Database, Search, Trophy } from 'lucide-react';
import { getMarketplaceModels, getSiteModels } from '../api';
import ModelPrice from '../components/ModelPrice';
import { AvailabilityBadge } from '../components/ModelBadges';
import {
  extractCollection,
  firstNumber,
  formatCompactNumber,
  getAvailability,
  getModelCategory,
  getModelDisplayName,
  getModelId,
  getModelRoute,
  getProviderName,
  getRating,
  hasAnyField,
  sortModels,
} from '../utils/modelMeta';

const sortOptions = [
  { key: 'popular', label: 'Popular' },
  { key: 'tokens', label: 'Tokens' },
  { key: 'probe_score', label: 'Probe score' },
  { key: 'availability', label: 'Availability' },
  { key: 'rating', label: 'Rating' },
];

const periods = [
  { key: '24h', label: '24h' },
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: 'all', label: 'All' },
];

const requestFields = ['call_count', 'calls', 'request_count', 'requests', 'total_requests', 'usage_count'];
const tokenFields = ['token_usage', 'total_tokens', 'tokens_used', 'usage_tokens', 'billable_tokens', 'used_tokens'];
const probeFields = ['probe_score', 'availability_probe_score', 'benchmark_score', 'marketplace_score', 'rank_score', 'score'];
const availabilityFields = ['availability_score', 'uptime', 'uptime_24h', 'uptime_7d', 'uptime_30d'];
const periodRequestFields = {
  '24h': ['call_count_24h', 'calls_24h', 'requests_24h', 'request_count_24h'],
  '7d': ['call_count_7d', 'calls_7d', 'requests_7d', 'request_count_7d', 'call_count_weekly'],
  '30d': ['call_count_30d', 'calls_30d', 'requests_30d', 'request_count_30d', 'call_count_monthly'],
  all: requestFields,
};
const periodTokenFields = {
  '24h': ['token_usage_24h', 'tokens_24h', 'total_tokens_24h'],
  '7d': ['token_usage_7d', 'tokens_7d', 'total_tokens_7d', 'token_usage_weekly'],
  '30d': ['token_usage_30d', 'tokens_30d', 'total_tokens_30d', 'token_usage_monthly'],
  all: tokenFields,
};

export default function Rankings() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('popular');
  const [period, setPeriod] = useState('7d');
  const [search, setSearch] = useState('');
  const [dataSource, setDataSource] = useState('marketplace');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getMarketplaceModels({ sort, period, page: 1, page_size: 100 })
      .then((res) => {
        if (cancelled) return;
        setModels(extractCollection(res, ['models']));
        setDataSource('marketplace');
      })
      .catch(() => getSiteModels().then((res) => {
        if (cancelled) return;
        setModels(extractCollection(res, ['models']));
        setDataSource('fallback');
      }))
      .catch(() => {
        if (!cancelled) {
          setModels([]);
          setDataSource('fallback');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sort, period]);

  const enabledModels = useMemo(() => models.filter((model) => model.enabled !== false), [models]);
  const filteredModels = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return enabledModels;
    return enabledModels.filter((model) => [
      getModelDisplayName(model),
      getModelId(model),
      getProviderName(model),
      getModelCategory(model),
      model.description,
    ].filter(Boolean).join(' ').toLowerCase().includes(query));
  }, [enabledModels, search]);

  const ranked = useMemo(
    () => rankModels(filteredModels, sort, dataSource).slice(0, 100),
    [filteredModels, sort, dataSource],
  );
  const hasPeriodFields = useMemo(
    () => hasAnyField(enabledModels, [...periodRequestFields['24h'], ...periodRequestFields['7d'], ...periodRequestFields['30d'], ...periodTokenFields['24h'], ...periodTokenFields['7d'], ...periodTokenFields['30d']]),
    [enabledModels],
  );

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
                <Trophy size={15} />
                Model rankings
              </div>
              <h1 className="text-4xl font-semibold tracking-normal text-slate-950">Rankings</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Sort models by live marketplace order, token fields, probe score, availability, or rating. Missing usage fields stay blank instead of being inferred.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                <Database size={13} />
                {dataSource === 'marketplace' ? 'Live marketplace data' : 'Site catalog fallback'}
              </div>
            </div>
            <label className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                placeholder="Search rankings"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {periods.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPeriod(item.key)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    period === item.key
                      ? 'bg-slate-950 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <label className="relative min-w-[220px]">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                {sortOptions.map((item) => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">⌄</span>
            </label>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {hasPeriodFields
              ? 'The selected window is used when matching usage fields are present in marketplace data.'
              : 'This response does not expose windowed usage fields; period tabs only affect the marketplace query and blank metrics remain blank.'}
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-600">
            <BarChart3 size={16} className="mr-2 inline-block align-[-3px]" />
            {ranked.length} ranked models · {sortOptions.find((item) => item.key === sort)?.label || 'Popular'} · {period}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-left text-slate-500">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Model</th>
                  <th className="px-5 py-3 font-medium">Provider</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 text-center font-medium">Availability</th>
                  <th className="px-5 py-3 text-right font-medium">Probe</th>
                  <th className="px-5 py-3 text-right font-medium">Calls</th>
                  <th className="px-5 py-3 text-right font-medium">Tokens</th>
                  <th className="px-5 py-3 text-right font-medium">Rating</th>
                  <th className="px-5 py-3 text-right font-medium">Pricing</th>
                  <th className="px-5 py-3 text-right font-medium">Try</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((model, index) => {
                  const rating = getRating(model);
                  return (
                    <tr key={`${getModelId(model)}-${index}`} className="border-b border-slate-100 align-middle last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-4 font-mono text-slate-500">{index + 1}</td>
                      <td className="px-5 py-4">
                        <Link to={getModelRoute(model)} className="font-semibold text-slate-950 hover:text-sky-700">
                          {getModelDisplayName(model)}
                        </Link>
                        <p className="mt-1 truncate font-mono text-xs text-slate-500">{getModelId(model)}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{getProviderName(model)}</td>
                      <td className="px-5 py-4 text-slate-700">{getModelCategory(model)}</td>
                      <td className="px-5 py-4 text-center"><AvailabilityBadge model={model} /></td>
                      <td className="px-5 py-4 text-right font-mono text-slate-700">{formatMetric(firstNumber(model, probeFields))}</td>
                      <td className="px-5 py-4 text-right font-mono text-slate-700">{formatMetric(firstNumber(model, periodRequestFields[period] || requestFields))}</td>
                      <td className="px-5 py-4 text-right font-mono text-slate-700">{formatMetric(firstNumber(model, periodTokenFields[period] || tokenFields))}</td>
                      <td className="px-5 py-4 text-right font-mono text-slate-700">{rating == null ? '-' : rating.toFixed(rating > 10 ? 0 : 1)}</td>
                      <td className="px-5 py-4 text-right"><ModelPrice model={model} compact /></td>
                      <td className="px-5 py-4 text-right">
                        <Link to={`/playground?model=${encodeURIComponent(getModelId(model))}`} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                          Try
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function rankModels(models, sort, dataSource) {
  const list = [...models];

  if (sort === 'tokens' && hasAnyField(list, tokenFields)) {
    return list.sort((a, b) => (firstNumber(b, tokenFields) || 0) - (firstNumber(a, tokenFields) || 0));
  }
  if (sort === 'probe_score' && hasAnyField(list, probeFields)) {
    return list.sort((a, b) => (firstNumber(b, probeFields) || 0) - (firstNumber(a, probeFields) || 0));
  }
  if (sort === 'availability') {
    if (hasAnyField(list, availabilityFields)) {
      return list.sort((a, b) => (firstNumber(b, availabilityFields) || 0) - (firstNumber(a, availabilityFields) || 0));
    }
    return list.sort((a, b) => getAvailability(b).score - getAvailability(a).score);
  }
  if (sort === 'rating' && list.some((model) => getRating(model) != null)) {
    return list.sort((a, b) => (getRating(b) || 0) - (getRating(a) || 0));
  }

  if (dataSource === 'fallback') {
    return sortModels(list, 'popular');
  }
  return list;
}

function formatMetric(value) {
  if (value == null) return '-';
  const number = Number(value);
  if (!Number.isFinite(number)) return '-';
  if (Math.abs(number) > 9999) return formatCompactNumber(number);
  return Number.isInteger(number) ? String(number) : number.toFixed(number >= 100 ? 1 : 2);
}
