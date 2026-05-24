import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpDown, Boxes, ExternalLink, Search, SlidersHorizontal } from 'lucide-react';
import CopyButton from '../components/CopyButton';
import ModelBadges from '../components/ModelBadges';
import ModelPrice from '../components/ModelPrice';
import { getPublicModelCatalog, readPublicModelCatalog } from '../utils/publicCatalog';
import {
  filterModels,
  formatCompactNumber,
  getModelCategory,
  getModelDisplayName,
  getModelId,
  getModelRoute,
  getModelSummary,
  getSupportedModes,
  sortModels,
} from '../utils/modelMeta';

const primaryCategories = ['Chat', 'Image', 'Audio', 'Video', 'Embedding', 'Rerank'];
const sortOptions = [
  { key: 'popular', label: 'Popular' },
  { key: 'price', label: 'Lowest price' },
  { key: 'name', label: 'Name' },
];

export default function Models() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cachedCatalog = useMemo(() => readPublicModelCatalog(), []);
  const [models, setModels] = useState(() => cachedCatalog?.models || []);
  const [loading, setLoading] = useState(() => !cachedCatalog);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'popular');
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

  useEffect(() => {
    const next = new URLSearchParams();
    if (search) next.set('q', search);
    if (category) next.set('category', category);
    if (sort !== 'popular') next.set('sort', sort);
    setSearchParams(next, { replace: true });
  }, [search, category, sort, setSearchParams]);

  const enabledModels = useMemo(() => models.filter((model) => model.enabled !== false), [models]);
  const categories = useMemo(() => (
    Array.from(new Set([...primaryCategories, ...enabledModels.map(getModelCategory)])).filter(Boolean)
  ), [enabledModels]);
  const modeCount = useMemo(() => new Set(enabledModels.flatMap((model) => getSupportedModes(model))).size, [enabledModels]);

  const filteredModels = useMemo(() => {
    const filtered = filterModels(enabledModels, { search, category });
    return sortModels(filtered, sort);
  }, [enabledModels, search, category, sort]);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
                <Boxes size={15} />
                Public model catalog
              </div>
              <h1 className="text-4xl font-semibold tracking-normal text-slate-950">Models</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Browse the public catalog grouped by model family. Duplicate catalog entries are merged into one visible model entry.
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                Each card can include a short model description, so users can understand what the model is for before opening the detail or playground page.
              </p>
              <div className="mt-5 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                {loading ? 'Loading catalog' : dataSource === 'public' ? 'Live public catalog' : 'Site catalog fallback'}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 lg:min-w-[420px]">
              <Stat label="Models" value={formatCompactNumber(enabledModels.length)} />
              <Stat label="Categories" value={formatCompactNumber(categories.length)} />
              <Stat label="Modes" value={formatCompactNumber(modeCount)} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                placeholder="Search model or capability"
              />
            </label>

            <Select label="Category" value={category} onChange={setCategory}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            <Select label="Sort" value={sort} onChange={setSort} icon={ArrowUpDown}>
              {sortOptions.map((item) => (
                <option key={item.key} value={item.key}>{item.label}</option>
              ))}
            </Select>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory('')}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                category === ''
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  category.toLowerCase() === item.toLowerCase()
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal size={14} />
              {filteredModels.length} of {enabledModels.length} models shown
            </span>
            <span>{category || 'All categories'} · {sort}</span>
          </div>
        </div>

        {loading ? (
          <ModelListSkeleton />
        ) : filteredModels.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-600">
            No models match the current filters.
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                    <th className="px-5 py-3 font-medium">Model</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 text-right font-medium">Price</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModels.map((model) => (
                    <tr key={getModelId(model)} className="border-b border-slate-100 align-top last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <Link to={getModelRoute(model)} className="font-semibold text-slate-950 hover:text-sky-700">
                          {getModelDisplayName(model)}
                        </Link>
                        <div className="mt-1 flex items-center gap-2">
                          <code className="truncate font-mono text-xs text-slate-500">{getModelId(model)}</code>
                          <CopyButton text={getModelId(model)} label="Copy id" iconOnly className="h-7 w-7 px-0 py-0" />
                        </div>
                        <p className="mt-2 line-clamp-2 max-w-2xl text-xs leading-5 text-slate-500">
                          {getModelSummary(model)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{getModelCategory(model)}</td>
                      <td className="px-5 py-4 text-right"><ModelPrice model={model} compact /></td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link to={`/playground?model=${encodeURIComponent(getModelId(model))}`} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                            Try <ExternalLink size={13} />
                          </Link>
                          <Link to={getModelRoute(model)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 lg:hidden">
              {filteredModels.map((model) => (
                <article key={getModelId(model)} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <Link to={getModelRoute(model)} className="font-semibold text-slate-950">
                    {getModelDisplayName(model)}
                  </Link>
                  <p className="mt-1 truncate font-mono text-xs text-slate-500">{getModelId(model)}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{getModelSummary(model)}</p>
                  <div className="mt-3"><ModelBadges model={model} /></div>
                  <div className="mt-4"><ModelPrice model={model} /></div>
                  <div className="mt-4 flex gap-2">
                    <Link to={`/playground?model=${encodeURIComponent(getModelId(model))}`} className="flex-1 rounded-lg bg-slate-950 px-3 py-2 text-center text-xs font-semibold text-white">
                      Try in playground
                    </Link>
                    <Link to={getModelRoute(model)} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700">
                      Details
                    </Link>
                    <CopyButton text={getModelId(model)} iconOnly className="h-9 w-9 px-0 py-0" />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function ModelListSkeleton() {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:block">
        <table className="w-full text-sm">
          <tbody>
            {Array.from({ length: 8 }, (_, index) => (
              <tr key={index} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-4"><div className="h-4 w-64 animate-pulse rounded bg-slate-200" /></td>
                <td className="px-5 py-4"><div className="h-4 w-20 animate-pulse rounded bg-slate-100" /></td>
                <td className="px-5 py-4"><div className="ml-auto h-4 w-24 animate-pulse rounded bg-slate-100" /></td>
                <td className="px-5 py-4"><div className="ml-auto h-4 w-28 animate-pulse rounded bg-slate-100" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 lg:hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="mt-5 h-10 w-full animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Select({ label, value, onChange, children, icon: Icon }) {
  return (
    <label className="min-w-[160px]">
      <span className="sr-only">{label}</span>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white ${Icon ? 'pl-9' : 'pl-3'} pr-8 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100`}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">⌄</span>
      </div>
    </label>
  );
}
