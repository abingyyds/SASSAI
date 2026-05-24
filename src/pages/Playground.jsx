import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bot,
  Code2,
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
  getPublicModelCatalog,
  readPublicModelCatalog,
  SUBROUTER_API_BASE_URL,
} from '../utils/publicCatalog';
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
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
                <MessageSquareText size={15} />
                Playground
              </div>
              <h1 className="text-3xl font-semibold tracking-normal text-slate-950">Test requests</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Compose chat, image, video, or audio requests for the selected model and copy them to run with an API key.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/docs/quickstart" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                View docs
              </Link>
              <Link to="/tokens" className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                <KeyRound size={16} />
                API keys
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Model</span>
                  <select
                    value={modelId}
                    onChange={(event) => {
                      setSelectedId(event.target.value);
                      setModeTouched(false);
                      setPrepared(false);
                    }}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  >
                    {models.map((model) => (
                      <option key={getModelId(model)} value={getModelId(model)}>
                        {getModelDisplayName(model)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={showAllModes}
                    onChange={(event) => setShowAllModes(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-slate-950"
                  />
                  Show all builders
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {visibleModes.map((mode) => {
                  const Icon = mode.icon;
                  const supported = mode.key === 'chat' || supportedModes.includes(mode.key);
                  return (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => selectMode(mode.key)}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                        activeMode === mode.key
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                      }`}
                    >
                      <Icon size={16} />
                      {mode.label}
                      {!supported && <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">manual</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid min-h-[600px] grid-rows-[1fr_auto]">
              <div className="space-y-5 overflow-auto p-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
                    <Bot size={17} />
                  </div>
                  <div className="max-w-3xl rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    <p className="font-semibold text-slate-950">Request builder mode</p>
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

              <div className="border-t border-slate-200 bg-white p-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">{activeMode === 'audio' ? 'Input text' : 'Prompt'}</span>
                  <textarea
                    value={prompt}
                    onChange={(event) => updatePrompt(event.target.value)}
                    className="mt-2 min-h-[128px] w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    placeholder="Enter a prompt"
                  />
                </label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-slate-500">{request.endpoint}</p>
                    <p className="mt-1 text-xs text-slate-500">Requires Authorization: Bearer $SUBROUTER_API_KEY</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <CopyButton text={request.curl} label="Copy cURL" />
                    <button
                      type="button"
                      disabled={!runAvailable}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 disabled:cursor-not-allowed"
                      title="Use API key / copy request"
                    >
                      <PlayCircle size={15} />
                      Run in browser
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrepared(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                      disabled={!prompt.trim()}
                    >
                      <Send size={15} />
                      Compose preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          {selectedModel && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-slate-950">{getModelDisplayName(selectedModel)}</h2>
                  <p className="mt-1 truncate font-mono text-xs text-slate-500">{modelId}</p>
                </div>
              </div>
              <div className="mb-4 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{getModelCategory(selectedModel)}</span>
                {supportedModes.map((mode) => (
                  <span key={mode} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">{mode}</span>
                ))}
              </div>
              <ModelPrice model={selectedModel} />
              <div className="mt-4 flex gap-2">
                <Link to={getModelRoute(selectedModel)} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Details
                </Link>
                <CopyButton text={modelId} label="Copy id" className="flex-1" />
              </div>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Settings2 size={17} className="text-slate-500" />
              <h2 className="font-semibold text-slate-950">Request settings</h2>
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
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                <SlidersHorizontal size={14} className="mr-1 inline-block align-[-2px]" />
                Settings are included in generated request bodies only. Copy the request and run it with your own key.
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-3">
              <div className="flex flex-wrap gap-2">
                {['curl', 'javascript', 'python'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setCodeTab(tab)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                      codeTab === tab
                        ? 'bg-slate-950 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab === 'curl' ? 'cURL' : tab === 'javascript' ? 'JavaScript' : 'Python'}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3">
              <CodeBlock
                title={`${activeDefinition.label} request`}
                language={codeTab}
                code={request[codeTab]}
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Code2 size={17} className="text-slate-500" />
              <h2 className="font-semibold text-slate-950">JSON body</h2>
            </div>
            <pre className="mt-4 max-h-[320px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              <code>{JSON.stringify(request.body, null, 2)}</code>
            </pre>
          </div>
        </aside>
      </section>
    </div>
  );
}

function PreviewPanel({ mode, prompt, prepared, endpoint, icon: Icon }) {
  if (mode === 'chat') {
    return (
      <>
        {prepared && (
          <div className="flex justify-end">
            <div className="max-w-2xl rounded-lg bg-slate-950 p-4 text-sm leading-6 text-white">
              <p className="font-semibold">User</p>
              <p className="mt-2 text-slate-200">{prompt}</p>
            </div>
          </div>
        )}
        {prepared && (
          <div className="flex gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Bot size={17} />
            </div>
            <div className="max-w-3xl rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
              The chat request is composed for <span className="font-mono text-slate-950">{endpoint}</span>. No assistant answer is fabricated in the browser preview.
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
          <Icon size={19} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-950">{modeLabel(mode)} request preview</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {prepared ? prompt : 'Compose a prompt to preview the request body. Generation results are not simulated here.'}
          </p>
          <p className="mt-3 font-mono text-xs text-slate-500">{endpoint}</p>
        </div>
      </div>
    </div>
  );
}

function Control({ label, value, children }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-mono text-slate-500">{value}</span>
      </div>
      {children}
    </label>
  );
}

function SelectControl({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
