/**
 * V1 Library — Playbook Catalog / Table of Contents
 *
 * Displays all playbooks in a numbered TOC format with
 * category filtering and section numbering.
 */

import React, { useState, useMemo } from 'react';
import { usePlaybooks } from '../../../hooks/usePlaybooks';
import { PlaybookCategory } from '../../../types';
import './Library.css';

interface LibraryProps {
  onNavigate: (path: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  'vulnerability-remediation': 'Vulnerability Remediation',
  'incident-response': 'Incident Response',
  'threat-hunting': 'Threat Hunting',
  'compliance': 'Compliance',
  'siem-operations': 'SIEM Operations',
  'template': 'Template',
};

const Library: React.FC<LibraryProps> = ({ onNavigate }) => {
  const { playbooks, categories } = usePlaybooks();
  const [activeCategory, setActiveCategory] = useState<PlaybookCategory | 'all'>('all');

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return playbooks;
    return playbooks.filter((p) => p.category === activeCategory);
  }, [playbooks, activeCategory]);

  return (
    <div className="v1-library">
      <div className="v1-content-header">
        <div className="v1-section-number">Section 2.0</div>
        <h1>Playbook Library</h1>
      </div>

      <div className="v1-doc-ref">
        REF: PBF-LIB-001 // MASTER INDEX OF OPERATIONAL PLAYBOOKS
      </div>

      {/* Category Filter */}
      <div className="v1-category-filter">
        <button
          className={`v1-category-btn ${activeCategory === 'all' ? 'v1-category-btn--active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All ({playbooks.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`v1-category-btn ${activeCategory === cat ? 'v1-category-btn--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {CATEGORY_LABELS[cat] || cat} ({playbooks.filter((p) => p.category === cat).length})
          </button>
        ))}
      </div>

      {/* Table of Contents List */}
      {filtered.length > 0 ? (
        <ul className="v1-toc-list">
          {filtered.map((pb, idx) => (
            <li key={pb.slug}>
              <button
                className="v1-toc-entry"
                onClick={() => onNavigate(`#/1/playbook/${pb.slug}`)}
                style={{ width: '100%', background: 'none', border: 'none' }}
              >
                <span className="v1-toc-number">2.{idx + 1}</span>
                <div className="v1-toc-details">
                  <div className="v1-toc-title">{pb.metadata.title}</div>
                  <div className="v1-toc-desc">{pb.description}</div>
                  <div className="v1-toc-meta">
                    <span className="v1-toc-meta-item">{pb.metadata.type}</span>
                    {pb.metadata.lastUpdated && (
                      <span className="v1-toc-meta-item">Updated: {pb.metadata.lastUpdated}</span>
                    )}
                    <span className="v1-toc-meta-item">
                      {pb.graph.nodes.length} nodes / {pb.graph.edges.length} edges
                    </span>
                  </div>
                  <div className="v1-tag-list">
                    {pb.tags.map((tag) => (
                      <span key={tag} className="v1-tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <span className="v1-toc-page">
                  Appendix A.{idx + 1} ►
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="v1-library-empty">
          No playbooks found matching the selected category.
        </div>
      )}
    </div>
  );
};

export default Library;
