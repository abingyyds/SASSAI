const REQUEST_FIELDS = ['call_count', 'calls', 'request_count', 'requests', 'total_requests', 'usage_count'];
const TOKEN_FIELDS = ['token_usage', 'total_tokens', 'tokens_used', 'usage_tokens', 'billable_tokens', 'used_tokens'];
const RATING_FIELDS = ['rating', 'quality_score', 'user_rating', 'stars'];

const normalizeText = (value) => String(value ?? '').trim();
const normalizeLower = (value) => normalizeText(value).toLowerCase();
const uniqueText = (values) => {
  const seen = new Set();
  return values
    .map(normalizeText)
    .filter((value) => {
      const key = value.toLowerCase();
      if (!value || seen.has(key)) return false;
      seen.add(key);
      return true;
  });
};

const primaryModeOrder = ['chat', 'image', 'video', 'audio'];
const textLikeCategories = ['Chat', 'Reasoning', 'Coding', 'Embedding', 'Rerank'];

export const asNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const firstNumber = (item, fields) => {
  for (const field of fields) {
    const value = asNumber(item?.[field]);
    if (value !== null) return value;
  }
  return null;
};

export const extractResponseData = (response) => {
  const payload = response?.data ?? response;
  if (payload && typeof payload === 'object' && 'data' in payload) return payload.data;
  return payload;
};

export const extractCollection = (response, preferredKeys = []) => {
  const data = extractResponseData(response);
  if (Array.isArray(data)) return data;

  const keys = [
    ...preferredKeys,
    'models',
    'providers',
    'items',
    'results',
    'records',
    'list',
    'rows',
    'data',
  ];

  for (const key of keys) {
    const value = data?.[key];
    if (Array.isArray(value)) return value;
  }

  return [];
};

export const hasAnyField = (items, fields) =>
  items.some((item) => fields.some((field) => item?.[field] !== null && item?.[field] !== undefined && item?.[field] !== ''));

export const getChannels = (model) => (Array.isArray(model?.channels) ? model.channels : []);

export const getInputPrice = (item) => firstNumber(item, ['input_price', 'prompt_price', 'site_input_price', 'input']);

export const getOutputPrice = (item) => firstNumber(item, ['output_price', 'completion_price', 'site_output_price', 'output']);

export const getFixedPrice = (item) => firstNumber(item, ['fixed_price', 'price', 'call_price']);

export const getCacheReadPrice = (item) => firstNumber(item, ['cache_read_price', 'cache_read', 'cache_read_price_5m']);

export const getCacheCreationPrice = (item) => firstNumber(item, ['cache_creation_price', 'cache_write_price', 'cache_creation', 'cache_creation_price_5m']);

export const getModelId = (model) =>
  normalizeText(model?.model_name || model?.id || model?.name || model?.display_name || 'model');

export const getEncodedModelId = (modelOrId) => encodeURIComponent(
  typeof modelOrId === 'string' ? modelOrId : getModelId(modelOrId),
);

export const getModelDisplayName = (model) =>
  model?.display_name || model?.name || model?.model_name || `Model ${model?.id || ''}`.trim();

export const getModelRoute = (model) => `/models/${encodeURIComponent(getModelId(model))}`;

export const getProviderFields = (model) => uniqueText([
  model?.vendor_name,
  model?.vendor,
  model?.provider_name,
  model?.provider,
  model?.provider_slug,
  model?.channel_name,
  ...getChannels(model).flatMap((channel) => [
    channel?.provider_name,
    channel?.provider_slug,
    channel?.channel_name,
  ]),
]);

export const getProviderName = (model) => {
  const fields = getProviderFields(model);
  return fields[0] || 'Multi-provider';
};

export const getProviderSlug = (name) =>
  String(name || 'provider').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const isPerCallModel = (model) =>
  Boolean(
    model?.is_per_call ||
    model?.billing_type === 'per_call' ||
    (getFixedPrice(model) !== null && getInputPrice(model) === null && getOutputPrice(model) === null)
  );

export const getModelCategory = (model) => {
  const explicit = model?.category || model?.type || model?.vendor_category || model?.modality || model?.mode;
  const explicitText = normalizeLower(explicit);

  if (/video|text-to-video|image-to-video|i2v|t2v/.test(explicitText)) return 'Video';
  if (/audio|speech|voice|tts|transcription|whisper/.test(explicitText)) return 'Audio';
  if (/image|vision|text-to-image|dall-e|flux|stable|sdxl|midjourney/.test(explicitText)) return 'Image';
  if (/embed|embedding/.test(explicitText)) return 'Embedding';
  if (/rerank|re-rank/.test(explicitText)) return 'Rerank';
  if (/reason|thinking/.test(explicitText)) return 'Reasoning';
  if (/code|coder/.test(explicitText)) return 'Coding';
  if (/chat|text|llm|language|completion/.test(explicitText)) return 'Chat';
  if (explicit) return String(explicit);

  const name = `${model?.model_name || ''} ${model?.display_name || ''}`.toLowerCase();
  if (/video|text-to-video|image-to-video|i2v|t2v|kling|runway|hailuo|luma|sora/.test(name)) return 'Video';
  if (/audio|tts|whisper|speech|voice|transcription/.test(name)) return 'Audio';
  if (/embed|embedding|text-embedding/.test(name)) return 'Embedding';
  if (/rerank|re-rank/.test(name)) return 'Rerank';
  if (/image|vision|dall-e|midjourney|mj-|flux|stable|sdxl/.test(name)) return 'Image';
  if (/reason|thinking|o1|o3|o4|grok|r1/.test(name)) return 'Reasoning';
  if (/code|coder|codex|devstral/.test(name)) return 'Coding';
  return 'Chat';
};

export const getAvailability = (model) => {
  if (model?.enabled === false) {
    return { label: 'Disabled', tone: 'muted', score: 0 };
  }
  const status = String(model?.status || model?.availability || '').toLowerCase();
  if (['healthy', 'online', 'available', 'active', 'enabled', 'ok'].some((word) => status.includes(word))) {
    return { label: 'Online', tone: 'success', score: 3 };
  }
  if (['limited', 'degraded', 'busy', 'partial'].some((word) => status.includes(word))) {
    return { label: 'Limited', tone: 'warning', score: 2 };
  }
  if (status) {
    return { label: model.status || model.availability, tone: 'muted', score: 1 };
  }
  return { label: 'Listed', tone: 'info', score: 1 };
};

export const getModelTags = (model) => {
  const tags = new Set([getModelCategory(model)]);
  const name = `${model?.model_name || ''} ${model?.display_name || ''}`.toLowerCase();
  const input = getInputPrice(model);
  const output = getOutputPrice(model);
  const context = firstNumber(model, ['context_length', 'context_window', 'max_context_tokens', 'max_context', 'max_tokens', 'max_input_tokens']) || 0;

  if (isPerCallModel(model)) tags.add('Per call');
  if (input !== null && input > 0 && input <= 0.0003) tags.add('Low cost');
  if (output !== null && output > 0 && output <= 0.001) tags.add('Fast');
  if (getCacheReadPrice(model) !== null || getCacheCreationPrice(model) !== null) tags.add('Cache');
  if (context >= 100000 || /128k|200k|1m|long/.test(name)) tags.add('Long context');
  if (getChannels(model).length > 1) tags.add('Multi-provider');
  if (/video|text-to-video|image-to-video|sora|kling|runway|luma/.test(name)) tags.add('Video');
  if (/audio|tts|speech|voice|whisper/.test(name)) tags.add('Audio');
  if (/vision|image|dall-e|multimodal|omni/.test(name)) tags.add('Vision');
  if (/code|coder|codex/.test(name)) tags.add('Coding');
  if (/reason|thinking|r1|o1|o3|o4/.test(name)) tags.add('Reasoning');

  return Array.from(tags).slice(0, 5);
};

export const getSupportedModes = (model) => {
  const category = getModelCategory(model);
  const rawValues = [
    category,
    model?.category,
    model?.type,
    model?.modality,
    model?.mode,
    model?.model_name,
    model?.display_name,
    model?.description,
    model?.endpoint,
    model?.api_type,
    ...(Array.isArray(model?.modalities) ? model.modalities : []),
    ...(Array.isArray(model?.capabilities) ? model.capabilities : []),
    ...(Array.isArray(model?.input_modalities) ? model.input_modalities : []),
    ...(Array.isArray(model?.output_modalities) ? model.output_modalities : []),
    ...(Array.isArray(model?.tags) ? model.tags : []),
  ];
  const haystack = rawValues.filter(Boolean).join(' ').toLowerCase();
  const modes = new Set();

  if (textLikeCategories.includes(category) || /chat|text|completion|reason|code|llm|language|message|embedding|rerank/.test(haystack)) {
    modes.add('chat');
  }
  if (category === 'Image' || /image|vision|dall-e|midjourney|flux|stable|sdxl|text-to-image|image-generation/.test(haystack)) {
    modes.add('image');
  }
  if (category === 'Video' || /video|text-to-video|image-to-video|i2v|t2v|sora|kling|runway|luma/.test(haystack)) {
    modes.add('video');
  }
  if (category === 'Audio' || /audio|speech|voice|tts|whisper|transcription|sound/.test(haystack)) {
    modes.add('audio');
  }

  if (modes.size === 0) modes.add('chat');
  return primaryModeOrder.filter((mode) => modes.has(mode));
};

export const getPreferredMode = (model) => {
  const category = getModelCategory(model);
  if (category === 'Image') return 'image';
  if (category === 'Video') return 'video';
  if (category === 'Audio') return 'audio';
  return 'chat';
};

const uniqueByKey = (items, keyFn) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const mergePrice = (values, reducer = Math.min) => {
  const nums = values.map(asNumber).filter((value) => value !== null);
  if (nums.length === 0) return null;
  return reducer(...nums);
};

export const getModelFamilyKey = (model) => {
  const raw = normalizeText(model?.upstream_model || model?.canonical_model_name || model?.model_name || model?.display_name || model?.name || model?.id);
  return normalizeLower(raw);
};

export const mergeModelCatalog = (models = []) => {
  const groups = new Map();

  models.forEach((model) => {
    if (!model || model.enabled === false) return;
    const key = getModelFamilyKey(model) || normalizeLower(getModelId(model));
    if (!groups.has(key)) {
      groups.set(key, {
        ...model,
        model_name: model?.upstream_model || model?.canonical_model_name || model?.model_name || model?.display_name || model?.id,
        display_name: model?.display_name || model?.name || model?.model_name || model?.upstream_model || model?.id,
        description: model?.description || '',
        enabled: model?.enabled !== false,
        sources: [],
        channels: [],
        input_price: asNumber(model?.input_price),
        output_price: asNumber(model?.output_price),
        fixed_price: asNumber(model?.fixed_price),
        cache_read_price: asNumber(model?.cache_read_price),
        cache_creation_price: asNumber(model?.cache_creation_price),
      });
    }

    const group = groups.get(key);
    group.sources.push(model);
    group.enabled = group.enabled || model?.enabled !== false;
    group.description = [group.description, model?.description].filter(Boolean).sort((a, b) => b.length - a.length)[0] || group.description;
    group.input_price = mergePrice([group.input_price, model?.input_price]);
    group.output_price = mergePrice([group.output_price, model?.output_price]);
    group.fixed_price = mergePrice([group.fixed_price, model?.fixed_price]);
    group.cache_read_price = mergePrice([group.cache_read_price, model?.cache_read_price]);
    group.cache_creation_price = mergePrice([group.cache_creation_price, model?.cache_creation_price]);

    if (!group.display_name || group.display_name === group.model_name) {
      group.display_name = model?.display_name || model?.name || model?.model_name || model?.upstream_model || group.display_name;
    }

    const nextChannels = getChannels(model);
    if (nextChannels.length) {
      group.channels = uniqueByKey([...group.channels, ...nextChannels], (channel) => [channel?.provider_slug, channel?.provider_name, channel?.channel_name, channel?.id].filter(Boolean).join('::').toLowerCase());
    }

    const currentTags = Array.isArray(group.tags) ? group.tags : [];
    const nextTags = Array.isArray(model?.tags) ? model.tags : [];
    group.tags = uniqueText([...currentTags, ...nextTags]);
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    channels: uniqueByKey(group.channels || [], (channel) => [channel?.provider_slug, channel?.provider_name, channel?.channel_name, channel?.id].filter(Boolean).join('::').toLowerCase()),
  }));
};

export const hasUsageMetrics = (models) =>
  models.some((model) =>
    [...REQUEST_FIELDS, ...TOKEN_FIELDS, ...RATING_FIELDS].some((key) => model?.[key] != null)
  );

export const getRequestCount = (model) =>
  firstNumber(model, REQUEST_FIELDS) || 0;

export const getTokenUsage = (model) =>
  firstNumber(model, TOKEN_FIELDS) || 0;

export const getRating = (model) => {
  return firstNumber(model, RATING_FIELDS);
};

export const getPriceValue = (model) => {
  if (isPerCallModel(model)) return getFixedPrice(model) ?? Number.POSITIVE_INFINITY;
  const input = getInputPrice(model);
  const output = getOutputPrice(model);
  if (input !== null && input > 0) return input;
  if (output !== null && output > 0) return output;
  return Number.POSITIVE_INFINITY;
};

export const getMarketplaceScore = (model) => {
  const availability = getAvailability(model).score * 1000;
  const channelScore = Array.isArray(model?.channels) ? Math.min(model.channels.length, 10) * 25 : 0;
  const price = getPriceValue(model);
  const priceScore = Number.isFinite(price) ? Math.max(0, 500 - price * 100000) : 0;
  return availability + channelScore + priceScore;
};

export const sortModels = (models, sortKey = 'popular') => {
  const list = [...models];
  return list.sort((a, b) => {
    if (sortKey === 'price') return getPriceValue(a) - getPriceValue(b);
    if (sortKey === 'availability') return getAvailability(b).score - getAvailability(a).score;
    if (sortKey === 'name') return getModelDisplayName(a).localeCompare(getModelDisplayName(b));
    if (sortKey === 'requests') return getRequestCount(b) - getRequestCount(a);
    if (sortKey === 'tokens') return getTokenUsage(b) - getTokenUsage(a);
    if (sortKey === 'rating') return (getRating(b) || 0) - (getRating(a) || 0);
    const usageDelta = getRequestCount(b) - getRequestCount(a) || getTokenUsage(b) - getTokenUsage(a);
    if (usageDelta) return usageDelta;
    return getMarketplaceScore(b) - getMarketplaceScore(a) || getModelDisplayName(a).localeCompare(getModelDisplayName(b));
  });
};

export const matchesProvider = (model, provider) => {
  if (!provider) return true;
  const target = provider.toLowerCase();
  const names = getProviderFields(model).map((value) => String(value).toLowerCase());
  return names.some((name) => name === target || getProviderSlug(name) === getProviderSlug(target));
};

export const filterModels = (models, { search = '', provider = '', category = '', status = '' } = {}) => {
  const query = search.trim().toLowerCase();
  return models.filter((model) => {
    if (model.enabled === false) return false;
    if (provider && !matchesProvider(model, provider)) return false;
    if (category && getModelCategory(model).toLowerCase() !== category.toLowerCase()) return false;
    if (status && getAvailability(model).label.toLowerCase() !== status.toLowerCase()) return false;
    if (!query) return true;
    const haystack = [
      model.id,
      model.name,
      model.model_name,
      model.display_name,
      model.description,
      model.vendor_name,
      model.vendor,
      model.provider_name,
      model.provider,
      getModelCategory(model),
      ...getProviderFields(model),
      ...getChannels(model).flatMap((channel) => [channel.provider_name, channel.provider_slug, channel.channel_name, channel.provider_description]),
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(query);
  });
};

export const getProviderGroups = (models) => {
  const groups = new Map();

  models.filter((model) => model.enabled !== false).forEach((model) => {
    const names = getProviderFields(model);
    if (names.length === 0) names.push('Multi-provider');

    names.forEach((name) => {
      const key = getProviderSlug(name);
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          name,
          models: [],
          channels: [],
        });
      }
      const group = groups.get(key);
      if (!group.models.some((item) => getModelId(item) === getModelId(model))) {
        group.models.push(model);
      }
      if (getChannels(model).length > 0) {
        group.channels.push(...getChannels(model).filter((channel) =>
          [channel.provider_name, channel.provider_slug].filter(Boolean).some((value) => getProviderSlug(value) === key)
        ));
      }
    });
  });

  return Array.from(groups.values()).sort((a, b) => b.models.length - a.models.length || a.name.localeCompare(b.name));
};

export const formatTokenPrice = (price, symbol = '$', rate = 1, decimals = 4) => {
  const value = asNumber(price);
  if (value === null) return '-';
  return `${symbol}${(value * 1000 * rate).toFixed(decimals)}`;
};

export const formatPerCallPrice = (price, symbol = '$', rate = 1) => {
  const value = asNumber(price);
  if (value === null) return '-';
  return `${symbol}${(value * rate).toFixed(value >= 1 ? 2 : 4)}/call`;
};

export const formatCompactNumber = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '0';
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
};

const jsonString = (value) => JSON.stringify(String(value));

export const buildCurlSnippet = ({
  baseUrl,
  apiKey = '$SUBROUTER_API_KEY',
  modelId,
  prompt = 'Explain quantum computing in one paragraph.',
  temperature,
  maxTokens,
}) => {
  const optionalLines = [
    temperature != null ? `    "temperature": ${Number(temperature)},` : '',
    maxTokens != null ? `    "max_tokens": ${Number(maxTokens)},` : '',
  ].filter(Boolean).join('\n');

  return `curl ${baseUrl}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "${modelId}",
${optionalLines ? `${optionalLines}\n` : ''}    "messages": [
      {"role": "user", "content": ${jsonString(prompt)}}
    ]
  }'`;
};

export const buildJsSnippet = ({ baseUrl, apiKey = 'process.env.SUBROUTER_API_KEY', modelId }) => `const response = await fetch("${baseUrl}/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${${apiKey}}\`
  },
  body: JSON.stringify({
    model: "${modelId}",
    messages: [{ role: "user", content: "Hello from SubRouter" }]
  })
});

const data = await response.json();
console.log(data.choices?.[0]?.message?.content);`;

export const buildPythonSnippet = ({ baseUrl, apiKey = 'os.environ["SUBROUTER_API_KEY"]', modelId }) => `import os
from openai import OpenAI

client = OpenAI(
    api_key=${apiKey},
    base_url="${baseUrl}"
)

response = client.chat.completions.create(
    model="${modelId}",
    messages=[{"role": "user", "content": "Hello from SubRouter"}]
)

print(response.choices[0].message.content)`;
