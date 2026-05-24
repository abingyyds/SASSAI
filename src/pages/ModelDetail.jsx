import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, KeyRound, Play, Server } from 'lucide-react';
import { getMarketplaceModels, getSiteModels } from '../api';
import CodeBlock from '../components/CodeBlock';
import CopyButton from '../components/CopyButton';
import ModelBadges from '../components/ModelBadges';
import ModelPrice from '../components/ModelPrice';
import {
  buildCurlSnippet,
  buildJsSnippet,
  buildPythonSnippet,
  extractCollection,
  formatPerCallPrice,
  formatTokenPrice,
  getCacheCreationPrice,
  getCacheReadPrice,
  getFixedPrice,
  getInputPrice,
  getModelCategory,
  getModelDisplayName,
  getModelId,
  getModelRoute,
  getOutputPrice,
  getPreferredMode,
  isPerCallModel,
  mergeModelCatalog,
} from '../utils/modelMeta';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/SiteContext';

export default function ModelDetail() {
  const { modelId } = useParams();
  const { user } = useAuth();
  const { symbol, rate } = useCurrency();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const decodedId = decodeURIComponent(modelId || '');
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/v1` : '/v1';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getMarketplaceModels({ sort: 'popular', page: 1, page_size: 300 })
      .then((res) => {
        if (!cancelled) setModels(mergeModelCatalog(extractCollection(res, ['models'])));
      })
      .catch(() => getSiteModels().then((res) => {
        if (!cancelled) setModels(mergeModelCatalog(extractCollection(res, ['models'])));
      }))
      .catch(() => {
        if (!cancelled) setModels([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const model = useMemo(() => models.find((item) => (
    [getModelId(item), item.model_name, item.display_name, String(item.id || '')].filter(Boolean).includes(decodedId)
  )), [models, decodedId]);

  const related = useMemo(() => {
    if (!model) return [];
    const family = getModelCategory(model);
    return models
      .filter((item) => item.enabled !== false && getModelId(item) !== getModelId(model) && getModelCategory(item) === family)
      .slice(0, 4);
  }, [models, model]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-950">Model not found</h1>
          <p className="mt-3 text-slate-600">The model id `{decodedId}` was not returned by the public model catalog.</p>
          <Link to="/models" className="mt-6 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Browse models
          </Link>
        </div>
      </div>
    );
  }

  const modelName = getModelDisplayName(model);
  const id = getModelId(model);
  const channels = [];
  const perCall = isPerCallModel(model);
  const preferredMode = getPreferredMode(model);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link to="/models" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
            <ArrowLeft size={16} />
            Models
          </Link>
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {getModelCategory(model)}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {preferredMode.toUpperCase()}
                </span>
              </div>
              <h1 className="text-4xl font-semibold tracking-normal text-slate-950">{modelName}</h1>
              <div className="mt-4 flex max-w-3xl flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <code className="min-w-0 flex-1 truncate font-mono text-sm text-slate-700">{id}</code>
                <CopyButton text={id} label="Copy model id" />
              </div>
              <div className="mt-5">
                <ModelBadges model={model} limit={6} />
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to={`/playground?model=${encodeURIComponent(id)}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                  <Play size={16} />
                  Open in playground
                </Link>
                <Link to={user ? '/tokens' : '/register'} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <KeyRound size={16} />
                  {user ? 'Go to API keys' : 'Create an account'}
                </Link>
              </div>
            </div>

            <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-sm font-semibold text-slate-950">Pricing</h2>
              <div className="mt-3"><ModelPrice model={model} /></div>
              <dl className="mt-4 space-y-3 text-sm">
                <MetaRow label="Base URL" value={baseUrl} copy />
                <MetaRow label="Display only" value="Single public model card" />
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Server size={18} className="text-slate-500" />
              <h2 className="text-xl font-semibold text-slate-950">API usage</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use the same OpenAI-compatible chat completions shape with this model id and your SubRouter API key.
            </p>
            <div className="mt-5 grid gap-5">
              <CodeBlock
                title="curl"
                language="bash"
                code={buildCurlSnippet({ baseUrl, modelId: id })}
              />
              <CodeBlock
                title="JavaScript fetch"
                language="js"
                code={buildJsSnippet({ baseUrl, modelId: id })}
              />
              <CodeBlock
                title="Python OpenAI SDK"
                language="python"
                code={buildPythonSnippet({ baseUrl, modelId: id })}
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Price table</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="px-3 py-3 font-medium">Type</th>
                    <th className="px-3 py-3 text-right font-medium">Input</th>
                    <th className="px-3 py-3 text-right font-medium">Output</th>
                    <th className="px-3 py-3 text-right font-medium">Cache read</th>
                    <th className="px-3 py-3 text-right font-medium">Cache write</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-3 font-medium text-slate-950">{perCall ? 'Per call' : 'Per 1M tokens'}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">{perCall ? '-' : formatTokenPrice(getInputPrice(model), symbol, rate)}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">{perCall ? formatPerCallPrice(getFixedPrice(model), symbol, rate) : formatTokenPrice(getOutputPrice(model), symbol, rate)}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">{perCall ? '-' : formatTokenPrice(getCacheReadPrice(model), symbol, rate)}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">{perCall ? '-' : formatTokenPrice(getCacheCreationPrice(model), symbol, rate)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          {related.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-950">Related models</h2>
              <div className="mt-4 space-y-3">
                {related.map((item) => (
                  <Link key={getModelId(item)} to={getModelRoute(item)} className="block rounded-lg border border-slate-200 bg-slate-50 p-3 hover:bg-white">
                    <p className="font-medium text-slate-950">{getModelDisplayName(item)}</p>
                    <p className="mt-1 truncate font-mono text-xs text-slate-500">{getModelId(item)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

function MetaRow({ label, value, copy = false }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 flex items-center gap-2 font-mono text-sm text-slate-800">
        <span className="min-w-0 flex-1 truncate">{value}</span>
        {copy && <CopyButton text={String(value)} iconOnly className="h-7 w-7 px-0 py-0" />}
      </dd>
    </div>
  );
}
