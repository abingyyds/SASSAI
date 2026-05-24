import React from 'react';
import { Link } from 'react-router-dom';
import { Braces, Code2, Download, PlugZap, TerminalSquare } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { PUBLIC_API_BASE_URL } from '../constants/api';

const apps = [
  {
    title: 'OpenAI SDKs',
    desc: 'Use the official JavaScript and Python SDKs with a custom base URL.',
    icon: Code2,
    action: '/docs/quickstart',
  },
  {
    title: 'Cursor and IDE tools',
    desc: 'Configure the OpenAI-compatible API key, base URL, and model id in supported editor clients.',
    icon: TerminalSquare,
    action: '/tokens',
  },
  {
    title: 'OpenAI-compatible apps',
    desc: 'Any client that lets you set base URL and model id can target the same gateway.',
    icon: PlugZap,
    action: '/models',
  },
  {
    title: 'Config exports',
    desc: 'Signed-in users can generate ready-to-import client snippets from the API Keys page.',
    icon: Download,
    action: '/tokens',
  },
];

export default function Apps() {
  const baseUrl = PUBLIC_API_BASE_URL;
  const config = `API Key: sk-your-api-key
Base URL: ${baseUrl}
Model: choose from /models`;

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
              <PlugZap size={15} />
              Integrations
            </div>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">Apps and SDKs</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Connect SDKs and clients that support OpenAI-compatible chat completions. Use your API key, the platform base URL, and any listed model id.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {apps.map(({ title, desc, icon: Icon, action }) => (
            <Link key={title} to={action} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 hover:bg-slate-50">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
                <Icon size={18} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
            </Link>
          ))}
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Braces size={17} className="text-slate-500" />
              <h2 className="font-semibold text-slate-950">Universal settings</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              These values work for clients that expose OpenAI-compatible configuration fields. Use the API subdomain, not the main website domain with a /v1 path.
            </p>
          </div>
          <CodeBlock title="Client values" language="text" code={config} />
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">Next steps</h2>
            <div className="mt-4 flex flex-col gap-2">
              <Link to="/tokens" className="rounded-lg bg-slate-950 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-800">
                Create API key
              </Link>
              <Link to="/docs/quickstart" className="rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Read quickstart
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
