import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, BarChart3, Database, Search, Trophy } from 'lucide-react';
import { getMarketplaceModels, getSiteModels } from '../api';
import ModelPrice from '../components/ModelPrice';
import {
  extractCollection,
  formatCompactNumber,
  getModelCategory,
  getModelDisplayName,
  getModelId,
  getModelRoute,
  mergeModelCatalog,
  sortModels,
} from '../utils/modelMeta';

const sortOptions = [
  { key: 'popular', label: 'Popular' },
  { key: 'price', label: 'Lowest price' },
  { key: 'name', label: 'Name' },
];

export default function Rankings() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('popular');
  const [search, setSearch] = useState('');
  const [dataSource, setDataSource] = useState('marketplace');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getMarketplaceModels({ sort: 'popular', page: 1, page_size: 300 })
      .then((res) => {
        if (cancelled) return;
        setModels(mergeModelCatalog(extractCollection(res, ['models'])));
        setDataSource('marketplace');
      })
      .catch(() => getSiteModels().then((res) => {
        if (cancelled) return;
        setModels(mergeModelCatalog(extractCollection(res, ['models'])));
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
  }, []);

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
                Browse the public model leaderboard without exposing route-level provider details or noisy usage metrics.
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
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2">
              <BarChart3 size={14} />
              {filteredModels.length} models shown
            </span>
            <span>Public model families only</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-600">
            {filteredModels.length} ranked models · {sortOptions.find((item) => item.key === sort)?.label || 'Popular'}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-left text-slate-500">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Model</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 text-right font-medium">Price</th>
                  <th className="px-5 py-3 text-right font-medium">Try</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((model, index) => (
                  <tr key={getModelId(model)} className="border-b border-slate-100 align-middle last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-4 font-mono text-slate-500">{index + 1}</td>
                    <td className="px-5 py-4">
                      <Link to={getModelRoute(model)} className="font-semibold text-slate-950 hover:text-sky-700">
                        {getModelDisplayName(model)}
                      </Link>
                      <p className="mt-1 truncate font-mono text-xs text-slate-500">{getModelId(model)}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{getModelCategory(model)}</td>
                    <td className="px-5 py-4 text-right"><ModelPrice model={model} compact /></td>
                    <td className="px-5 py-4 text-right">
                      <Link to={`/playground?model=${encodeURIComponent(getModelId(model))}`} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                        Try
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
