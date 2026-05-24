import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, BookOpen, CreditCard, KeyRound, Layers3, RefreshCw, Server, ShieldAlert, TerminalSquare } from 'lucide-react';
import { getMarketplaceModels, getSiteModels } from '../api';
import CodeBlock from '../components/CodeBlock';
import CopyButton from '../components/CopyButton';
import {
  buildCurlSnippet,
  buildJsSnippet,
  buildPythonSnippet,
  extractCollection,
  getModelCategory,
  getModelId,
  getSupportedModes,
  sortModels,
} from '../utils/modelMeta';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'api-key', label: 'Get API key' },
  { id: 'base-url', label: 'Base URL' },
  { id: 'chat', label: 'Chat completions' },
  { id: 'image', label: 'Image generation' },
  { id: 'video', label: 'Video generation' },
  { id: 'audio', label: 'Audio' },
  { id: 'models', label: 'Models' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'errors', label: 'Errors' },
  { id: 'migration', label: 'Migration' },
];

export default function DocsQuickstart() {
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/v1` : '/v1';

  useEffect(() => {
    let cancelled = false;

    getMarketplaceModels({ sort: 'popular', page: 1, page_size: 100 })
      .then((res) => {
        if (cancelled) return;
        setModels(sortModels(extractCollection(res, ['models']).filter((model) => model.enabled !== false), 'popular'));
      })
      .catch(() => getSiteModels().then((res) => {
        if (cancelled) return;
        setModels(sortModels(extractCollection(res, ['models']).filter((model) => model.enabled !== false), 'popular'));
      }))
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const picked = useMemo(() => pickDocsModels(models), [models]);
  const chatModelId = getModelId(picked.chat || models[0] || { model_name: 'gpt-4o-mini' });
  const imageModelId = getModelId(picked.image || picked.chat || { model_name: 'image-model-id' });
  const videoModelId = getModelId(picked.video || picked.chat || { model_name: 'video-model-id' });
  const audioModelId = getModelId(picked.audio || picked.chat || { model_name: 'audio-model-id' });
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  const envSnippet = `SUBROUTER_API_KEY=sk-your-api-key
SUBROUTER_BASE_URL=${baseUrl}
SUBROUTER_MODEL=${chatModelId}`;

  const openAiSdkJs = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.SUBROUTER_API_KEY,
  baseURL: "${baseUrl}"
});

const completion = await client.chat.completions.create({
  model: "${chatModelId}",
  messages: [{ role: "user", content: "Say hello in one sentence." }]
});

console.log(completion.choices[0].message.content);`;

  const imageBody = {
    model: imageModelId,
    prompt: 'A clean product screenshot of an AI model marketplace dashboard',
    size: '1024x1024',
    n: 1,
  };
  const videoBody = {
    model: videoModelId,
    prompt: 'A short product demo showing a developer testing an AI model',
    aspect_ratio: '16:9',
    duration: 6,
  };
  const audioBody = {
    model: audioModelId,
    input: 'SubRouter routes requests to compatible AI models through one API key.',
    voice: 'alloy',
    response_format: 'mp3',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
              <BookOpen size={15} />
              Documentation
            </div>
            <h1 className="text-4xl font-semibold tracking-normal text-slate-950">SubRouter API quickstart</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Use a SubRouter API key with the same-origin /v1 base URL, choose a marketplace model id, and send OpenAI-compatible requests where the selected model supports that modality.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to={user ? '/tokens' : '/register'} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                <KeyRound size={16} />
                {user ? 'Open API keys' : 'Create account'}
              </Link>
              <Link to="/models" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Explore models
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2">
              <Server size={17} className="text-slate-500" />
              <h2 className="font-semibold text-slate-950">Endpoint</h2>
            </div>
            <div className="mt-4 space-y-3">
              <CopyRow label="Base URL" value={baseUrl} />
              <CopyRow label="Chat" value={`${baseUrl}/chat/completions`} />
              <CopyRow label="Model id" value={chatModelId} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              {navItems.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950">
                  {item.label}
                </a>
              ))}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-950">Current example model</p>
              <p className="mt-2 truncate font-mono text-xs text-slate-500">{chatModelId}</p>
              <div className="mt-3 flex gap-2">
                <Link to={`/playground?model=${encodeURIComponent(chatModelId)}`} className="flex-1 rounded-lg bg-slate-950 px-3 py-2 text-center text-xs font-semibold text-white">
                  Playground
                </Link>
                <CopyButton text={chatModelId} iconOnly className="h-9 w-9 px-0 py-0" />
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <DocCard id="api-key" icon={KeyRound} title="Get API key">
              <p className="text-sm leading-6 text-slate-600">
                Create an account, open API Keys, and generate a key. Send it as a bearer token on every /v1 request.
              </p>
              <CodeBlock title="Environment" language="bash" code={envSnippet} />
            </DocCard>

            <DocCard id="base-url" icon={Server} title="Base URL">
              <p className="text-sm leading-6 text-slate-600">
                Use this site origin plus /v1. The frontend avoids hardcoded SubRouter hosts so the same docs work on subrouter.com, subrouter.ai, or a custom distributor domain.
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <CopyRow label="API key" value="sk-your-api-key" />
                <CopyRow label="Base URL" value={baseUrl} />
                <CopyRow label="API root" value={`${appOrigin}/v1`} />
              </div>
            </DocCard>

            <DocCard id="chat" icon={TerminalSquare} title="Chat completions">
              <p className="text-sm leading-6 text-slate-600">
                Chat uses the OpenAI-compatible chat completions shape. Replace the model id with any compatible model from the marketplace.
              </p>
              <div className="grid gap-5">
                <CodeBlock title="cURL" language="bash" code={buildCurlSnippet({ baseUrl, modelId: chatModelId })} />
                <CodeBlock title="JavaScript fetch" language="js" code={buildJsSnippet({ baseUrl, modelId: chatModelId })} />
                <CodeBlock title="OpenAI JavaScript SDK" language="js" code={openAiSdkJs} />
                <CodeBlock title="Python OpenAI SDK" language="python" code={buildPythonSnippet({ baseUrl, modelId: chatModelId })} />
              </div>
            </DocCard>

            <DocCard id="image" icon={Layers3} title="Image generation">
              <p className="text-sm leading-6 text-slate-600">
                For image-capable models, use an OpenAI-compatible image generation request when the selected route supports it. The example is a request shape, not a browser-side generation call.
              </p>
              <CodeBlock title="Image request" language="bash" code={jsonCurl(`${baseUrl}/images/generations`, imageBody)} />
            </DocCard>

            <DocCard id="video" icon={Layers3} title="Video generation">
              <p className="text-sm leading-6 text-slate-600">
                Video routes are model and provider dependent. Use the marketplace model details and provider documentation before relying on a video endpoint. This snippet shows a common JSON request builder shape for a video-capable model.
              </p>
              <CodeBlock title="Video request shape" language="bash" code={jsonCurl(`${baseUrl}/videos/generations`, videoBody)} />
            </DocCard>

            <DocCard id="audio" icon={Layers3} title="Audio, TTS, and transcription">
              <p className="text-sm leading-6 text-slate-600">
                Text-to-speech models commonly use JSON input. Transcription models usually require multipart file upload. Use these only with audio-capable models.
              </p>
              <div className="grid gap-5">
                <CodeBlock title="Text to speech request" language="bash" code={jsonCurl(`${baseUrl}/audio/speech`, audioBody)} />
                <CodeBlock
                  title="Transcription request shape"
                  language="bash"
                  code={`curl -X POST ${baseUrl}/audio/transcriptions \\
  -H "Authorization: Bearer $SUBROUTER_API_KEY" \\
  -F "model=${audioModelId}" \\
  -F "file=@sample.mp3"`}
                />
              </div>
            </DocCard>

            <DocCard id="models" icon={Layers3} title="Model IDs and marketplace">
              <p className="text-sm leading-6 text-slate-600">
                Model IDs are copied from the marketplace and used exactly in API requests. The public marketplace endpoints are same-origin for frontend use.
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <LinkCard to="/models" title="Models" text="Filter by chat, image, audio, video, embedding, and rerank." />
                <LinkCard to="/providers" title="Providers" text="Review provider availability, ratings, and links." />
                <LinkCard to="/rankings" title="Rankings" text="Sort by marketplace order and exposed metrics." />
              </div>
              <CodeBlock
                title="Marketplace endpoints"
                language="bash"
                code={`GET /api/marketplace/models?sort=popular&page=1&page_size=100
GET /api/marketplace/providers?page=1&page_size=100`}
              />
            </DocCard>

            <DocCard id="pricing" icon={CreditCard} title="Pricing and cache pricing">
              <p className="text-sm leading-6 text-slate-600">
                Model cards show input and output prices per 1M tokens when token pricing is available. Per-call models show a call price. Cache read and cache creation prices are shown on model details when the catalog exposes them.
              </p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Always check the selected model details before production rollout because prices and provider route availability can differ by model and channel.
              </div>
            </DocCard>

            <DocCard id="errors" icon={ShieldAlert} title="Errors and troubleshooting">
              <div className="grid gap-3 md:grid-cols-2">
                <Trouble title="401 Unauthorized" text="Check that Authorization is Bearer sk-your-api-key and the key belongs to this site." />
                <Trouble title="404 model not found" text="Copy the model id from /models or /rankings and keep provider prefixes intact." />
                <Trouble title="429 rate limited" text="Reduce concurrency or check account limits and package quota." />
                <Trouble title="402 or quota errors" text="Top up, subscribe, or use a model with lower per-token cost." />
                <Trouble title="Unsupported modality" text="Switch to a model whose category includes image, video, or audio." />
                <Trouble title="Provider failure" text="Retry, select another route/model, or inspect logs in your dashboard." />
              </div>
            </DocCard>

            <DocCard id="migration" icon={RefreshCw} title="Migrating from OpenAI or OpenRouter">
              <p className="text-sm leading-6 text-slate-600">
                Keep the OpenAI SDK shape for chat. Change the base URL to this site, replace the API key, and use a SubRouter marketplace model id. OpenRouter-specific optional headers are not required unless your own app depends on them.
              </p>
              <CodeBlock
                title="Before and after"
                language="bash"
                code={`# OpenAI or OpenRouter client
baseURL=https://api.openai.com/v1

# SubRouter client on this site
baseURL=${baseUrl}
apiKey=$SUBROUTER_API_KEY
model=${chatModelId}`}
              />
            </DocCard>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
              <AlertCircle size={17} className="mr-2 inline-block align-[-3px]" />
              Browser pages in this frontend compose requests but do not run generation without an API key. Use the playground to prepare payloads, then run them from your server, terminal, or trusted client.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CopyRow({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-slate-800">{value}</code>
        <CopyButton text={String(value)} iconOnly className="h-8 w-8 px-0 py-0" />
      </div>
    </div>
  );
}

function DocCard({ id, icon: Icon, title, children }) {
  return (
    <section id={id} className="scroll-mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={18} className="text-slate-500" />
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function LinkCard({ to, title, text }) {
  return (
    <Link to={to} className="block rounded-lg border border-slate-200 bg-slate-50 p-4 hover:bg-white">
      <p className="font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </Link>
  );
}

function Trouble({ title, text }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function pickDocsModels(models) {
  const byMode = { chat: null, image: null, video: null, audio: null };
  for (const model of models) {
    const modes = getSupportedModes(model);
    if (!byMode.chat && (modes.includes('chat') || ['Chat', 'Reasoning', 'Coding'].includes(getModelCategory(model)))) byMode.chat = model;
    if (!byMode.image && modes.includes('image')) byMode.image = model;
    if (!byMode.video && modes.includes('video')) byMode.video = model;
    if (!byMode.audio && modes.includes('audio')) byMode.audio = model;
  }
  return byMode;
}

function jsonCurl(endpoint, body) {
  return `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $SUBROUTER_API_KEY" \\
  -d '${JSON.stringify(body, null, 2).replace(/'/g, "'\"'\"'")}'`;
}
