import React from 'react';
import { useCurrency } from '../context/SiteContext';
import {
  formatPerCallPrice,
  formatTokenPrice,
  getFixedPrice,
  getInputPrice,
  getOutputPrice,
  isPerCallModel,
} from '../utils/modelMeta';

export default function ModelPrice({ model, compact = false }) {
  const { symbol, rate } = useCurrency();

  if (isPerCallModel(model)) {
    return (
      <span className="font-mono text-sm text-slate-900">
        {formatPerCallPrice(getFixedPrice(model), symbol, rate)}
      </span>
    );
  }

  const input = formatTokenPrice(getInputPrice(model), symbol, rate);
  const output = formatTokenPrice(getOutputPrice(model), symbol, rate);

  if (compact) {
    return (
      <span className="font-mono text-sm text-slate-900">
        {input} <span className="text-slate-400">/</span> {output}
      </span>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-slate-500">Input / 1M</p>
        <p className="mt-1 font-mono font-semibold text-slate-950">{input}</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-slate-500">Output / 1M</p>
        <p className="mt-1 font-mono font-semibold text-slate-950">{output}</p>
      </div>
    </div>
  );
}
