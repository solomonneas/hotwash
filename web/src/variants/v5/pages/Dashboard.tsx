/**
 * V5 Dashboard — Executive Summary
 *
 * Academic paper-style overview with pull-quotes, key findings,
 * and statistical summary. Reads like an executive abstract.
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

    // Node type breakdown
    const nodeTypes: Record<string, number> = { phase: 0, step: 0, decision: 0, execute: 0 };
    playbooks.forEach((p) =>
      p.graph.nodes.forEach((n) => {
        if (nodeTypes[n.type] !== undefined) nodeTypes[n.type]++;
      })
    );

    return {
      totalPlaybooks: playbooks.length,
      totalNodes,
      totalEdges,
      avgNodes: playbooks.length > 0 ? Math.round(totalNodes / playbooks.length) : 0,
      byCategory,
      coveredCategories,
      totalCategories: ALL_CATEGORIES.length,
      nodeTypes,
    };
  }, [playbooks]);

  return (
    <div className="v5-dashboard">
      {/* Title */}
      <h1 className="v5-dashboard-title">Executive Summary</h1>
      <p className="v5-dashboard-subtitle">
        A quantitative overview of the playbook repository, its composition,
        and coverage across operational security domains.
      </p>

      <hr className="v5-section-rule" />

      {/* Abstract / Pull-quote */}
      <section className="v5-abstract">
        <h2>Abstract</h2>
        <p>
          This collection comprises <strong>{stats.totalPlaybooks} playbooks</strong> spanning{' '}
          <strong>{stats.coveredCategories}</strong> of{' '}
          <strong>{stats.totalCategories}</strong> operational categories.
          The corpus contains <strong>{stats.totalNodes} nodes</strong> connected by{' '}
          <strong>{stats.totalEdges} edges</strong>, yielding a mean complexity
          of <strong>{stats.avgNodes} nodes per playbook</strong>.
        </p>
      </section>

      <hr className="v5-section-rule" />

      {/* Key Findings */}
      <section className="v5-findings">
        <h2>Key Findings</h2>

        <div className="v5-findings-grid">
          <div className="v5-finding">
            <span className="v5-finding-value">{stats.totalPlaybooks}</span>
            <span className="v5-finding-label">Total Playbooks</span>
          </div>
          <div className="v5-finding">
            <span className="v5-finding-value">{stats.totalNodes}</span>
            <span className="v5-finding-label">Total Nodes</span>
          </div>
          <div className="v5-finding">
            <span className="v5-finding-value">{stats.totalEdges}</span>
            <span className="v5-finding-label">Total Edges</span>
          </div>
          <div className="v5-finding">
            <span className="v5-finding-value">{stats.avgNodes}</span>
            <span className="v5-finding-label">Avg. Nodes / Playbook</span>
          </div>
        </div>
      </section>

      <hr className="v5-section-rule" />

      {/* Pull Quote */}
      <blockquote className="v5-pullquote">
        <p>
          "The completeness of a playbook repository is measured not by the number
          of procedures documented, but by the operational gaps it reveals."
        </p>
      </blockquote>

      <hr className="v5-section-rule" />

      {/* Category Coverage Table */}
      <section className="v5-coverage">
        <h2>Category Coverage</h2>
        <p>
          Table 1 presents the distribution of playbooks across the six
          defined operational categories.
        </p>

        <div className="v5-table-wrapper">
          <table className="v5-table">
            <caption>Table 1. Playbook distribution by operational category.</caption>
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ALL_CATEGORIES.map((cat) => {
                const count = stats.byCategory[cat] || 0;
                return (
                  <tr key={cat}>
                    <td>{CATEGORY_LABELS[cat]}</td>
                    <td className="v5-table-num">{count}</td>
                    <td className="v5-table-status">
                      {count > 0 ? 'Documented' : 'Pending'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <hr className="v5-section-rule" />

      {/* Node Composition */}
      <section className="v5-composition">
        <h2>Node Composition</h2>
        <p>
          Table 2 details the typological distribution of nodes across
          the complete playbook corpus.
        </p>

        <div className="v5-table-wrapper">
          <table className="v5-table">
            <caption>Table 2. Node type distribution across all playbooks.</caption>
            <thead>
              <tr>
                <th>Node Type</th>
                <th>Count</th>
                <th>Proportion</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.nodeTypes).map(([type, count]) => (
                <tr key={type}>
                  <td style={{ textTransform: 'capitalize' }}>{type}</td>
                  <td className="v5-table-num">{count}</td>
                  <td className="v5-table-num">
                    {stats.totalNodes > 0
                      ? `${((count / stats.totalNodes) * 100).toFixed(1)}%`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <hr className="v5-section-rule" />

      {/* Inventory */}
      <section className="v5-inventory">
        <h2>Playbook Inventory</h2>
        <p>
          The following is a complete enumeration of the playbooks contained
          within this repository.
        </p>

        <div className="v5-table-wrapper">
          <table className="v5-table">
            <caption>Table 3. Complete playbook inventory with metadata.</caption>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Type</th>
                <th>Tooling</th>
                <th>Nodes</th>
              </tr>
            </thead>
            <tbody>
              {playbooks.map((pb, idx) => (
                <tr key={pb.slug}>
                  <td className="v5-table-num">{idx + 1}</td>
                  <td>{pb.metadata.title}</td>
                  <td>{pb.metadata.type}</td>
                  <td>{pb.metadata.tooling}</td>
                  <td className="v5-table-num">{pb.graph.nodes.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
