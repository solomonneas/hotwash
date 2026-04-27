/**
 * SuggestionDetailPage - Single-suggestion review surface.
 *
 * Shows the parsed alert payload, the mapping reference, and the actions
 * available to the analyst (accept / dismiss). Mirrors the route shape of
 * /executions/:id so the patterns stay parallel.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHashRouter } from '../router';
import {
  acceptSuggestion,
  ApiClientError,
  ApiSuggestionDetail,
  dismissSuggestion,
  getSuggestion,
} from '../api/client';
import { relativeTime } from '../lib/time';

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

const DISMISS_REASON_MAX = 500;

interface SuggestionDetailPageProps {
  suggestionId: string;
}

const SuggestionDetailPage: React.FC<SuggestionDetailPageProps> = ({ suggestionId }) => {
  const { navigate } = useHashRouter();
  const [detail, setDetail] = useState<ApiSuggestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [gone, setGone] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [dismissOpen, setDismissOpen] = useState(false);
  const [dismissReason, setDismissReason] = useState('');
  const [actioning, setActioning] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  // Stale-response guard for the detail fetch.
  const cancelledRef = useRef(false);

  // Track outstanding timers so we can clear them on unmount.
  const timeoutsRef = useRef<Set<number>>(new Set());
  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current.delete(id);
      fn();
    }, ms);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  // Modal focus management refs.
  const acceptOpenerRef = useRef<HTMLButtonElement | null>(null);
  const dismissOpenerRef = useRef<HTMLButtonElement | null>(null);
  const acceptCancelRef = useRef<HTMLButtonElement | null>(null);
  const dismissTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Clear any pending timers on unmount.
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current.clear();
    };
  }, []);

  const fetchDetail = useCallback(async () => {
    if (cancelledRef.current) return;
    setError(null);
    try {
      const result = await getSuggestion(suggestionId);
      if (cancelledRef.current) return;
      setDetail(result);
      setGone(false);
      setNotFound(false);
    } catch (err) {
      if (cancelledRef.current) return;
      if (err instanceof ApiClientError) {
        if (err.status === 410) {
          setDetail(null);
          setGone(true);
          return;
        }
        if (err.status === 404) {
          setDetail(null);
          setNotFound(true);
          return;
        }
        setError(err.message);
      } else {
        setError('Failed to load suggestion.');
      }
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  }, [suggestionId]);

  useEffect(() => {
    cancelledRef.current = false;
    setLoading(true);
    fetchDetail();
    return () => {
      cancelledRef.current = true;
    };
  }, [fetchDetail]);

  // Focus management when modals open / close.
  useEffect(() => {
    if (acceptOpen) {
      acceptCancelRef.current?.focus();
    } else if (acceptOpenerRef.current) {
      acceptOpenerRef.current.focus();
    }
  }, [acceptOpen]);

  useEffect(() => {
    if (dismissOpen) {
      dismissTextareaRef.current?.focus();
    } else if (dismissOpenerRef.current) {
      dismissOpenerRef.current.focus();
    }
  }, [dismissOpen]);

  const closeAcceptModal = useCallback(() => setAcceptOpen(false), []);
  const closeDismissModal = useCallback(() => {
    setDismissOpen(false);
    setDismissReason('');
  }, []);

  const handleAcceptConfirm = async () => {
    if (!detail) return;
    setError(null);
    setInfo(null);
    setActioning(true);
    try {
      const res = await acceptSuggestion(detail.id);
      setAcceptOpen(false);
      if (res.already_accepted) {
        setInfo('This suggestion was already accepted; routing to the existing execution.');
        scheduleTimeout(() => {
          navigate(`#/executions/${res.execution.id}`);
        }, 800);
        return;
      }
      navigate(`#/executions/${res.execution.id}`);
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : 'Failed to accept suggestion.';
      setError(msg);
    } finally {
      setActioning(false);
    }
  };

  const handleDismissConfirm = async () => {
    if (!detail) return;
    setError(null);
    setInfo(null);
    setActioning(true);
    try {
      await dismissSuggestion(detail.id, dismissReason || undefined);
      setDismissOpen(false);
      setDismissReason('');
      await fetchDetail();
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : 'Failed to dismiss suggestion.';
      setError(msg);
    } finally {
      setActioning(false);
    }
  };

  const handleCopyJson = async () => {
    if (!detail) return;
    try {
      const text = JSON.stringify(detail.alert_payload, null, 2);
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      scheduleTimeout(() => setCopyState('idle'), 1500);
    } catch {
      setCopyState('failed');
      scheduleTimeout(() => setCopyState('idle'), 1500);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-[#0d1117] text-slate-100 flex items-center justify-center"
        role="status"
        aria-busy="true"
      >
        <div className="text-slate-400">Loading suggestion...</div>
      </div>
    );
  }

  if (gone) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <button
            className="text-slate-400 hover:text-slate-200 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => navigate('#/suggestions')}
          >
            ← Back to suggestions
          </button>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-10 text-center">
            <h1 className="text-xl font-semibold text-slate-100">Suggestion no longer available</h1>
            <p className="text-sm text-slate-400 mt-3">
              Underlying mapping was removed; this suggestion can no longer be acted on.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !detail) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <button
            className="text-slate-400 hover:text-slate-200 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => navigate('#/suggestions')}
          >
            ← Back to suggestions
          </button>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-10 text-center">
            <h1 className="text-xl font-semibold text-slate-100">Suggestion not found</h1>
            <p className="text-sm text-slate-400 mt-3">
              {error || 'It may have been deleted.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const badge = STATE_BADGE[detail.state] || STATE_BADGE.dismissed;
  const isPending = detail.state === 'pending';
  const playbookTitle = detail.playbook_title || `Playbook #${detail.playbook_id}`;
  const jsonText = JSON.stringify(detail.alert_payload, null, 2);

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          className="text-slate-400 hover:text-slate-200 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => navigate('#/suggestions')}
        >
          ← Back to suggestions
        </button>

        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold">
              {detail.rule_id ? `Rule ${detail.rule_id}` : 'Rule (no id)'}
            </h1>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide border ${badge.bg} ${badge.fg} ${badge.border}`}
            >
              {detail.state}
            </span>
          </div>
          <p className="text-sm text-slate-400">
            {detail.agent_name || detail.agent_id || 'Unknown agent'} ·{' '}
            {playbookTitle} ·{' '}
            <span title={detail.created_at}>{relativeTime(detail.created_at)}</span>
          </p>
          <p className="text-xs text-slate-500 font-mono break-all">
            fingerprint: {detail.fingerprint}
          </p>
        </div>

        {info && (
          <div className="rounded-md border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-200 mb-4">
            {info}
          </div>
        )}

        {error && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 mb-4">
            {error}
          </div>
        )}

        {/* Description card */}
        {detail.description && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 mb-4">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
              Description
            </div>
            <p className="text-sm text-slate-200">{detail.description}</p>
          </div>
        )}

        {/* Mapping card */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 mb-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
            Mapping
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-100">{detail.mapping.name}</div>
              <div className="text-xs text-slate-400 mt-1">
                Mode: {detail.mapping.mode} · Cooldown: {detail.mapping.cooldown_seconds}s ·{' '}
                {detail.mapping.enabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span
                aria-hidden="true"
                className={`inline-block w-2 h-2 rounded-full ${
                  detail.mapping.has_hmac_secret ? 'bg-green-400' : 'bg-slate-500'
                }`}
              />
              <span>
                HMAC secret {detail.mapping.has_hmac_secret ? 'configured' : 'not set'}
              </span>
            </div>
          </div>
        </div>

        {/* Accepted execution link */}
        {detail.accepted_execution_id && (
          <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-4 mb-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-sm text-green-100">
                Execution #{detail.accepted_execution_id} was created from this suggestion.
              </div>
              <button
                className="px-3 py-1 rounded-md bg-green-600 text-xs text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                onClick={() => navigate(`#/executions/${detail.accepted_execution_id}`)}
              >
                Open execution
              </button>
            </div>
          </div>
        )}

        {/* Alert payload viewer */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 mb-4">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-slate-200 select-none">
              Alert payload
            </summary>
            <div className="mt-3 flex justify-end mb-2">
              <button
                className="px-3 py-1 rounded-md border border-slate-700 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleCopyJson}
              >
                {copyState === 'copied'
                  ? 'Copied'
                  : copyState === 'failed'
                  ? 'Copy failed'
                  : 'Copy JSON'}
              </button>
            </div>
            <pre className="text-xs text-slate-200 bg-slate-950/80 border border-slate-800 rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words">
              {jsonText}
            </pre>
          </details>
        </div>

        {/* Actions */}
        {isPending && (
          <div className="flex gap-3 mt-6">
            <button
              ref={acceptOpenerRef}
              className="px-4 py-2 rounded-md bg-blue-600 text-sm text-white hover:bg-blue-500 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setAcceptOpen(true)}
              disabled={actioning}
            >
              Accept
            </button>
            <button
              ref={dismissOpenerRef}
              className="px-4 py-2 rounded-md border border-slate-700 bg-slate-800 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setDismissOpen(true)}
              disabled={actioning}
            >
              Dismiss
            </button>
          </div>
        )}

        {!isPending && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5 mt-6">
            <div className="text-sm text-slate-300">
              {detail.state === 'accepted'
                ? 'This suggestion has been accepted.'
                : 'This suggestion has been dismissed.'}
              {detail.resolved_at && (
                <span className="text-slate-500">
                  {' · '}
                  {relativeTime(detail.resolved_at)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Accept confirm modal */}
      {acceptOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accept-modal-title"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && !actioning) {
              e.stopPropagation();
              closeAcceptModal();
            }
          }}
        >
          <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 id="accept-modal-title" className="text-lg font-semibold text-slate-100 mb-3">
              Accept suggestion?
            </h2>
            <p className="text-sm text-slate-400">
              An execution will be created from <span className="text-slate-200">{playbookTitle}</span>.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                ref={acceptCancelRef}
                className="px-4 py-2 rounded-md border border-slate-700 bg-slate-800 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={closeAcceptModal}
                disabled={actioning}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-sm text-white hover:bg-blue-500 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleAcceptConfirm}
                disabled={actioning}
              >
                {actioning ? 'Accepting...' : 'Accept'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dismiss confirm modal */}
      {dismissOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dismiss-modal-title"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && !actioning) {
              e.stopPropagation();
              closeDismissModal();
            }
          }}
        >
          <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 id="dismiss-modal-title" className="text-lg font-semibold text-slate-100 mb-3">
              Dismiss suggestion?
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Dismissing anchors the cooldown window for this fingerprint, suppressing immediate re-fires of the same alert.
            </p>
            <label className="block text-xs text-slate-400 mb-1" htmlFor="dismiss-reason">
              Reason (optional)
            </label>
            <textarea
              ref={dismissTextareaRef}
              id="dismiss-reason"
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Why is this being dismissed?"
              rows={4}
              maxLength={DISMISS_REASON_MAX}
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
            />
            <div className="text-xs text-slate-500 mt-1 text-right">
              {dismissReason.length}/{DISMISS_REASON_MAX}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md border border-slate-700 bg-slate-800 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={closeDismissModal}
                disabled={actioning}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-slate-700 text-sm text-white hover:bg-slate-600 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleDismissConfirm}
                disabled={actioning}
              >
                {actioning ? 'Dismissing...' : 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionDetailPage;
