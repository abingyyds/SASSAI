import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, BarChart3, Database, Search, Trophy } from 'lucide-react';
import ModelPrice from '../components/ModelPrice';
import { getPublicModelCatalog, readPublicModelCatalog } from '../utils/publicCatalog';
import {
  formatUsageValue,
  getModelCategory,
  getModelDisplayName,
  getModelId,
  getModelRoute,
  sortModels,
} from '../utils/modelMeta';

const sortOptions = [
  { key: 'popular', label: 'Popular' },
  { key: 'price', label: 'Lowest price' },
  { key: 'name', label: 'Name' },
];

export default function Rankings() {
  const cachedCatalog = useMemo(() => readPublicModelCatalog(), []);
  const [models, setModels] = useState(() => cachedCatalog?.models || []);
  const [loading, setLoading] = useState(() => !cachedCatalog);
  const [sort, setSort] = useState('popular');
  const [search, setSearch] = useState('');
  const [dataSource, setDataSource] = useState(() => cachedCatalog?.dataSource || 'public');

  useEffect(() => {
    let cancelled = false;
    if (!cachedCatalog) setLoading(true);

    getPublicModelCatalog()
      .then((catalog) => {
        if (cancelled) return;
        setModels(catalog.models);
        setDataSource(catalog.dataSource);
      })
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
  }, [cachedCatalog]);

  const enabledModels = useMemo(() => models.filter((model) => model.enabled !== false), [models]);
  const filteredModels = useMemo(() => {
    const query = search.trim().toLowerCase();
    const base = query
      ? enabledModels.filter((model) => [
        getModelDisplayName(model),
        getModelId(model),
        getModelCategory(model),
        model.description,
      ].filter(Boolean).join(' ').toLowerCase().includes(query))
      : enabledModels;
    return sortModels(base, sort).slice(0, 100);
  }, [enabledModels, search, sort]);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
                <Trophy size={15} />
                Model rankings
              </div>
              <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">Rankings</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Browse the public model leaderboard by family, category, usage, and price.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                <Database size={13} />
                {loading ? 'Loading catalog' : dataSource === 'public' ? 'Live public catalog' : 'Site catalog fallback'}
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
              {sortOptions.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSort(item.key)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    sort === item.key
                      ? 'bg-slate-950 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <label className="relative w-full lg:w-auto lg:min-w-[220px]">
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
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2">
              <BarChart3 size={14} />
              {filteredModels.length} models shown
            </span>
            <span>Public model families only</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:px-5">
            {loading ? 'Loading ranked models' : `${filteredModels.length} ranked models · ${sortOptions.find((item) => item.key === sort)?.label || 'Popular'}`}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-left text-slate-500">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Model</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 text-right font-medium">Usage</th>
                  <th className="px-5 py-3 text-right font-medium">Price</th>
                </tr>
              </thead>
              {loading ? (
                <RankingSkeletonRows />
              ) : (
                <tbody>
                  {filteredModels.map((model, index) => (
                    <tr key={getModelId(model)} className="border-b border-slate-100 align-middle last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-4 font-mono text-slate-500">{index + 1}</td>
                      <td className="px-5 py-4">
                        <Link to={getModelRoute(model)} className="font-semibold text-slate-950 hover:text-sky-700">
                          {getModelDisplayName(model)}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{getModelCategory(model)}</td>
                      <td className="px-5 py-4 text-right font-mono text-slate-700">{formatUsageValue(model)}</td>
                      <td className="px-5 py-4 text-right"><ModelPrice model={model} compact /></td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
          <div className="divide-y divide-slate-100 md:hidden">
            {loading ? (
              Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="p-4">
                  <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100" />
                </div>
              ))
            ) : (
              filteredModels.map((model, index) => (
                <Link key={getModelId(model)} to={getModelRoute(model)} className="block p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">#{index + 1}</span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {getModelCategory(model)}
                        </span>
                      </div>
                      <p className="mt-2 font-semibold text-slate-950">{getModelDisplayName(model)}</p>
                      <p className="mt-1 break-all font-mono text-xs text-slate-500">{getModelId(model)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-xs text-slate-700">{formatUsageValue(model)}</p>
                      <div className="mt-2"><ModelPrice model={model} compact /></div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function RankingSkeletonRows() {
  return (
    <tbody>
      {Array.from({ length: 10 }, (_, index) => (
        <tr key={index} className="border-b border-slate-100 last:border-0">
          <td className="px-5 py-4"><div className="h-4 w-6 animate-pulse rounded bg-slate-100" /></td>
          <td className="px-5 py-4"><div className="h-4 w-56 animate-pulse rounded bg-slate-200" /></td>
          <td className="px-5 py-4"><div className="h-4 w-20 animate-pulse rounded bg-slate-100" /></td>
          <td className="px-5 py-4"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-slate-100" /></td>
          <td className="px-5 py-4"><div className="ml-auto h-4 w-24 animate-pulse rounded bg-slate-100" /></td>
        </tr>
      ))}
    </tbody>
  );
}
