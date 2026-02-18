/**
 * EditorPage — Split-pane playbook editor with live FlowCanvas preview.
 */

import React, { useEffect, useMemo, useState } from 'react';
import FlowCanvas from '../components/FlowCanvas';
import { PlaybookGraph } from '../types';
import { parseMarkdownToGraph } from '../parsers/markdownParser';
import { createPlaybook, getPlaybook, updatePlaybook } from '../api/client';
import { allPlaybooks } from '../data';
import { useHashRouter } from '../router';

interface EditorPageProps {
  playbookId?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'vulnerability-remediation', label: 'Vulnerability Remediation' },
  { value: 'incident-response', label: 'Incident Response' },
  { value: 'threat-hunting', label: 'Threat Hunting' },
  { value: 'custom', label: 'Custom' },
];

const emptyGraph: PlaybookGraph = { nodes: [], edges: [] };

const EditorPage: React.FC<EditorPageProps> = ({ playbookId }) => {
  const { navigate } = useHashRouter();
  const [currentId, setCurrentId] = useState(playbookId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('custom');
  const [tagsInput, setTagsInput] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [graph, setGraph] = useState<PlaybookGraph>(emptyGraph);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    setCurrentId(playbookId);
  }, [playbookId]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!currentId) {
        setTitle('');
        setDescription('');
        setCategory('custom');
        setTagsInput('');
        setMarkdown('');
        setGraph(emptyGraph);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getPlaybook(currentId);
        if (!active) return;
        setTitle(data.title || '');
        setDescription(data.description || '');
        setCategory(normalizeCategoryKey(data.category));
        setTagsInput((data.tags || []).join(', '));
        setMarkdown(data.content_markdown || '');
        setGraph(data.graph_json || (data.content_markdown ? parseMarkdownToGraph(data.content_markdown) : emptyGraph));
      } catch {
        const fallback = allPlaybooks.find((pb) => pb.slug === currentId);
        if (!active) return;
        if (fallback) {
          setTitle(fallback.metadata.title);
          setDescription(fallback.description);
          setCategory(normalizeCategoryKey(fallback.category));
          setTagsInput(fallback.tags.join(', '));
          setMarkdown(fallback.markdown);
          setGraph(fallback.graph);
        } else {
          setError('Playbook not found.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [currentId]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (!markdown.trim()) {
        setGraph(emptyGraph);
        return;
      }
      try {
        const nextGraph = parseMarkdownToGraph(markdown);
        setGraph(nextGraph);
      } catch {
        setGraph(emptyGraph);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [markdown]);

  const tagList = useMemo(
    () => tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean),
    [tagsInput]
  );

  const handleSave = async () => {
    setSaveStatus('saving');
    setError(null);
    const payload = {
      title: title.trim() || 'Untitled Playbook',
      description: description.trim(),
      category,
      content_markdown: markdown,
      tags: tagList,
    };

    try {
      if (currentId) {
        const updated = await updatePlaybook(currentId, payload);
        setCurrentId(updated.id);
      } else {
        const created = await createPlaybook(payload);
        setCurrentId(created.id);
        navigate(`#/editor/${encodeURIComponent(created.id)}`);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    } catch {
      setSaveStatus('error');
      setError('Failed to save playbook.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Playbook Editor</h1>
              <p className="text-sm text-slate-400 mt-1">Draft, preview, and persist playbooks.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 rounded-md border border-slate-700 bg-slate-800 text-sm text-slate-200"
                onClick={() => navigate('#/library')}
              >
                Back to Library
              </button>
              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-sm text-white hover:bg-blue-500 disabled:opacity-60"
                onClick={handleSave}
                disabled={loading || saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? 'Saving...' : 'Save'}
              </button>
              <span className="text-xs text-slate-400">
                {saveStatus === 'saved' && 'Saved'}
                {saveStatus === 'error' && 'Error'}
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <label className="text-xs text-slate-400">Title</label>
              <input
                className="rounded-md bg-slate-900 border border-slate-700 px-4 py-2 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Playbook title"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-xs text-slate-400">Category</label>
              <select
                className="rounded-md bg-slate-900 border border-slate-700 px-4 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex flex-col gap-3">
              <label className="text-xs text-slate-400">Description</label>
              <textarea
                className="rounded-md bg-slate-900 border border-slate-700 px-4 py-2 text-sm min-h-[80px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-3">
              <label className="text-xs text-slate-400">Tags (comma separated)</label>
              <input
                className="rounded-md bg-slate-900 border border-slate-700 px-4 py-2 text-sm"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="incident response, triage, containment"
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Markdown</span>
                <span className="text-xs text-slate-500">Live preview (300ms debounce)</span>
              </div>
              <textarea
                className="min-h-[520px] w-full rounded-md bg-slate-900 border border-slate-700 px-4 py-3 font-mono text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="# Incident Response Playbook\n\n1. Detect alert..."
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-sm text-slate-300">Flow Preview</div>
              <div className="rounded-md border border-slate-800 bg-slate-900/60 min-h-[520px]">
                <FlowCanvas graph={graph} />
              </div>
            </div>
          </div>

          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              {tagList.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function normalizeCategoryKey(category?: string): string {
  const value = (category || '').toLowerCase().replace(/_/g, '-');
  if (value.includes('vulnerability')) return 'vulnerability-remediation';
  if (value.includes('incident')) return 'incident-response';
  if (value.includes('threat')) return 'threat-hunting';
  if (value.includes('custom')) return 'custom';
  return value || 'custom';
}

export default EditorPage;
