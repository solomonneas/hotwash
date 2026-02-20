/**
 * AISettingsPanel — Configure AI provider, model, and connection settings.
 */

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../api/client';

interface AISettingsPanelProps {
  onClose?: () => void;
}

const PROVIDERS = [
  { value: 'ollama', label: 'Ollama (Local)', desc: 'Free, runs locally', defaultModel: 'qwen2.5:14b', defaultUrl: 'http://localhost:11434' },
  { value: 'openai', label: 'OpenAI', desc: 'GPT-4o, cloud API', defaultModel: 'gpt-4o', defaultUrl: 'https://api.openai.com/v1' },
  { value: 'anthropic', label: 'Anthropic', desc: 'Claude, cloud API', defaultModel: 'claude-sonnet-4-20250514', defaultUrl: 'https://api.anthropic.com' },
];

const AISettingsPanel: React.FC<AISettingsPanelProps> = ({ onClose }) => {
  const [provider, setProvider] = useState('ollama');
  const [model, setModel] = useState('qwen2.5:14b');
  const [baseUrl, setBaseUrl] = useState('http://localhost:11434');
  const [apiKey, setApiKey] = useState('');
  const [temperature, setTemperature] = useState(0.3);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/ai/config`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setProvider(data.provider || 'ollama');
          setModel(data.model || 'qwen2.5:14b');
          setBaseUrl(data.base_url || 'http://localhost:11434');
          setTemperature(data.temperature ?? 0.3);
          setHasApiKey(data.has_api_key || false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleProviderChange = (p: string) => {
    setProvider(p);
    const prov = PROVIDERS.find(x => x.value === p);
    if (prov) {
      setModel(prov.defaultModel);
      setBaseUrl(prov.defaultUrl);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const body: any = { provider, model, base_url: baseUrl, temperature };
      if (apiKey) body.api_key = apiKey;
      const res = await fetch(`${API_BASE_URL}/api/ai/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveMsg('Settings saved!');
      setHasApiKey(!!apiKey || hasApiKey);
      setTimeout(() => setSaveMsg(null), 2000);
    } catch {
      setSaveMsg('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'Test connection', complexity: 'basic' }),
      });
      setTestResult(res.ok
        ? { ok: true, msg: 'Connection successful!' }
        : { ok: false, msg: `Error: ${res.status}` }
      );
    } catch (e: any) {
      setTestResult({ ok: false, msg: e.message || 'Connection failed' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <p className="text-sm text-slate-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-slate-100">⚙️ AI Configuration</h2>
        {onClose && (
          <button className="text-slate-400 hover:text-slate-200 text-xl" onClick={onClose}>×</button>
        )}
      </div>

      {/* Provider */}
      <div className="mb-4">
        <label className="text-xs text-slate-400 mb-2 block">Provider</label>
        <div className="flex gap-2">
          {PROVIDERS.map(p => (
            <button
              key={p.value}
              className={`flex-1 px-3 py-2 rounded-md text-xs border transition ${
                provider === p.value
                  ? 'bg-purple-600/30 border-purple-500/50 text-purple-200'
                  : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
              onClick={() => handleProviderChange(p.value)}
            >
              <div className="font-medium">{p.label}</div>
              <div className="text-[10px] opacity-70">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Model */}
      <div className="mb-4">
        <label className="text-xs text-slate-400 mb-1 block">Model</label>
        <input
          className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-200"
          value={model}
          onChange={e => setModel(e.target.value)}
        />
      </div>

      {/* Base URL */}
      <div className="mb-4">
        <label className="text-xs text-slate-400 mb-1 block">Base URL</label>
        <input
          className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-200"
          value={baseUrl}
          onChange={e => setBaseUrl(e.target.value)}
        />
      </div>

      {/* API Key */}
      {provider !== 'ollama' && (
        <div className="mb-4">
          <label className="text-xs text-slate-400 mb-1 block">
            API Key {hasApiKey && <span className="text-green-400">(configured)</span>}
          </label>
          <input
            type="password"
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-200"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder={hasApiKey ? '••••••••' : 'Enter API key'}
          />
        </div>
      )}

      {/* Temperature */}
      <div className="mb-5">
        <label className="text-xs text-slate-400 mb-1 flex justify-between">
          <span>Temperature</span>
          <span className="text-slate-300">{temperature.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min="0" max="1" step="0.1"
          className="w-full accent-purple-500"
          value={temperature}
          onChange={e => setTemperature(parseFloat(e.target.value))}
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>Precise</span><span>Creative</span>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-400 mb-4">
        Current: <span className="text-slate-200">{provider}</span> / <span className="text-slate-200">{model}</span>
        {hasApiKey && provider !== 'ollama' && <span className="text-green-400 ml-2">🔑 Key set</span>}
      </div>

      {/* Test result */}
      {testResult && (
        <div className={`rounded-md px-3 py-2 text-xs mb-4 border ${
          testResult.ok ? 'border-green-500/40 bg-green-500/10 text-green-200' : 'border-red-500/40 bg-red-500/10 text-red-200'
        }`}>
          {testResult.msg}
        </div>
      )}

      {saveMsg && (
        <div className="rounded-md px-3 py-2 text-xs mb-4 border border-blue-500/40 bg-blue-500/10 text-blue-200">
          {saveMsg}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          className="px-4 py-2 rounded-md border border-slate-700 bg-slate-800 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-50"
          onClick={handleTest}
          disabled={testing}
        >
          {testing ? 'Testing...' : '🧪 Test Connection'}
        </button>
        <button
          className="px-4 py-2 rounded-md bg-purple-600 text-sm text-white hover:bg-purple-500 disabled:opacity-50"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save'}
        </button>
      </div>
    </div>
  );
};

export default AISettingsPanel;
