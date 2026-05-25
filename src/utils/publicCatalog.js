import { getMarketplaceModels, getPublicPricing, getSiteModels } from '../api';
import { PUBLIC_API_BASE_URL } from '../constants/api';
import {
  extractCollection,
  extractPricingRows,
  getModelId,
  mergePublicModelCatalog,
  PUBLIC_MODEL_FIELDS,
  sortModels,
} from './modelMeta';

export const SUBROUTER_API_BASE_URL = PUBLIC_API_BASE_URL;

export const PUBLIC_CATALOG_QUERY = Object.freeze({
  sort: 'popular',
  page: 1,
  page_size: 200,
  fields: PUBLIC_MODEL_FIELDS,
});

export const DOCS_CATALOG_FIELDS = [
  'id',
  'name',
  'model_name',
  'display_name',
  'upstream_model',
  'canonical',
  'canonical_model_name',
  'description',
  'summary',
  'category',
  'type',
  'modality',
  'mode',
  'modalities',
  'capabilities',
  'input_modalities',
  'output_modalities',
  'tags',
  'enabled',
  'public_rank',
  'rank',
  'sort_order',
  'position',
  'order',
].join(',');

export const DOCS_CATALOG_QUERY = Object.freeze({
  sort: 'popular',
  page: 1,
  page_size: 40,
  fields: DOCS_CATALOG_FIELDS,
});

const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000;
const catalogCache = new Map();

const stableCacheKey = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map(stableCacheKey).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${key}:${stableCacheKey(value[key])}`).join(',')}}`;
  }
  return String(value);
};

const normalizeCatalog = (catalogResponse, pricingResponse) =>
  sortModels(
    mergePublicModelCatalog(
      extractCollection(catalogResponse, ['models']),
      extractPricingRows(pricingResponse),
    ).filter((model) => model.enabled !== false && getModelId(model)),
    'popular',
  );

const cacheKeyFor = (query) => stableCacheKey(query);

const FALLBACK_MODELS = [
  { id: 'gpt-4o-mini', model_name: 'gpt-4o-mini', display_name: 'GPT-4o Mini', category: 'Chat', enabled: true },
  { id: 'claude-sonnet-4-5', model_name: 'claude-sonnet-4-5', display_name: 'Claude Sonnet 4.5', category: 'Chat', enabled: true },
  { id: 'gemini-2.5-pro', model_name: 'gemini-2.5-pro', display_name: 'Gemini 2.5 Pro', category: 'Multimodal', enabled: true },
  { id: 'deepseek-chat', model_name: 'deepseek-chat', display_name: 'DeepSeek Chat', category: 'Chat', enabled: true },
  { id: 'qwen-max', model_name: 'qwen-max', display_name: 'Qwen Max', category: 'Chat', enabled: true },
  { id: 'grok-4', model_name: 'grok-4', display_name: 'Grok 4', category: 'Chat', enabled: true },
  { id: 'claude-haiku-4-5', model_name: 'claude-haiku-4-5', display_name: 'Claude Haiku 4.5', category: 'Chat', enabled: true },
  { id: 'gpt-5-mini', model_name: 'gpt-5-mini', display_name: 'GPT-5 Mini', category: 'Chat', enabled: true },
];

export const fallbackCatalog = {
  models: FALLBACK_MODELS,
  dataSource: 'fallback',
};

const readCatalogCache = (query) => {
  const cached = catalogCache.get(cacheKeyFor(query));
  if (!cached?.result || cached.expiresAt <= Date.now()) return null;
  return cached.result;
};

const fetchCatalog = async (query) => {
  const pricingPromise = getPublicPricing().catch(() => null);

  try {
    const catalogResponse = await getMarketplaceModels(query);
    const models = normalizeCatalog(catalogResponse, await pricingPromise);
    if (models.length === 0) return fallbackCatalog;
    return {
      models,
      dataSource: 'public',
    };
  } catch (error) {
    try {
      const catalogResponse = await getSiteModels();
      const models = normalizeCatalog(catalogResponse, null);
      if (models.length === 0) return fallbackCatalog;
      return {
        models,
        dataSource: 'fallback',
      };
    } catch (fallbackError) {
      return fallbackCatalog;
    }
  }
};

export const getPublicModelCatalog = (query = PUBLIC_CATALOG_QUERY) => {
  const key = cacheKeyFor(query);
  const cached = catalogCache.get(key);
  if (cached?.result && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.result);
  }
  if (cached?.promise) {
    return cached.promise;
  }

  const promise = fetchCatalog(query)
    .then((result) => {
      catalogCache.set(key, {
        result,
        expiresAt: Date.now() + CATALOG_CACHE_TTL_MS,
      });
      return result;
    })
    .catch((error) => {
      catalogCache.delete(key);
      throw error;
    });

  catalogCache.set(key, { promise });
  return promise;
};

export const readPublicModelCatalog = (query = PUBLIC_CATALOG_QUERY) => readCatalogCache(query) || fallbackCatalog;

export const getDocsModelCatalog = () => getPublicModelCatalog(DOCS_CATALOG_QUERY);

export const readDocsModelCatalog = () => readPublicModelCatalog(DOCS_CATALOG_QUERY);
