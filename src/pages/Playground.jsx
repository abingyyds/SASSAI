import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bot,
  Code2,
  FileJson,
  Image as ImageIcon,
  KeyRound,
  MessageSquareText,
  Mic,
  PlayCircle,
  Send,
  Settings2,
  SlidersHorizontal,
  Video,
} from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import CopyButton from '../components/CopyButton';
import ModelPrice from '../components/ModelPrice';
import {
  ConsoleBadge,
  ConsoleField,
  ConsoleFrame,
  ConsoleHero,
  ConsolePage,
  ConsoleStat,
} from '../components/ConsoleSurface';
import {
  getPublicModelCatalog,
  readPublicModelCatalog,
  SUBROUTER_API_BASE_URL,
} from '../utils/publicCatalog';
import { INVALID_WEBSITE_API_BASE_URL } from '../constants/api';
import {
  getModelCategory,
  getModelDisplayName,
  getModelId,
  getModelRoute,
  getPreferredMode,
  getSupportedModes,
} from '../utils/modelMeta';

const modeDefinitions = [
  { key: 'chat', label: 'Chat/Text', icon: MessageSquareText, endpoint: 'chat/completions' },
  { key: 'image', label: 'Image', icon: ImageIcon, endpoint: 'images/generations' },
  { key: 'video', label: 'Video', icon: Video, endpoint: 'videos/generations' },
  { key: 'audio', label: 'Audio', icon: Mic, endpoint: 'audio/speech' },
];

const defaultPrompts = {
  chat: 'Write a concise product launch checklist for an AI API.',
  image: 'A polished dashboard for an AI model marketplace, clean lighting, realistic UI, high detail.',
  video: 'A 6 second product demo shot showing a developer selecting an AI model and sending a request.',
  audio: 'Welcome to SubRouter. Choose a model, copy the request, and run it with your API key.',
};

export default function Playground() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cachedCatalog = useMemo(() => readPublicModelCatalog(), []);
  const [models, setModels] = useState(() => cachedCatalog?.models || []);
  const [loading, setLoading] = useState(() => !cachedCatalog);
  const [selectedId, setSelectedId] = useState(searchParams.get('model') || '');
  const [activeMode, setActiveMode] = useState(searchParams.get('mode') || 'chat');
  const [modeTouched, setModeTouched] = useState(Boolean(searchParams.get('mode')));
  const [showAllModes, setShowAllModes] = useState(false);
  const [prompts, setPrompts] = useState(defaultPrompts);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [imageSize, setImageSize] = useState('1024x1024');
  const [imageCount, setImageCount] = useState(1);
  const [videoAspect, setVideoAspect] = useState('16:9');
  const [videoDuration, setVideoDuration] = useState(6);
  const [voice, setVoice] = useState('alloy');
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [prepared, setPrepared] = useState(false);
  const [codeTab, setCodeTab] = useState('curl');
  const baseUrl = SUBROUTER_API_BASE_URL;

  useEffect(() => {
    let cancelled = false;
    if (!cachedCatalog) setLoading(true);

    getPublicModelCatalog()
      .then((catalog) => {
        if (cancelled) return;
        const list = catalog.models;
        setModels(list);
        setSelectedId((current) => current || (list[0] ? getModelId(list[0]) : ''));
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

  const selectedModel = useMemo(
    () => models.find((model) => getModelId(model) === selectedId) || models[0],
    [models, selectedId],
  );
  const modelId = selectedModel ? getModelId(selectedModel) : selectedId || 'gpt-4o-mini';
  const supportedModes = useMemo(() => (selectedModel ? getSupportedModes(selectedModel) : ['chat']), [selectedModel]);
  const visibleModes = useMemo(() => (
    showAllModes
      ? modeDefinitions
      : modeDefinitions.filter((mode) => mode.key === 'chat' || supportedModes.includes(mode.key))
  ), [showAllModes, supportedModes]);

  useEffect(() => {
    if (!selectedModel || modeTouched) return;
    setActiveMode(getPreferredMode(selectedModel));
  }, [selectedModel, modeTouched]);

  useEffect(() => {
    if (visibleModes.some((mode) => mode.key === activeMode)) return;
    setActiveMode(visibleModes[0]?.key || 'chat');
  }, [activeMode, visibleModes]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (selectedId) next.set('model', selectedId);
    if (activeMode) next.set('mode', activeMode);
    setSearchParams(next, { replace: true });
  }, [selectedId, activeMode, setSearchParams]);

  const prompt = prompts[activeMode] || '';
  const request = useMemo(() => buildRequest({
    mode: activeMode,
    baseUrl,
    modelId,
    prompt,
    temperature,
    maxTokens,
    imageSize,
    imageCount,
    videoAspect,
    videoDuration,
    voice,
    audioFormat,
  }), [activeMode, audioFormat, baseUrl, imageCount, imageSize, maxTokens, modelId, prompt, temperature, videoAspect, videoDuration, voice]);

  const activeDefinition = modeDefinitions.find((mode) => mode.key === activeMode) || modeDefinitions[0];
  const ActiveIcon = activeDefinition.icon;
  const runAvailable = false;

  const updatePrompt = (value) => {
    setPrompts((current) => ({ ...current, [activeMode]: value }));
    setPrepared(false);
  };

  const selectMode = (mode) => {
    setActiveMode(mode);
    setModeTouched(true);
    setPrepared(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
      </div>
    );
  }

  return (
    <ConsolePage className="overflow-x-hidden">
      <ConsoleHero
        eyebrow="Playground"
        title="Playground"
        subtitle="Compose chat, image, video, or audio requests for the selected model and copy them to run with an API key."
        actions={[
          <Link key="docs" to="/docs/quickstart" className="btn-secondary inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 py-2.5 sm:w-auto">
            <Code2 className="h-4 w-4" />
            View docs
          </Link>,
          <Link key="keys" to="/tokens" className="btn-primary inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 py-2.5 sm:w-auto">
            <KeyRound className="h-4 w-4" />
            API keys
          </Link>,
        ]}
        stats={[
          <ConsoleStat key="builder" icon={ActiveIcon} label="Builder" value={activeDefinition.label} helper={request.endpoint.replace(`${baseUrl}/`, '')} tone="cyan" />,
          <ConsoleStat key="catalog" icon={MessageSquareText} label="Catalog models" value={models.length.toLocaleString()} helper="Loaded from public catalog" tone="sky" />,
        ]}
      />

      <section className="mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:gap-6">
        <div className="min-w-0 space-y-4 lg:space-y-5">
          <ConsoleFrame>
            <div className="border-b border-page-divider bg-page-surface/40 p-3 sm:p-4">
              <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <ConsoleField label="Model">
                  <select
                    value={modelId}
                    onChange={(event) => {
                      setSelectedId(event.target.value);
                      setModeTouched(false);
                      setPrepared(false);
                    }}
                    className="input h-11 min-w-0 touch-manipulation"
                  >
                    {models.map((model) => (
                      <option key={getModelId(model)} value={getModelId(model)}>
                        {getModelDisplayName(model)}
                      </option>
                    ))}
                  </select>
                </ConsoleField>
                <label className="inline-flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-page-divider bg-white px-3 py-2 text-sm font-semibold text-page-secondary sm:w-auto">
                  <input
                    type="checkbox"
                    checked={showAllModes}
                    onChange={(event) => setShowAllModes(event.target.checked)}
                    className="h-5 w-5 rounded border-page-divider accent-slate-950"
                  />
                  Show all builders
                </label>
              </div>
              <div className="mt-4 flex min-w-0 gap-1 overflow-x-auto rounded-xl border border-page-divider bg-page-surface/50 p-1 [-webkit-overflow-scrolling:touch]">
                {visibleModes.map((mode) => {
                  const Icon = mode.icon;
                  const supported = mode.key === 'chat' || supportedModes.includes(mode.key);
                  return (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => selectMode(mode.key)}
                      className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                        activeMode === mode.key
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-page-divider bg-white text-page-secondary hover:bg-page-surface-hover hover:text-page'
                      }`}
                    >
                      <Icon size={16} />
                      {mode.label}
                      {!supported && <span className="rounded-full bg-page-surface px-1.5 py-0.5 text-[10px] font-semibold text-page-muted">manual</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-rows-[auto_auto] lg:min-h-[600px] lg:grid-rows-[1fr_auto]">
              <div className="space-y-4 overflow-visible p-3 sm:space-y-5 sm:p-5 lg:overflow-auto">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <Bot size={17} />
                  </div>
                  <div className="min-w-0 max-w-3xl rounded-xl border border-page-divider bg-page-surface/50 p-3 text-sm leading-6 text-page-secondary sm:p-4">
                    <p className="font-semibold text-page">Playground mode</p>
                    <p className="mt-1">
                      {getModeDescription(activeMode)} Browser execution is disabled because this frontend does not expose a session-safe inference endpoint. Use an API key and copy a request.
                    </p>
                  </div>
                </div>

                <PreviewPanel
                  mode={activeMode}
                  prompt={prompt}
                  prepared={prepared}
                  endpoint={request.endpoint}
                  icon={ActiveIcon}
                />
              </div>

              <div className="border-t border-page-divider bg-white p-3 sm:p-4">
                <ConsoleField label={activeMode === 'audio' ? 'Input text' : 'Prompt'}>
                  <textarea
                    value={prompt}
                    onChange={(event) => updatePrompt(event.target.value)}
                    className="input min-h-[112px] resize-y px-4 py-3 leading-6 lg:min-h-[128px]"
                    placeholder="Enter a prompt"
                  />
                </ConsoleField>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-all font-mono text-xs text-page-muted">{request.endpoint}</p>
                    <p className="mt-1 text-xs text-page-muted">Requires Authorization: Bearer $SUBROUTER_API_KEY</p>
                    <p className="mt-1 text-xs text-amber-700">Use {baseUrl}; {INVALID_WEBSITE_API_BASE_URL} alone is invalid for API calls.</p>
                  </div>
                  <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:flex sm:flex-wrap sm:justify-end">
                    <CopyButton text={request.curl} label="Copy cURL" className="min-h-11 w-full px-4 text-sm sm:w-auto" />
                    <button
                      type="button"
                      disabled={!runAvailable}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-page-divider bg-page-surface px-4 py-2 text-sm font-semibold text-page-muted disabled:cursor-not-allowed sm:w-auto"
                      title="Use API key / copy request"
                    >
                      <PlayCircle size={15} />
                      Run in browser
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrepared(true)}
                      className="btn-primary inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 py-2 disabled:opacity-50 sm:w-auto"
                      disabled={!prompt.trim()}
                    >
                      <Send size={15} />
                      Compose preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ConsoleFrame>
        </div>

        <aside className="min-w-0 space-y-4 lg:space-y-5">
          {selectedModel && (
            <ConsoleFrame className="p-4 sm:p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words font-semibold text-page [overflow-wrap:anywhere]">{getModelDisplayName(selectedModel)}</h2>
                  <p className="mt-1 break-all font-mono text-xs text-page-muted">{modelId}</p>
                </div>
              </div>
              <div className="mb-4 flex flex-wrap gap-1.5">
                <ConsoleBadge tone="slate">{getModelCategory(selectedModel)}</ConsoleBadge>
                {supportedModes.map((mode) => (
                  <ConsoleBadge key={mode} tone="slate">{mode}</ConsoleBadge>
                ))}
              </div>
              <ModelPrice model={selectedModel} />
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link to={getModelRoute(selectedModel)} className="btn-secondary flex-1 px-3 py-2 text-center">
                  Details
                </Link>
                <CopyButton text={modelId} label="Copy id" className="min-h-10 flex-1" />
              </div>
            </ConsoleFrame>
          )}

          <ConsoleFrame className="p-4 sm:p-5">
              <div className="flex min-w-0 items-center gap-2">
                <Settings2 size={17} className="text-page-muted" />
                <h2 className="font-semibold text-page">Request settings</h2>
              </div>
            <div className="mt-5 space-y-5">
              {activeMode === 'chat' && (
                <>
                  <Control label="Temperature" value={temperature}>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(event) => setTemperature(Number(event.target.value))}
                      className="w-full accent-slate-950"
                    />
                  </Control>
                  <Control label="Max tokens" value={maxTokens}>
                    <input
                      type="number"
                      min="1"
                      max="32000"
                      value={maxTokens}
                      onChange={(event) => setMaxTokens(Number(event.target.value))}
                      className="input h-11"
                    />
                  </Control>
                </>
              )}
              {activeMode === 'image' && (
                <>
                  <SelectControl label="Size" value={imageSize} onChange={setImageSize} options={['1024x1024', '1024x1792', '1792x1024']} />
                  <Control label="Images" value={imageCount}>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={imageCount}
                      onChange={(event) => setImageCount(Number(event.target.value))}
                      className="input h-11"
                    />
                  </Control>
                </>
              )}
              {activeMode === 'video' && (
                <>
                  <SelectControl label="Aspect ratio" value={videoAspect} onChange={setVideoAspect} options={['16:9', '9:16', '1:1']} />
                  <Control label="Duration seconds" value={videoDuration}>
                    <input
                      type="number"
                      min="3"
                      max="30"
                      value={videoDuration}
                      onChange={(event) => setVideoDuration(Number(event.target.value))}
                      className="input h-11"
                    />
                  </Control>
                </>
              )}
              {activeMode === 'audio' && (
                <>
                  <SelectControl label="Voice" value={voice} onChange={setVoice} options={['alloy', 'verse', 'nova', 'shimmer']} />
                  <SelectControl label="Format" value={audioFormat} onChange={setAudioFormat} options={['mp3', 'wav', 'opus']} />
                </>
              )}
              <div className="rounded-xl border border-page-divider bg-page-surface/50 p-3 text-xs leading-5 text-page-secondary">
                <SlidersHorizontal size={14} className="mr-1 inline-block align-[-2px]" />
                Settings are included in generated request bodies only. Copy the request and run it with your own key.
              </div>
            </div>
          </ConsoleFrame>

          <ConsoleFrame>
            <div className="border-b border-page-divider p-3">
              <div className="flex min-w-0 flex-wrap gap-2">
                {['curl', 'javascript', 'python'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setCodeTab(tab)}
                    className={`min-h-10 rounded-lg px-3 py-2 text-xs font-semibold ${
                      codeTab === tab
                        ? 'bg-slate-950 text-white'
                        : 'border border-page-divider bg-white text-page-secondary hover:bg-page-surface-hover'
                    }`}
                  >
                    {tab === 'curl' ? 'cURL' : tab === 'javascript' ? 'JavaScript' : 'Python'}
                  </button>
                ))}
              </div>
            </div>
            <div className="min-w-0 p-3">
              <CodeBlock
                title={`${activeDefinition.label} request`}
                language={codeTab}
                code={request[codeTab]}
              />
            </div>
          </ConsoleFrame>

          <ConsoleFrame className="p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <FileJson size={17} className="text-page-muted" />
              <h2 className="font-semibold text-page">JSON body</h2>
            </div>
            <pre className="mt-4 max-h-[260px] max-w-full overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-3 text-[11px] leading-5 text-slate-100 [overflow-wrap:anywhere] sm:max-h-[320px] sm:p-4 sm:text-xs">
              <code className="break-words">{JSON.stringify(request.body, null, 2)}</code>
            </pre>
          </ConsoleFrame>
        </aside>
      </section>
    </ConsolePage>
  );
}

function PreviewPanel({ mode, prompt, prepared, endpoint, icon: Icon }) {
  if (mode === 'chat') {
    return (
      <>
        {prepared && (
          <div className="flex min-w-0 justify-end">
            <div className="min-w-0 max-w-full rounded-xl bg-slate-950 p-3 text-sm leading-6 text-white sm:max-w-2xl sm:p-4">
              <p className="font-semibold">User</p>
              <p className="mt-2 break-words text-slate-200 [overflow-wrap:anywhere]">{prompt}</p>
            </div>
          </div>
        )}
        {prepared && (
          <div className="flex min-w-0 gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-page-divider bg-page-surface text-page-secondary">
              <Bot size={17} />
            </div>
            <div className="min-w-0 max-w-full rounded-xl border border-page-divider bg-white p-3 text-sm leading-6 text-page-secondary sm:max-w-3xl sm:p-4">
              The chat request is composed for <span className="break-all font-mono text-page">{endpoint}</span>. No assistant answer is fabricated in the browser preview.
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-w-0 max-w-full rounded-xl border border-page-divider bg-white p-4 sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
          <Icon size={19} />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold text-page">{modeLabel(mode)} request preview</h2>
          <p className="mt-2 text-sm leading-6 text-page-secondary">
            {prepared ? prompt : 'Compose a prompt to preview the request body. Generation results are not simulated here.'}
          </p>
          <p className="mt-3 break-all font-mono text-xs text-page-muted">{endpoint}</p>
        </div>
      </div>
    </div>
  );
}

function Control({ label, value, children }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-page-label">{label}</span>
        <span className="font-mono text-page-muted">{value}</span>
      </div>
      {children}
    </label>
  );
}

function SelectControl({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-page-label">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input h-11"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function buildRequest({
  mode,
  baseUrl,
  modelId,
  prompt,
  temperature,
  maxTokens,
  imageSize,
  imageCount,
  videoAspect,
  videoDuration,
  voice,
  audioFormat,
}) {
  const definition = modeDefinitions.find((item) => item.key === mode) || modeDefinitions[0];
  const endpoint = `${baseUrl}/${definition.endpoint}`;
  const body = buildBody({
    mode,
    modelId,
    prompt,
    temperature,
    maxTokens,
    imageSize,
    imageCount,
    videoAspect,
    videoDuration,
    voice,
    audioFormat,
  });
  const json = JSON.stringify(body, null, 2);

  return {
    endpoint,
    body,
    curl: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $SUBROUTER_API_KEY" \\
  -d '${shellQuoteJson(json)}'`,
    javascript: `const response = await fetch("${endpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${process.env.SUBROUTER_API_KEY}\`
  },
  body: JSON.stringify(${json})
});

const data = await response.json();
console.log(data);`,
    python: `import os
import requests

response = requests.post(
    "${endpoint}",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {os.environ['SUBROUTER_API_KEY']}",
    },
    json=${toPythonLiteral(body)}
)

print(response.json())`,
  };
}

function buildBody({
  mode,
  modelId,
  prompt,
  temperature,
  maxTokens,
  imageSize,
  imageCount,
  videoAspect,
  videoDuration,
  voice,
  audioFormat,
}) {
  if (mode === 'image') {
    return {
      model: modelId,
      prompt,
      size: imageSize,
      n: Number(imageCount),
      response_format: 'url',
    };
  }
  if (mode === 'video') {
    return {
      model: modelId,
      prompt,
      aspect_ratio: videoAspect,
      duration: Number(videoDuration),
    };
  }
  if (mode === 'audio') {
    return {
      model: modelId,
      input: prompt,
      voice,
      response_format: audioFormat,
    };
  }
  return {
    model: modelId,
    temperature: Number(temperature),
    max_tokens: Number(maxTokens),
    messages: [
      { role: 'user', content: prompt },
    ],
  };
}

function shellQuoteJson(json) {
  return json.replace(/'/g, "'\"'\"'");
}

function toPythonLiteral(value) {
  return JSON.stringify(value, null, 4)
    .replace(/\btrue\b/g, 'True')
    .replace(/\bfalse\b/g, 'False')
    .replace(/\bnull\b/g, 'None');
}

function getModeDescription(mode) {
  if (mode === 'image') return 'Image models use a prompt, output size, and image count in the request body.';
  if (mode === 'video') return 'Video models use a prompt plus duration and aspect ratio when the selected model supports those fields.';
  if (mode === 'audio') return 'Audio mode builds a text-to-speech request body for compatible speech models.';
  return 'Chat/Text mode builds an OpenAI-compatible chat completions request.';
}

function modeLabel(mode) {
  return modeDefinitions.find((item) => item.key === mode)?.label || 'Request';
}
