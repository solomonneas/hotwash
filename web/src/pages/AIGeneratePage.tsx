/**
 * AIGeneratePage — AI-powered playbook generation with ATT&CK technique picker.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useHashRouter } from '../router';
import { API_BASE_URL } from '../api/client';
import AISettingsPanel from '../components/AISettingsPanel';

interface Technique {
  technique_id: string;
  name: string;
  tactic: string;
}

interface GeneratedPlaybook {
  markdown: string;
  graph_json: any;
  title: string;
  category: string;
  tags: string[];
}

const CATEGORIES = [
  { value: 'incident_response', label: 'Incident Response' },
  { value: 'threat_hunting', label: 'Threat Hunting' },
  { value: 'vulnerability_management', label: 'Vulnerability Management' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'custom', label: 'Custom' },
];

const COMPLEXITIES = [
  { value: 'basic', label: 'Basic', desc: '5–8 steps' },
  { value: 'intermediate', label: 'Intermediate', desc: '10–15 steps' },
  { value: 'advanced', label: 'Advanced', desc: '20+ steps' },
];

const QUICK_CARDS = [
  {
    title: 'Ransomware Response',
    description: 'Respond to an active ransomware incident including containment, eradication, and recovery procedures with backup verification.',
    techniques: ['T1486', 'T1490'],
    category: 'incident_response',
    icon: '🔒',
    gradient: 'from-red-500/20 to-orange-500/20',
  },
  {
    title: 'Phishing Investigation',
    description: 'Investigate a phishing campaign targeting employees with malicious attachments and credential-harvesting links.',
    techniques: ['T1566', 'T1059'],
    category: 'incident_response',
    icon: '🎣',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    title: 'Data Breach Response',
    description: 'Respond to confirmed data exfiltration including forensic analysis, containment, notification procedures, and regulatory compliance.',
    techniques: ['T1041', 'T1567'],
    category: 'incident_response',
    icon: '💾',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    title: 'Insider Threat',
    description: 'Investigate suspicious insider activity including unauthorized access, data staging, and potential exfiltration by a trusted employee.',
    techniques: ['T1078', 'T1048'],
    category: 'threat_hunting',
    icon: '👤',
    gradient: 'from-amber-500/20 to-yellow-500/20',
  },
];

const TACTICS = [
  'reconnaissance', 'resource-development', 'initial-access', 'execution',
  'persistence', 'privilege-escalation', 'defense-evasion', 'credential-access',
  'discovery', 'lateral-movement', 'collection', 'command-and-control',
  'exfiltration', 'impact',
];

const AIGeneratePage: React.FC = () => {
  const { navigate } = useHashRouter();
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('incident_response');
  const [complexity, setComplexity] = useState('intermediate');
  const [selectedTechniques, setSelectedTechniques] = useState<Technique[]>([]);
  const [techniqueSearch, setTechniqueSearch] = useState('');
  const [tacticFilter, setTacticFilter] = useState('');
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [techDropdownOpen, setTechDropdownOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedPlaybook | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch techniques
  useEffect(() => {
    const params = new URLSearchParams();
    if (tacticFilter) params.set('tactic', tacticFilter);
    if (techniqueSearch) params.set('search', techniqueSearch);
    fetch(`${API_BASE_URL}/api/attack/techniques?${params}`)
      .then(r => r.ok ? r.json() : [])
      .then(setTechniques)
      .catch(() => setTechniques([]));
  }, [tacticFilter, techniqueSearch]);

  const handleGenerate = useCallback(async (desc?: string, techs?: string[], cat?: string) => {
    const finalDesc = desc ?? description;
    if (!finalDesc.trim()) return;
    setGenerating(true);
    setError(null);
    setResult(null);
    try {
      const body: any = {
        description: finalDesc,
        category: cat ?? category,
        complexity,
        mitre_techniques: techs ?? selectedTechniques.map(t => t.technique_id),
      };
      const res = await fetch(`${API_BASE_URL}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Generation failed (${res.status})`);
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }, [description, category, complexity, selectedTechniques]);

  const handleQuickGenerate = (card: typeof QUICK_CARDS[0]) => {
    setDescription(card.description);
    setCategory(card.category);
    const techs = card.techniques.map(id => ({ technique_id: id, name: id, tactic: '' }));
    setSelectedTechniques(techs);
    handleGenerate(card.description, card.techniques, card.category);
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/playbooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.title,
          category: result.category,
          content_markdown: result.markdown,
          tags: result.tags,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      navigate('#/library');
    } catch {
      setError('Failed to save playbook');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const removeTechnique = (id: string) => {
    setSelectedTechniques(prev => prev.filter(t => t.technique_id !== id));
  };

  const addTechnique = (tech: Technique) => {
    if (!selectedTechniques.find(t => t.technique_id === tech.technique_id)) {
      setSelectedTechniques(prev => [...prev, tech]);
    }
    setTechDropdownOpen(false);
    setTechniqueSearch('');
  };

  const stepCount = result?.markdown ? (result.markdown.match(/^\d+\./gm) || []).length : 0;

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold flex items-center gap-3">
              <span className="text-2xl">✨</span> AI Playbook Generator
            </h1>
            <p className="text-slate-400 text-sm mt-1">Describe a threat scenario and let AI build your playbook.</p>
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-md border border-slate-700 bg-slate-800 text-sm text-slate-200 hover:bg-slate-700"
              onClick={() => setSettingsOpen(true)}
              title="AI Settings"
            >
              ⚙️ Settings
            </button>
            <button
              className="px-4 py-2 rounded-md border border-slate-700 bg-slate-800 text-sm text-slate-200 hover:bg-slate-700"
              onClick={() => navigate('#/library')}
            >
              Back to Library
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 mb-6">
          <textarea
            className="w-full rounded-lg bg-slate-950 border border-slate-700 px-5 py-4 text-sm text-slate-100 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-slate-500 resize-y"
            placeholder="A sophisticated phishing campaign targeting executives with fake DocuSign emails containing credential-harvesting links"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            {/* Category */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Category</label>
              <select
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-200"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Complexity */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Complexity</label>
              <div className="flex gap-2">
                {COMPLEXITIES.map(c => (
                  <button
                    key={c.value}
                    className={`flex-1 px-3 py-2 rounded-md text-xs border transition ${
                      complexity === c.value
                        ? 'bg-purple-600/30 border-purple-500/50 text-purple-200'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                    onClick={() => setComplexity(c.value)}
                  >
                    <div className="font-medium">{c.label}</div>
                    <div className="text-[10px] opacity-70">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ATT&CK Technique Picker */}
          <div className="mt-4">
            <label className="text-xs text-slate-400 mb-1 block">MITRE ATT&CK Techniques</label>
            <div className="flex gap-2 mb-2">
              <select
                className="rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-300"
                value={tacticFilter}
                onChange={e => setTacticFilter(e.target.value)}
              >
                <option value="">All Tactics</option>
                {TACTICS.map(t => (
                  <option key={t} value={t}>{t.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
              <div className="relative flex-1">
                <input
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-200 placeholder-slate-500"
                  placeholder="Search techniques (e.g. T1566, Phishing)..."
                  value={techniqueSearch}
                  onChange={e => { setTechniqueSearch(e.target.value); setTechDropdownOpen(true); }}
                  onFocus={() => setTechDropdownOpen(true)}
                />
                {techDropdownOpen && techniques.length > 0 && (
                  <div className="absolute z-30 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-slate-700 bg-slate-900 shadow-xl">
                    {techniques.slice(0, 20).map(t => (
                      <button
                        key={t.technique_id}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex justify-between"
                        onClick={() => addTechnique(t)}
                      >
                        <span className="text-red-300 font-mono">{t.technique_id}</span>
                        <span className="text-slate-300 truncate ml-2">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {selectedTechniques.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTechniques.map(t => (
                  <span
                    key={t.technique_id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/15 border border-red-500/30 text-red-200"
                  >
                    {t.technique_id}
                    <button className="hover:text-red-400 ml-1" onClick={() => removeTechnique(t.technique_id)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            className="mt-6 w-full py-3 rounded-lg font-semibold text-white text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
            onClick={() => handleGenerate()}
            disabled={generating || !description.trim()}
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating playbook...
              </span>
            ) : (
              '✨ Generate Playbook'
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 mb-6">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-xl border border-purple-500/30 bg-slate-900/60 p-6 mb-6 animate-fadeIn">
            {/* Metadata bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-slate-100">{result.title}</h2>
              <span className="px-2 py-1 rounded-full text-xs border border-purple-500/40 bg-purple-500/15 text-purple-200">
                {result.category}
              </span>
              {result.tags?.map(tag => (
                <span key={tag} className="px-2 py-1 rounded-full text-[10px] uppercase tracking-wide bg-slate-800 text-slate-300">
                  {tag}
                </span>
              ))}
              {stepCount > 0 && (
                <span className="text-xs text-slate-400">{stepCount} steps</span>
              )}
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-5 max-h-[500px] overflow-y-auto mb-4">
              <pre className="whitespace-pre-wrap text-sm text-slate-200 font-mono leading-relaxed">
                {result.markdown}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                className="px-4 py-2 rounded-md bg-green-600 text-sm text-white hover:bg-green-500 disabled:opacity-50"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : '💾 Save to Library'}
              </button>
              <button
                className="px-4 py-2 rounded-md border border-slate-700 bg-slate-800 text-sm text-slate-200 hover:bg-slate-700"
                onClick={() => {
                  // Navigate to editor with content in sessionStorage
                  sessionStorage.setItem('ai-generated-markdown', result.markdown);
                  sessionStorage.setItem('ai-generated-title', result.title);
                  sessionStorage.setItem('ai-generated-category', result.category);
                  navigate('#/editor');
                }}
              >
                ✏️ Edit First
              </button>
              <button
                className="px-4 py-2 rounded-md border border-slate-700 bg-slate-800 text-sm text-slate-200 hover:bg-slate-700"
                onClick={() => handleGenerate()}
              >
                🔄 Regenerate
              </button>
              <button
                className="px-4 py-2 rounded-md border border-slate-700 bg-slate-800 text-sm text-slate-200 hover:bg-slate-700"
                onClick={handleCopy}
              >
                {copied ? '✅ Copied!' : '📋 Copy Markdown'}
              </button>
            </div>
          </div>
        )}

        {/* Quick Generate Cards */}
        {!result && !generating && (
          <div>
            <h3 className="text-lg font-medium text-slate-300 mb-4">⚡ Quick Generate</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {QUICK_CARDS.map(card => (
                <button
                  key={card.title}
                  className={`text-left rounded-xl border border-slate-800 bg-gradient-to-br ${card.gradient} p-5 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/10 group`}
                  onClick={() => handleQuickGenerate(card)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{card.icon}</span>
                    <div>
                      <h4 className="font-semibold text-slate-100 group-hover:text-purple-200 transition">{card.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{card.description}</p>
                      <div className="flex gap-2 mt-2">
                        {card.techniques.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/15 text-red-300 border border-red-500/20">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setSettingsOpen(false)}>
          <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <AISettingsPanel onClose={() => setSettingsOpen(false)} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
};

export default AIGeneratePage;
