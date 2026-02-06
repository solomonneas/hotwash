/**
 * V4 Dashboard — Blueprint Project Overview
 *
 * Engineering-style project overview with technical specification cards,
 * category coverage table, node composition bars, and inventory listing.
 */

import React, { useMemo } from 'react';
import { usePlaybooks } from '../../../hooks/usePlaybooks';
import { PlaybookCategory } from '../../../types';
import './Dashboard.css';

const CATEGORY_LABELS: Record<PlaybookCategory, string> = {
  'vulnerability-remediation': 'Vulnerability Remediation',
  'incident-response': 'Incident Response',
  'threat-hunting': 'Threat Hunting',
  'compliance': 'Compliance',
  'siem-operations': 'SIEM Operations',
  'template': 'Templates',
};

const ALL_CATEGORIES: PlaybookCategory[] = [
  'vulnerability-remediation',
  'incident-response',
  'threat-hunting',
  'compliance',
  'siem-operations',
  'template',
];

const NODE_TYPE_COLORS: Record<string, string> = {
  phase: '#FBBF24',
  step: '#38BDF8',
  decision: '#FB923C',
  execute: '#4ADE80',
};

const Dashboard: React.FC = () => {
  const { playbooks } = usePlaybooks();

  const stats = useMemo(() => {
    const totalNodes = playbooks.reduce((s, p) => s + p.graph.nodes.length, 0);
    const totalEdges = playbooks.reduce((s, p) => s + p.graph.edges.length, 0);
    const byCategory: Record<string, number> = {};
    ALL_CATEGORIES.forEach((cat) => {
      byCategory[cat] = playbooks.filter((p) => p.category === cat).length;
    });
    const coveredCategories = ALL_CATEGORIES.filter((cat) => byCategory[cat] > 0).length;

    return {
      totalPlaybooks: playbooks.length,
      totalNodes,
      totalEdges,
      avgNodes: playbooks.length > 0 ? Math.round(totalNodes / playbooks.length) : 0,
      byCategory,
      coveragePercent: Math.round((coveredCategories / ALL_CATEGORIES.length) * 100),
      coveredCategories,
    };
  }, [playbooks]);

  const nodeTypeBreakdown = useMemo(() => {
    const counts: Record<string, number> = { phase: 0, step: 0, decision: 0, execute: 0 };
    playbooks.forEach((p) =>
      p.graph.nodes.forEach((n) => {
        if (counts[n.type] !== undefined) counts[n.type]++;
      })
    );
    return counts;
  }, [playbooks]);

  return (
    <div className="v4-dashboard">
      {/* Header */}
      <div className="v4-dashboard-header">
        <h1>Project Overview</h1>
        <p className="v4-dashboard-subtitle">
          // ENGINEERING SPECIFICATIONS — PLAYBOOK SYSTEM STATUS
        </p>
      </div>

      {/* Spec cards */}
      <div className="v4-spec-grid">
        <div className="v4-spec-card">
          <div className="v4-spec-label">Total Schematics</div>
          <div className="v4-spec-value">{stats.totalPlaybooks}</div>
          <div className="v4-spec-meta">
            <span className="v4-spec-accent">{stats.coveragePercent}%</span> category coverage
          </div>
        </div>
        <div className="v4-spec-card">
          <div className="v4-spec-label">Total Components</div>
          <div className="v4-spec-value">{stats.totalNodes}</div>
          <div className="v4-spec-meta">nodes across all schematics</div>
        </div>
        <div className="v4-spec-card">
          <div className="v4-spec-label">Total Connections</div>
          <div className="v4-spec-value">{stats.totalEdges}</div>
          <div className="v4-spec-meta">edges mapped in system</div>
        </div>
        <div className="v4-spec-card">
          <div className="v4-spec-label">Avg Components</div>
          <div className="v4-spec-value">{stats.avgNodes}</div>
          <div className="v4-spec-meta">nodes per schematic</div>
        </div>
      </div>

      {/* Section: Category Coverage + Node Composition */}
      <div className="v4-comp-grid">
        {/* Category Coverage */}
        <div className="v4-comp-panel">
          <h3>Category Coverage — {stats.coveredCategories}/{ALL_CATEGORIES.length}</h3>
          <table className="v4-coverage-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Category</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {ALL_CATEGORIES.map((cat) => {
                const count = stats.byCategory[cat] || 0;
                return (
                  <tr key={cat}>
                    <td>
                      <span
                        className={`v4-coverage-indicator ${
                          count > 0
                            ? 'v4-coverage-indicator--active'
                            : 'v4-coverage-indicator--inactive'
                        }`}
                      />
                    </td>
                    <td>{CATEGORY_LABELS[cat]}</td>
                    <td className="v4-coverage-count">{count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Node Composition */}
        <div className="v4-comp-panel">
          <h3>Node Composition</h3>
          {[
            { type: 'phase', label: 'Phase' },
            { type: 'step', label: 'Step' },
            { type: 'decision', label: 'Decision' },
            { type: 'execute', label: 'Execute' },
          ].map(({ type, label }) => {
            const count = nodeTypeBreakdown[type] || 0;
            const pct = stats.totalNodes > 0 ? (count / stats.totalNodes) * 100 : 0;
            return (
              <div key={type} className="v4-comp-bar-row">
                <span className="v4-comp-bar-label">{label}</span>
                <div className="v4-comp-bar-track">
                  <div
                    className="v4-comp-bar-fill"
                    style={{ width: `${pct}%`, background: NODE_TYPE_COLORS[type] }}
                  />
                </div>
                <span className="v4-comp-bar-value">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Inventory */}
      <div className="v4-section-divider">
        <span className="v4-section-divider-line" />
        <span className="v4-section-divider-label">Schematic Inventory</span>
        <span className="v4-section-divider-line" />
      </div>

      <table className="v4-inventory-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Type</th>
            <th>Tooling</th>
            <th>Nodes</th>
            <th>Edges</th>
          </tr>
        </thead>
        <tbody>
          {playbooks.map((pb, idx) => (
            <tr key={pb.slug}>
              <td className="v4-inventory-idx">{String(idx + 1).padStart(2, '0')}</td>
              <td>{pb.metadata.title}</td>
              <td style={{ color: '#94A3B8' }}>{pb.metadata.type}</td>
              <td style={{ color: '#94A3B8' }}>{pb.metadata.tooling}</td>
              <td className="v4-inventory-nodes">{pb.graph.nodes.length}</td>
              <td className="v4-inventory-edges">{pb.graph.edges.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
