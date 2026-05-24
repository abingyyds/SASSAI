import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound, Layers3, Play, Server } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import CopyButton from '../components/CopyButton';
import ModelBadges from '../components/ModelBadges';
import ModelPrice from '../components/ModelPrice';
import {
  getPublicModelCatalog,
  readPublicModelCatalog,
  SUBROUTER_API_BASE_URL,
} from '../utils/publicCatalog';
import {
  buildCurlSnippet,
  buildJsSnippet,
  buildPythonSnippet,
  firstNumber,
  formatCompactNumber,
  formatOfficialPerCall,
  formatOfficialTokenPrice,
  getModelCategory,
  getModelDisplayName,
  getModelId,
  getModelIntro,
  getModelSummary,
  getOfficialPricing,
  getPreferredMode,
  getSupportedModes,
} from '../utils/modelMeta';
import { useAuth } from '../context/AuthContext';

export default function ModelDetail() {
  const { modelId } = useParams();
  const { user } = useAuth();
  const cachedCatalog = useMemo(() => readPublicModelCatalog(), []);
  const [models, setModels] = useState(() => cachedCatalog?.models || []);
  const [loading, setLoading] = useState(() => !cachedCatalog);
  const decodedId = decodeURIComponent(modelId || '');
  const baseUrl = SUBROUTER_API_BASE_URL;

  useEffect(() => {
    let cancelled = false;
    if (!cachedCatalog) setLoading(true);

    getPublicModelCatalog()
      .then((catalog) => {
        if (!cancelled) setModels(catalog.models);
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cachedCatalog]);

  const model = useMemo(() => models.find((item) => (
    [getModelId(item), item.model_name, item.display_name, String(item.id || '')].filter(Boolean).includes(decodedId)
  )), [models, decodedId]);

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
  const officialPricing = getOfficialPricing(model);
  const preferredMode = getPreferredMode(model);
  const supportedModes = getSupportedModes(model);
  const contextTokens = firstNumber(model, ['context_length', 'context_window', 'max_context_tokens', 'max_context', 'max_tokens', 'max_input_tokens']);
  const useCases = getUseCases(model);
  const capabilities = [
    { label: 'Modes', value: supportedModes.map((mode) => mode.toUpperCase()).join(', ') },
    { label: 'Context', value: contextTokens ? `${formatCompactNumber(contextTokens)} tokens` : 'Catalog default' },
    { label: 'Billing', value: officialPricing?.type === 'per_call' ? 'Per request' : officialPricing?.type === 'token' ? 'Token USD' : 'Unavailable' },
    { label: 'API base', value: baseUrl },
  ];

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
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{getModelSummary(model)}</p>
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
              <h2 className="text-sm font-semibold text-slate-950">Pricing and API</h2>
              <div className="mt-3"><ModelPrice model={model} /></div>
              <dl className="mt-4 space-y-3 text-sm">
                <MetaRow label="Base URL" value={baseUrl} copy />
                <MetaRow label="Model ID" value={id} copy />
              </dl>
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                Use the API subdomain for requests. The main website domain with a /v1 path is not a valid API base.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <InfoPanel title="About" icon={Layers3}>
              <p className="text-sm leading-6 text-slate-600">{getModelIntro(model)}</p>
            </InfoPanel>

            <InfoPanel title="Best for" icon={CheckCircle2}>
              <ul className="space-y-2 text-sm leading-6 text-slate-600">
                {useCases.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 size={16} className="mt-1 flex-shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </InfoPanel>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <InfoPanel title="Capabilities" icon={Server}>
              <div className="grid gap-3 sm:grid-cols-2">
                {capabilities.map((item) => (
                  <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">{item.label}</p>
                    <p className="mt-2 break-words text-sm font-semibold text-slate-950">{item.value}</p>
                  </div>
                ))}
              </div>
            </InfoPanel>

            <InfoPanel title="Try in Playground" icon={Play}>
              <p className="text-sm leading-6 text-slate-600">
                Open the playground with this model preselected, or copy the model id and call it from the API base URL.
              </p>
              <div className="mt-5 grid gap-2">
                <Link to={`/playground?model=${encodeURIComponent(id)}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                  <Play size={15} />
                  Playground
                </Link>
                <Link to="/docs/quickstart" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  API quickstart
                </Link>
              </div>
            </InfoPanel>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Server size={18} className="text-slate-500" />
              <h2 className="text-xl font-semibold text-slate-950">API usage</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use the OpenAI-compatible chat completions shape with this model id, your SubRouter API key, and the API subdomain base URL.
            </p>
            <div className="mt-5 grid gap-5">
              <CodeBlock title="curl" language="bash" code={buildCurlSnippet({ baseUrl, modelId: id })} />
              <CodeBlock title="JavaScript fetch" language="js" code={buildJsSnippet({ baseUrl, modelId: id })} />
              <CodeBlock title="Python OpenAI SDK" language="python" code={buildPythonSnippet({ baseUrl, modelId: id })} />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Price table</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Public prices come from the official pricing feed. Token models show the USD input and output values returned by the feed.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="px-3 py-3 font-medium">Billing</th>
                    <th className="px-3 py-3 text-right font-medium">Input USD</th>
                    <th className="px-3 py-3 text-right font-medium">Output USD</th>
                    <th className="px-3 py-3 text-right font-medium">Per call</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-3 font-medium text-slate-950">
                      {officialPricing?.type === 'per_call' ? 'Per call' : officialPricing?.type === 'token' ? 'Token USD' : 'Unavailable'}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">
                      {officialPricing?.type === 'token' ? formatOfficialTokenPrice(officialPricing.inputPrice ?? officialPricing.inputRatio) : '-'}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">
                      {officialPricing?.type === 'token' ? formatOfficialTokenPrice(officialPricing.outputPrice ?? officialPricing.outputRatio) : '-'}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">
                      {officialPricing?.type === 'per_call' ? formatOfficialPerCall(officialPricing.modelPrice) : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoPanel({ title, icon: Icon, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={18} className="text-slate-500" />
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
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

function getUseCases(model) {
  const category = getModelCategory(model);
  const name = `${getModelId(model)} ${getModelDisplayName(model)}`.toLowerCase();

  if (category === 'Image') {
    return ['Image prompts, visual iteration, and design asset workflows.', 'Vision tasks that need image-aware model input or output.', 'Creative prototyping where visual quality matters.'];
  }
  if (category === 'Video') {
    return ['Video generation or analysis prompts.', 'Storyboard, scene, and motion-oriented creative workflows.', 'Experiments that need video-first model output.'];
  }
  if (category === 'Audio') {
    return ['Speech, voice, transcription, or audio understanding tasks.', 'Voice-enabled app experiences and media workflows.', 'Audio processing pipelines using API requests.'];
  }
  if (category === 'Embedding') {
    return ['Semantic search and retrieval indexes.', 'Document similarity, clustering, and recommendations.', 'RAG pipelines that need vector representations.'];
  }
  if (category === 'Rerank') {
    return ['Reordering search or RAG candidates by relevance.', 'Improving retrieval quality after an initial vector or keyword search.', 'Ranking passages before sending context to a chat model.'];
  }
  if (category === 'Coding' || /code|coder|codex|devstral/.test(name)) {
    return ['Software implementation, debugging, and refactoring.', 'Code explanation, test generation, and review assistance.', 'Developer agents that need reliable tool-facing text output.'];
  }
  if (category === 'Reasoning' || /reason|thinking|r1|o1|o3|o4/.test(name)) {
    return ['Complex analysis, planning, and multi-step problem solving.', 'Technical question answering and structured evaluations.', 'Workflows where accuracy matters more than the shortest response.'];
  }
  if (/claude|sonnet|opus|haiku/.test(name)) {
    return ['Long-form writing, editing, and transformation.', 'Document analysis and careful instruction following.', 'Assistant workflows that need clear, polished responses.'];
  }
  if (/qwen|qwq|qvq|deepseek|gemini|gpt/.test(name)) {
    return ['General chat, summarization, and drafting.', 'Structured extraction and JSON-style responses.', 'Coding help and technical explanations.'];
  }

  return ['General assistant chat and content generation.', 'Summarization, rewriting, and structured extraction.', 'Application workflows using OpenAI-compatible chat completions.'];
}
