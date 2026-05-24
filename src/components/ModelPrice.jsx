import React from 'react';
import {
  formatOfficialPerCall,
  formatOfficialRatio,
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

  const input = formatOfficialRatio(pricing.inputRatio);
  const output = formatOfficialRatio(pricing.outputRatio);

  if (compact) {
    return (
      <span className="font-mono text-sm text-slate-900" title="Official input and output pricing ratios">
        <span className="text-xs text-slate-500">In</span> {input} <span className="text-slate-400">/</span> <span className="text-xs text-slate-500">Out</span> {output} <span className="text-xs text-slate-500">ratio</span>
      </span>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-slate-500">Input ratio</p>
        <p className="mt-1 font-mono font-semibold text-slate-950">{input}</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-slate-500">Output ratio</p>
        <p className="mt-1 font-mono font-semibold text-slate-950">{output}</p>
      </div>
    </div>
  );
}
