import React from 'react';
import CopyButton from './CopyButton';

export default function CodeBlock({ title, language, code, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-sm ${className}`}>
      {(title || language) && (
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
          <div className="min-w-0">
            {title && <p className="truncate text-sm font-semibold text-white">{title}</p>}
            {language && <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-400">{language}</p>}
          </div>
          <CopyButton
            text={code}
            className="border-white/10 bg-white/10 text-slate-100 hover:bg-white/15 hover:text-white"
          />
        </div>
      )}
      <pre className="max-h-[520px] overflow-auto p-4 text-xs leading-6 text-slate-100 sm:text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}
