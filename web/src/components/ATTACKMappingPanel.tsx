/**
 * ATTACKMappingPanel — View and manage MITRE ATT&CK technique mappings for a playbook.
 */

import React, { useState } from 'react';
import { API_BASE_URL } from '../api/client';

interface Mapping {
  step_text: string;
  technique_id: string;
  technique_name: string;
  tactic: string;
  confidence: number;
}

interface ATTACKMappingPanelProps {
  playbookId: string;
  playbookTitle: string;
  onClose: () => void;
}

const ALL_TACTICS = [
  'Reconnaissance', 'Resource Development', 'Initial Access', 'Execution',
  'Persistence', 'Privilege Escalation', 'Defense Evasion', 'Credential Access',
  'Discovery', 'Lateral Movement', 'Collection', 'Command and Control',
  'Exfiltration', 'Impact',
];

const ATTACKMappingPanel: React.FC<ATTACKMappingPanelProps> = ({ playbookId, playbookTitle, onClose }) => {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [confirmed, setConfirmed] = useState<Set<number>>(new Set());

  const handleAutoMap = async () => {
    setLoading(true);
    setError(null);
    setDismissed(new Set());
    setConfirmed(new Set());
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/map-attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbook_id: playbookId }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setMappings(data.mappings || []);
    } catch (e: any) {
      setError(e.message || 'Mapping failed');
    } finally {
      setLoading(false);
    }
  };

  const activeMappings = mappings.filter((_, i) => !dismissed.has(i));
  const mappedTactics = new Set(activeMappings.map(m => m.tactic));
  const uniqueTechniques = new Set(activeMappings.map(m => m.technique_id));

  const confidenceBarColor = (c: number) => {
    if (c >= 0.8) return 'from-green-600 to-green-400';
    if (c >= 0.5) return 'from-yellow-600 to-yellow-400';
    return 'from-red-600 to-red-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-2xl h-full bg-slate-900 border-l border-slate-700 overflow-y-auto shadow-2xl animate-slideIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-5 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">🎯 MITRE ATT&CK Mappings</h2>
            <button className="text-slate-400 hover:text-slate-200 text-xl" onClick={onClose}>×</button>
          </div>
          <p className="text-sm text-slate-400 mt-1 truncate">{playbookTitle}</p>
          <div className="flex items-center gap-3 mt-3">
            <button
              className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-sm text-white hover:from-purple-500 hover:to-blue-500 disabled:opacity-50"
              onClick={handleAutoMap}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mapping...
                </span>
              ) : '🤖 Auto-Map'}
            </button>
            {activeMappings.length > 0 && (
              <span className="text-xs text-slate-400">
                {uniqueTechniques.size} techniques across {mappedTactics.size} tactics
              </span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* ATT&CK Matrix Mini-View */}
          {activeMappings.length > 0 && (
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <h3 className="text-xs text-slate-400 uppercase tracking-wide mb-3">Coverage Matrix</h3>
              <div className="flex gap-1 overflow-x-auto pb-2">
                {ALL_TACTICS.map(tactic => {
                  const tacticMappings = activeMappings.filter(m =>
                    m.tactic.toLowerCase() === tactic.toLowerCase()
                  );
                  const isActive = tacticMappings.length > 0;
                  return (
                    <div
                      key={tactic}
                      className="flex-shrink-0 w-24"
                    >
                      <div className={`text-[9px] text-center px-1 py-1.5 rounded-t border-b-2 font-medium truncate ${
                        isActive
                          ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                          : 'bg-slate-900 border-slate-700 text-slate-600'
                      }`}>
                        {tactic}
                      </div>
                      <div className="bg-slate-900/50 rounded-b p-1 min-h-[40px] space-y-0.5">
                        {tacticMappings.map((m, i) => (
                          <div
                            key={i}
                            className="px-1 py-0.5 rounded text-[8px] font-mono bg-red-500/20 text-red-300 border border-red-500/20 truncate"
                            title={`${m.technique_id} - ${m.technique_name}`}
                          >
                            {m.technique_id}
                          </div>
                        ))}
                        {!isActive && (
                          <div className="text-[8px] text-slate-700 text-center py-2">—</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mappings List */}
          {activeMappings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs text-slate-400 uppercase tracking-wide">Detailed Mappings</h3>
              {activeMappings.map((m) => {
                const origIdx = mappings.indexOf(m);
                const isConfirmed = confirmed.has(origIdx);
                return (
                  <div
                    key={origIdx}
                    className={`rounded-lg border p-4 transition ${
                      isConfirmed
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-slate-800 bg-slate-950'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 truncate">{m.step_text}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded text-xs font-mono bg-red-500/15 text-red-300 border border-red-500/20">
                            {m.technique_id} — {m.technique_name}
                          </span>
                          <span className="text-[10px] text-slate-500">{m.tactic}</span>
                        </div>
                        {/* Confidence bar */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${confidenceBarColor(m.confidence)}`}
                              style={{ width: `${m.confidence * 100}%` }}
                            />
                          </div>
                          <span className={`text-[10px] ${m.confidence >= 0.8 ? 'text-green-400' : m.confidence >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {Math.round(m.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          className={`px-2 py-1 rounded text-xs transition ${
                            isConfirmed
                              ? 'bg-green-600/30 border border-green-500/40 text-green-300'
                              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-green-600/20 hover:text-green-300'
                          }`}
                          onClick={() => setConfirmed(prev => { const s = new Set(prev); s.add(origIdx); return s; })}
                        >
                          ✓
                        </button>
                        <button
                          className="px-2 py-1 rounded text-xs bg-slate-800 border border-slate-700 text-slate-400 hover:bg-red-600/20 hover:text-red-300"
                          onClick={() => setDismissed(prev => new Set(prev).add(origIdx))}
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && mappings.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-sm">Click "Auto-Map" to identify ATT&CK techniques in this playbook.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ATTACKMappingPanel;
