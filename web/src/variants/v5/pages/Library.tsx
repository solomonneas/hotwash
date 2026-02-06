/**
 * V5 Library — Bibliography
 *
 * Academic bibliography style. Each playbook is a numbered entry [1], [2], etc.
 * with title, author (tooling), abstract (description), and metadata fields.
 */

import React, { useState, useMemo } from 'react';
import { usePlaybooks } from '../../../hooks/usePlaybooks';
import { PlaybookCategory } from '../../../types';
import './Library.css';

interface LibraryProps {
  onNavigate: (path: string) => void;
}

const CATEGORY_LABELS: Record<PlaybookCategory, string> = {
  'vulnerability-remediation': 'Vulnerability Remediation',
  'incident-response': 'Incident Response',
  'threat-hunting': 'Threat Hunting',
  'compliance': 'Compliance',
  'siem-operations': 'SIEM Operations',
  'template': 'Templates',
};

const Library: React.FC<LibraryProps> = ({ onNavigate }) => {
  const { playbooks, categories } = usePlaybooks();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<PlaybookCategory | 'all'>('all');

  const filtered = useMemo(() => {
    let items = activeCategory === 'all'
      ? [...playbooks]
      : playbooks.filter((p) => p.category === activeCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.metadata.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return items;
  }, [playbooks, activeCategory, search]);

  return (
    <div className="v5-library">
      {/* Header */}
      <h1 className="v5-library-title">Bibliography</h1>
      <p className="v5-library-subtitle">
        An annotated bibliography of operational security playbooks,
        indexed by domain and tooling.
      </p>

      <hr className="v5-section-rule" />

      {/* Search */}
      <div className="v5-library-search">
        <label className="v5-search-label" htmlFor="v5-search">
          Search references:
        </label>
        <input
          id="v5-search"
          type="text"
          className="v5-search-input"
          placeholder="Enter keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="v5-search-count">
          {filtered.length} of {playbooks.length} entries
        </span>
      </div>

      {/* Category filter */}
      <div className="v5-library-filters">
        <button
          className={`v5-filter ${activeCategory === 'all' ? 'v5-filter--active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`v5-filter ${activeCategory === cat ? 'v5-filter--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <hr className="v5-section-rule" />

      {/* Bibliography entries */}
      {filtered.length > 0 ? (
        <div className="v5-bibliography">
          <h2 className="v5-bib-heading">References</h2>
          {filtered.map((pb, idx) => (
            <div
              key={pb.slug}
              className="v5-bib-entry"
              onClick={() => onNavigate(`#/5/playbook/${pb.slug}`)}
            >
              <span className="v5-bib-number">[{idx + 1}]</span>
              <div className="v5-bib-body">
                <div className="v5-bib-title">{pb.metadata.title}</div>
                <div className="v5-bib-meta">
                  <span className="v5-bib-author">{pb.metadata.tooling}</span>
                  <span className="v5-bib-sep">·</span>
                  <span className="v5-bib-type">{pb.metadata.type}</span>
                  <span className="v5-bib-sep">·</span>
                  <span className="v5-bib-category">{CATEGORY_LABELS[pb.category]}</span>
                </div>
                <div className="v5-bib-abstract">
                  <em>Abstract — </em>{pb.description}
                </div>
                {pb.tags.length > 0 && (
                  <div className="v5-bib-keywords">
                    <em>Keywords: </em>{pb.tags.join(', ')}
                  </div>
                )}
                <div className="v5-bib-stats">
                  {pb.graph.nodes.length} nodes · {pb.graph.edges.length} edges
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="v5-library-empty">
          <p>No references match the current search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Library;
