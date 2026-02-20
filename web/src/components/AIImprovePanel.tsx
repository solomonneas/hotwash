/**
 * AIImprovePanel — Slide-out panel showing AI improvement suggestions for a playbook.
 */

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../api/client';

interface Suggestion {
  type: string;
  target_phase?: string;
  description: string;
  suggested_content: string;
  priority: 'high' | 'medium' | 'low';
}

interface AIImprovePanelProps {
  playbookId: string;
  playbookTitle: string;
  onClose: () => void;
}

const PRIORITY_COLORS = {
  high: { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-300' },
  medium: { bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-300' },
  low: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-300' },
};

const TYPE_LABELS: Record<string, string> = {
  missing_phase: 'Missing Phase',
  weak_decision: 'Weak Decision',
  missing_evidence: 'Missing Evidence',
  missing_communication: 'Missing Communication',
  nist_gap: 'NIST Gap',
};

const AIImprovePanel: React.FC<AIImprovePanelProps> = ({ playbookId, playbookTitle, onClose }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/ai/improve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playbook_id: playbookId }),
    })
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(data => setSuggestions(data.suggestions || []))
      .catch(e => setError(e.message || 'Failed to get suggestions'))
      .finally(() => setLoading(false));
  }, [playbookId]);

  const activeSuggestions = suggestions.filter((_, i) => !dismissed.has(i));
  const counts = { high: 0, medium: 0, low: 0 };
  activeSuggestions.forEach(s => counts[s.priority]++);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-700 overflow-y-auto shadow-2xl animate-slideIn"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-5 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">🤖 AI Suggestions</h2>
            <button className="text-slate-400 hover:text-slate-200 text-xl" onClick={onClose}>×</button>
          </div>
          <p className="text-sm text-slate-400 mt-1 truncate">for: {playbookTitle}</p>

          {!loading && activeSuggestions.length > 0 && (
            <div className="mt-3 flex gap-3 text-xs">
              <span className="text-slate-400">{activeSuggestions.length} suggestions:</span>
              {counts.high > 0 && <span className="text-red-300">{counts.high} high</span>}
              {counts.medium > 0 && <span className="text-orange-300">{counts.medium} medium</span>}
              {counts.low > 0 && <span className="text-blue-300">{counts.low} low</span>}
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          {loading && (
            <div className="flex items-center gap-3 text-sm text-slate-400 py-10 justify-center">
              <span className="inline-block w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              Analyzing playbook...
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && activeSuggestions.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm">
              {suggestions.length > 0 ? 'All suggestions dismissed!' : 'No suggestions — this playbook looks solid! 🎉'}
            </div>
          )}

          {activeSuggestions.map((s) => {
            const origIdx = suggestions.indexOf(s);
            const pc = PRIORITY_COLORS[s.priority];
            return (
              <div key={origIdx} className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${pc.bg} ${pc.border} ${pc.text} border`}>
                    {s.priority}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide bg-slate-800 text-slate-400 border border-slate-700">
                    {TYPE_LABELS[s.type] || s.type}
                  </span>
                  {s.target_phase && (
                    <span className="text-[10px] text-slate-500">→ {s.target_phase}</span>
                  )}
                </div>
                <p className="text-sm text-slate-200 mb-3">{s.description}</p>
                {s.suggested_content && (
                  <pre className="rounded-md bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-300 whitespace-pre-wrap mb-3 max-h-40 overflow-y-auto font-mono">
                    {s.suggested_content}
                  </pre>
                )}
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded-md bg-green-600/20 border border-green-500/30 text-xs text-green-300 hover:bg-green-600/30">
                    ✓ Accept
                  </button>
                  <button
                    className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:bg-slate-700"
                    onClick={() => setDismissed(prev => new Set(prev).add(origIdx))}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default AIImprovePanel;
