/**
 * V4 Library — Parts Catalog with Numbered Items
 *
 * Blueprint-style parts catalog. Each playbook is a numbered "part"
 * with specification data, tags, and category. Feels like an engineering
 * bill of materials.
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
    <div className="v4-library">
      {/* Header */}
      <div className="v4-library-header">
        <h1>Parts Catalog</h1>
        <p className="v4-library-subtitle">
          // SCHEMATIC INVENTORY — BROWSE AND SELECT COMPONENTS
        </p>
      </div>

      {/* Search */}
      <div className="v4-library-toolbar">
        <div className="v4-search-wrapper">
          <span className="v4-search-icon">⌕</span>
          <input
            type="text"
            className="v4-search-input"
            placeholder="Search schematics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="v4-library-count">
          {filtered.length} / {playbooks.length} parts
        </span>
      </div>

      {/* Filter pills */}
      <div className="v4-filter-pills">
        <button
          className={`v4-filter-pill ${activeCategory === 'all' ? 'v4-filter-pill--active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`v4-filter-pill ${activeCategory === cat ? 'v4-filter-pill--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Parts catalog */}
      {filtered.length > 0 ? (
        <div className="v4-parts-catalog">
          {filtered.map((pb, idx) => (
            <div
              key={pb.slug}
              className="v4-part-card"
              onClick={() => onNavigate(`#/4/playbook/${pb.slug}`)}
            >
              <div className="v4-part-number">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div className="v4-part-info">
                <div className="v4-part-category">{CATEGORY_LABELS[pb.category]}</div>
                <div className="v4-part-title">{pb.metadata.title}</div>
                <div className="v4-part-description">{pb.description}</div>
                <div className="v4-part-tags">
                  {pb.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className="v4-part-tag">{tag}</span>
                  ))}
                  {pb.tags.length > 5 && (
                    <span className="v4-part-tag">+{pb.tags.length - 5}</span>
                  )}
                </div>
                <div className="v4-part-specs">
                  <div className="v4-part-spec">
                    <span className="v4-part-spec-label">Type</span>
                    <span className="v4-part-spec-value">{pb.metadata.type}</span>
                  </div>
                  <div className="v4-part-spec">
                    <span className="v4-part-spec-label">Tooling</span>
                    <span className="v4-part-spec-value">{pb.metadata.tooling}</span>
                  </div>
                  <div className="v4-part-spec">
                    <span className="v4-part-spec-label">Nodes</span>
                    <span className="v4-part-spec-value">{pb.graph.nodes.length}</span>
                  </div>
                  <div className="v4-part-spec">
                    <span className="v4-part-spec-label">Edges</span>
                    <span className="v4-part-spec-value">{pb.graph.edges.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="v4-library-empty">
          <span className="v4-library-empty-icon">⚙</span>
          No schematics match your search parameters.
        </div>
      )}
    </div>
  );
};

export default Library;
