import React from 'react';
import {
  formatOfficialPerCall,
  formatOfficialTokenPair,
  formatOfficialTokenPrice,
  getOfficialPricing,
} from '../utils/modelMeta';

export default function ModelPrice({ model, compact = false }) {
  const pricing = getOfficialPricing(model);

  if (!pricing) {
    return (
      <span className="text-sm text-page-muted" title="No official pricing row was returned by the public pricing feed for this model">
        Official pricing unavailable
      </span>
    );
  }

  if (pricing.type === 'per_call') {
    return (
      <span className="font-mono text-sm text-page" title="Official per-call pricing">
        {formatOfficialPerCall(pricing.modelPrice)}
      </span>
    );
  }

  const inputPrice = pricing.inputPrice ?? pricing.inputRatio;
  const outputPrice = pricing.outputPrice ?? pricing.outputRatio;
  const input = formatOfficialTokenPrice(inputPrice);
  const output = formatOfficialTokenPrice(outputPrice);

  if (compact) {
    return (
      <span className="font-mono text-sm text-page" title="Official input and output USD pricing">
        {formatOfficialTokenPair(inputPrice, outputPrice)}
      </span>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="rounded-lg border border-page-divider bg-page-surface/50 px-3 py-2">
        <p className="text-page-muted">Input USD</p>
        <p className="mt-1 font-mono font-semibold text-page">{input}</p>
      </div>
      <div className="rounded-lg border border-page-divider bg-page-surface/50 px-3 py-2">
        <p className="text-page-muted">Output USD</p>
        <p className="mt-1 font-mono font-semibold text-page">{output}</p>
      </div>
    </div>
  );
}
