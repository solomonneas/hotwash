/**
 * V1 Dashboard — Executive Summary / Status Page
 *
 * Displays operational summary of all playbooks in the system.
 * Formatted as a military-style briefing document.
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
  'template': 'Template / Reference',
};

const Dashboard: React.FC = () => {
  const { playbooks, categories } = usePlaybooks();

  const stats = useMemo(() => {
    const totalNodes = playbooks.reduce((sum, p) => sum + p.graph.nodes.length, 0);
    const totalEdges = playbooks.reduce((sum, p) => sum + p.graph.edges.length, 0);
    const byCategory: Record<string, number> = {};
    categories.forEach((cat) => {
      byCategory[cat] = playbooks.filter((p) => p.category === cat).length;
    });

    return {
      totalPlaybooks: playbooks.length,
      totalNodes,
      totalEdges,
      avgNodes: playbooks.length > 0 ? Math.round(totalNodes / playbooks.length) : 0,
      byCategory,
    };
  }, [playbooks, categories]);

  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');

  return (
    <div className="v1-dashboard">
      <div className="v1-content-header">
        <div className="v1-section-number">Section 1.0</div>
        <h1>Executive Summary</h1>
      </div>

      <div className="v1-doc-ref">
        REF: PBF-DASHBOARD-{dateStr} // OPERATIONAL STATUS REPORT
      </div>

      {/* Briefing Block */}
      <div className="v1-dashboard-briefing">
        <h2>1.1 — Situation Overview</h2>
        <p>
          This dashboard provides a consolidated view of all operational playbooks
          currently loaded in the Playbook Forge system. Each playbook has been
          parsed into a structured node-edge graph suitable for visual reference
          and procedural execution.
        </p>
        <p>
          Personnel should reference individual playbooks (Section 2.0) for
          detailed procedures. This summary is for command-level awareness only.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="v1-stats-grid">
        <div className="v1-stat-card">
          <div className="v1-stat-value">{stats.totalPlaybooks}</div>
          <div className="v1-stat-label">Total Playbooks</div>
        </div>
        <div className="v1-stat-card">
          <div className="v1-stat-value">{stats.totalNodes}</div>
          <div className="v1-stat-label">Total Nodes</div>
        </div>
        <div className="v1-stat-card">
          <div className="v1-stat-value">{stats.totalEdges}</div>
          <div className="v1-stat-label">Total Edges</div>
        </div>
        <div className="v1-stat-card">
          <div className="v1-stat-value">{stats.avgNodes}</div>
          <div className="v1-stat-label">Avg Nodes/Playbook</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="v1-dashboard-briefing">
        <h2>1.2 — Category Breakdown</h2>
        <table className="v1-category-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Count</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat}>
                <td>{CATEGORY_LABELS[cat] || cat}</td>
                <td style={{ fontWeight: 700 }}>{stats.byCategory[cat] || 0}</td>
                <td style={{ color: '#4A5D23' }}>OPERATIONAL</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Playbook Inventory */}
      <div className="v1-dashboard-briefing">
        <h2>1.3 — Playbook Inventory</h2>
        <table className="v1-category-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Playbook Title</th>
              <th>Type</th>
              <th>Nodes</th>
              <th>Edges</th>
            </tr>
          </thead>
          <tbody>
            {playbooks.map((pb, idx) => (
              <tr key={pb.slug}>
                <td style={{ fontWeight: 700, width: 40 }}>{idx + 1}</td>
                <td>{pb.metadata.title}</td>
                <td style={{ fontSize: '12px' }}>{pb.metadata.type}</td>
                <td style={{ textAlign: 'center' }}>{pb.graph.nodes.length}</td>
                <td style={{ textAlign: 'center' }}>{pb.graph.edges.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="v1-dashboard-footer">
        Report generated: {new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })} // End of Section 1.0
      </div>
    </div>
  );
};

export default Dashboard;
