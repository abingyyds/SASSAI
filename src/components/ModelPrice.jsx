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
      <span className="text-sm text-slate-500" title="No official pricing row was returned by the public pricing feed for this model">
        Official pricing unavailable
      </span>
    );
  }

  if (pricing.type === 'per_call') {
    return (
      <span className="font-mono text-sm text-slate-900" title="Official per-call pricing">
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
      <span className="font-mono text-sm text-slate-900" title="Official input and output USD pricing">
        {formatOfficialTokenPair(inputPrice, outputPrice)}
      </span>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-slate-500">Input USD</p>
        <p className="mt-1 font-mono font-semibold text-slate-950">{input}</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-slate-500">Output USD</p>
        <p className="mt-1 font-mono font-semibold text-slate-950">{output}</p>
      </div>
    </div>
  );
}
