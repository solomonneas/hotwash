/**
 * SuggestionsPage - Analyst queue of ingest suggestions.
 *
 * Lists pending/accepted/dismissed suggestions produced by the Wazuh ingest
 * pipeline. Polls every 30s on the pending tab while the document is visible
 * so freshly arrived alerts surface without a manual refresh.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHashRouter } from '../router';
import {
  acceptSuggestion,
  ApiClientError,
  ApiSuggestionSummary,
  dismissSuggestion,
  listSuggestions,
} from '../api/client';
import { relativeTime } from '../lib/time';

type StateFilter = 'pending' | 'accepted' | 'dismissed' | 'all';

const STATE_FILTERS: StateFilter[] = ['pending', 'accepted', 'dismissed', 'all'];
const POLL_INTERVAL_MS = 30000;

const STATE_BADGE: Record<string, { bg: string; fg: string; border: string }> = {
  pending: {
    bg: 'bg-blue-500/10',
    fg: 'text-blue-200',
    border: 'border-blue-500/40',
  },
  accepted: {
    bg: 'bg-green-500/10',
    fg: 'text-green-200',
    border: 'border-green-500/40',
  },
  dismissed: {
    bg: 'bg-slate-700/40',
    fg: 'text-slate-300',
    border: 'border-slate-600/60',
  },
};

interface ParsedFilters {
  state: StateFilter;
  mappingId: string;
}

function parseFiltersFromHash(): ParsedFilters {
  const hash = window.location.hash || '';
  const queryStart = hash.indexOf('?');
  if (queryStart === -1) {
    return { state: 'pending', mappingId: '' };
  }
  const params = new URLSearchParams(hash.slice(queryStart + 1));
  const stateParam = params.get('state');
  const state: StateFilter =
    stateParam === 'accepted' ||
    stateParam === 'dismissed' ||
    stateParam === 'all' ||
    stateParam === 'pending'
      ? stateParam
      : 'pending';
  const mappingId = params.get('mapping_id') || '';
  return { state, mappingId };
}

function writeFiltersToHash(filters: ParsedFilters): void {
  const params = new URLSearchParams();
  if (filters.state !== 'pending') params.set('state', filters.state);
  if (filters.mappingId.trim()) params.set('mapping_id', filters.mappingId.trim());
  const qs = params.toString();
  const next = `#/suggestions${qs ? `?${qs}` : ''}`;
  if (window.location.hash !== next) {
    window.history.replaceState(null, '', next);
  }
}

const SuggestionsPage: React.FC = () => {
  const { navigate } = useHashRouter();
  const initial = parseFiltersFromHash();
  const [stateFilter, setStateFilter] = useState<StateFilter>(initial.state);
  const [mappingIdInput, setMappingIdInput] = useState<string>(initial.mappingId);
  const [suggestions, setSuggestions] = useState<ApiSuggestionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  // Sync URL when filters change.
  useEffect(() => {
    writeFiltersToHash({ state: stateFilter, mappingId: mappingIdInput });
  }, [stateFilter, mappingIdInput]);

  // Ref-tracked cancellation flag so the polling effect can also guard writes.
  const cancelledRef = useRef(false);

  const fetchSuggestions = useCallback(async () => {
    if (cancelledRef.current) return;
    setError(null);
    try {
      const mappingIdNum = mappingIdInput.trim()
        ? Number(mappingIdInput.trim())
        : undefined;
      const states: StateFilter[] =
        stateFilter === 'all' ? ['pending', 'accepted', 'dismissed'] : [stateFilter];
      const results = await Promise.all(
        states.map((s) =>
          listSuggestions({
            state: s,
            mapping_id:
              mappingIdNum !== undefined && !Number.isNaN(mappingIdNum)
                ? mappingIdNum
                : undefined,
          })
        )
      );
      if (cancelledRef.current) return;
      const merged = ([] as ApiSuggestionSummary[]).concat(...results);
      merged.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      setSuggestions(merged);
    } catch (err) {
      if (cancelledRef.current) return;
      const msg =
        err instanceof ApiClientError
          ? err.message
          : 'Could not load suggestions. Is the API running?';
      setError(msg);
      setSuggestions([]);
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  }, [stateFilter, mappingIdInput]);

  // Initial + filter-change fetch with stale-response guard.
  useEffect(() => {
    cancelledRef.current = false;
    setLoading(true);
    fetchSuggestions();
    return () => {
      cancelledRef.current = true;
    };
  }, [fetchSuggestions]);

  // Polling: only on pending tab while document visible.
  useEffect(() => {
    const clearPoll = () => {
      if (pollTimerRef.current !== null) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };

    const startPoll = () => {
      clearPoll();
      if (stateFilter !== 'pending') return;
      if (document.visibilityState !== 'visible') return;
      pollTimerRef.current = window.setInterval(() => {
        fetchSuggestions();
      }, POLL_INTERVAL_MS);
    };

    startPoll();
    const onVisibilityChange = () => startPoll();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      clearPoll();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [stateFilter, fetchSuggestions]);

  const handleAccept = async (id: number) => {
    setError(null);
    setPendingActionId(id);
    try {
      const res = await acceptSuggestion(id);
      navigate(`#/executions/${res.execution.id}`);
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : 'Failed to accept suggestion.';
      setError(msg);
    } finally {
      setPendingActionId(null);
    }
  };

  const handleDismiss = async (id: number) => {
    setError(null);
    setPendingActionId(id);
    try {
      await dismissSuggestion(id);
      await fetchSuggestions();
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : 'Failed to dismiss suggestion.';
      setError(msg);
    } finally {
      setPendingActionId(null);
    }
  };

  const counts = useMemo(() => {
    const result = { pending: 0, accepted: 0, dismissed: 0 };
    suggestions.forEach((s) => {
      if (s.state === 'pending') result.pending += 1;
      else if (s.state === 'accepted') result.accepted += 1;
      else if (s.state === 'dismissed') result.dismissed += 1;
    });
    return result;
  }, [suggestions]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold">Suggestions</h1>
            <p className="text-slate-400 text-sm mt-1">
              Triage incoming Wazuh alerts before they become executions.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => navigate('#/library')}
            >
              Library
            </button>
            <button
              className="px-4 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => navigate('#/executions')}
            >
              Executions
            </button>
            <button
              className="px-4 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => navigate('#/integrations')}
            >
              Integrations
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter by state">
            {STATE_FILTERS.map((f) => {
              const active = stateFilter === f;
              const label =
                f === 'pending' && counts.pending > 0
                  ? `${f} (${counts.pending})`
                  : f;
              return (
                <button
                  key={f}
                  role="radio"
                  aria-checked={active}
                  className={`px-3 py-1 rounded-full text-xs border capitalize focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    active
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                  onClick={() => setStateFilter(f)}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-slate-400" htmlFor="mapping-id-filter">
              Mapping ID
            </label>
            <input
              id="mapping-id-filter"
              className="w-24 rounded-md bg-slate-900 border border-slate-700 px-3 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="any"
              inputMode="numeric"
              value={mappingIdInput}
              onChange={(e) => setMappingIdInput(e.target.value.replace(/[^0-9]/g, ''))}
            />
            <button
              className="px-3 py-1 rounded-md border border-slate-700 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => fetchSuggestions()}
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div
            className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-slate-400"
            role="status"
            aria-busy="true"
          >
            Loading suggestions...
          </div>
        ) : !error && suggestions.length === 0 ? (
          <div
            className="rounded-lg border border-dashed border-slate-800 p-10 text-center text-slate-500"
            role="status"
          >
            {stateFilter === 'pending'
              ? 'No pending suggestions. Configure mappings in Integrations or read about the integration setup in WAZUH-INGEST.md.'
              : `No ${stateFilter === 'all' ? '' : stateFilter + ' '}suggestions match these filters.`}
          </div>
        ) : suggestions.length === 0 ? null : (
          <div className="flex flex-col gap-3">
            {suggestions.map((s) => {
              const isPending = s.state === 'pending';
              const badge = STATE_BADGE[s.state] || STATE_BADGE.dismissed;
              const description = s.description || `Mapping #${s.mapping_id}`;
              const busy = pendingActionId === s.id;
              return (
                <div
                  key={s.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 shadow-sm hover:border-slate-600 transition cursor-pointer"
                  onClick={() => navigate(`#/suggestions/${s.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-100">
                          {s.rule_id ? `Rule ${s.rule_id}` : 'Rule (no id)'}
                        </span>
                        <span className="text-sm text-slate-400">·</span>
                        <span className="text-sm text-slate-300">
                          {s.agent_name || s.agent_id || 'Unknown agent'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide border ${badge.bg} ${badge.fg} ${badge.border}`}
                        >
                          {s.state}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1 truncate" title={description}>
                        {description}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                        <span title={s.created_at}>{relativeTime(s.created_at)}</span>
                        <span>Mapping #{s.mapping_id}</span>
                        <span className="font-mono truncate" title={s.fingerprint}>
                          {s.fingerprint.slice(0, 12)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {isPending ? (
                        <>
                          <button
                            className="px-3 py-1 rounded-md bg-blue-600 text-xs text-white hover:bg-blue-500 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccept(s.id);
                            }}
                            disabled={busy}
                          >
                            {busy ? 'Working...' : 'Accept'}
                          </button>
                          <button
                            className="px-3 py-1 rounded-md border border-slate-600 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismiss(s.id);
                            }}
                            disabled={busy}
                          >
                            Dismiss
                          </button>
                          <button
                            className="px-3 py-1 rounded-md border border-slate-700 bg-slate-900 text-xs text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label={`View suggestion ${s.id} (${
                              s.rule_id ? `rule ${s.rule_id}` : 'no rule id'
                            }, ${s.agent_name || s.agent_id || 'unknown agent'})`}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`#/suggestions/${s.id}`);
                            }}
                          >
                            View
                          </button>
                        </>
                      ) : (
                        <button
                          className="px-3 py-1 rounded-md border border-slate-700 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={`View suggestion ${s.id} (${
                            s.rule_id ? `rule ${s.rule_id}` : 'no rule id'
                          }, ${s.agent_name || s.agent_id || 'unknown agent'})`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`#/suggestions/${s.id}`);
                          }}
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsPage;
