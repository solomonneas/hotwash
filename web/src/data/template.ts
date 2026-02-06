/**
 * Demo data: SOC Playbook Template
 */
import { PlaybookGraph, PlaybookLibraryItem } from '../types';

export const markdown = `# SOC Playbook Template
**Type:** [Category - e.g., Malware Response, Vulnerability Remediation, Phishing Investigation]
**Tooling:** [Primary tools used]
**Difficulty:** Beginner
**Estimated Time:** [How long this typically takes]
**Last Updated:** 2026-02-02

---

## Overview
[2-3 sentences explaining what this playbook addresses and why it matters]

## Detection

### Alert Signature
- **Rule ID/Group:** [Wazuh rule details]
- **Severity:** [Critical/High/Medium/Low]
- **Key Fields:** [What data points matter most]

### Initial Triage Questions
1. [Question to scope impact]
2. [Question to identify affected assets]
3. [Question to determine urgency]

### Dashboard Query
\`\`\`sql
SELECT agent_name, [fields]
FROM alerts
WHERE [conditions];
\`\`\`

## Investigation

### Step 1: [Action Name]
\`\`\`powershell
# Command with comments explaining what it does
\`\`\`

### Step 2: [Action Name]
\`\`\`powershell
# Command
\`\`\`

## Remediation

### Option A: [Approach Name] (Recommended)
\`\`\`powershell
# Commands
\`\`\`

### Option B: [Alternative Approach]
\`\`\`powershell
# Commands
\`\`\`

## Verification

### Immediate Check
\`\`\`powershell
# Quick validation command
\`\`\`

### Wazuh Confirmation
\`\`\`sql
SELECT [fields]
FROM alerts
WHERE [conditions];
\`\`\`

## Post-Remediation
1. [Documentation item]
2. [Prevention measure]
3. [Process improvement]
`;

export const graph: PlaybookGraph = {
  nodes: [
    { id: 'node_0', label: 'SOC Playbook Template', type: 'phase', metadata: { level: 1, header_type: 'h1' } },
    { id: 'node_1', label: 'Overview', type: 'phase', metadata: { level: 2, header_type: 'h2' } },
    { id: 'node_2', label: 'Detection', type: 'phase', metadata: { level: 2, header_type: 'h2' } },
    { id: 'node_3', label: 'Alert Signature', type: 'phase', metadata: { level: 3, header_type: 'h3' } },
    { id: 'node_4', label: 'Initial Triage Questions', type: 'phase', metadata: { level: 3, header_type: 'h3' } },
    { id: 'node_5', label: '[Question to scope impact]', type: 'step', metadata: { step_type: 'sequential' } },
    { id: 'node_6', label: '[Question to identify affected assets]', type: 'step', metadata: { step_type: 'sequential' } },
    { id: 'node_7', label: '[Question to determine urgency]', type: 'step', metadata: { step_type: 'sequential' } },
    { id: 'node_8', label: 'Dashboard Query', type: 'phase', metadata: { level: 3, header_type: 'h3' } },
    { id: 'node_9', label: 'Execute sql', type: 'execute', metadata: { language: 'sql' } },
    { id: 'node_10', label: 'Investigation', type: 'phase', metadata: { level: 2, header_type: 'h2' } },
    { id: 'node_11', label: 'Step 1: [Action Name]', type: 'phase', metadata: { level: 3, header_type: 'h3' } },
    { id: 'node_12', label: 'Execute powershell', type: 'execute', metadata: { language: 'powershell' } },
    { id: 'node_13', label: 'Step 2: [Action Name]', type: 'phase', metadata: { level: 3, header_type: 'h3' } },
    { id: 'node_14', label: 'Execute powershell', type: 'execute', metadata: { language: 'powershell' } },
    { id: 'node_15', label: 'Remediation', type: 'phase', metadata: { level: 2, header_type: 'h2' } },
    { id: 'node_16', label: 'Option A: [Approach Name] (Recommended)', type: 'phase', metadata: { level: 3, header_type: 'h3' } },
    { id: 'node_17', label: 'Execute powershell', type: 'execute', metadata: { language: 'powershell' } },
    { id: 'node_18', label: 'Option B: [Alternative Approach]', type: 'phase', metadata: { level: 3, header_type: 'h3' } },
    { id: 'node_19', label: 'Execute powershell', type: 'execute', metadata: { language: 'powershell' } },
    { id: 'node_20', label: 'Verification', type: 'phase', metadata: { level: 2, header_type: 'h2' } },
    { id: 'node_21', label: 'Immediate Check', type: 'phase', metadata: { level: 3, header_type: 'h3' } },
    { id: 'node_22', label: 'Execute powershell', type: 'execute', metadata: { language: 'powershell' } },
    { id: 'node_23', label: 'Wazuh Confirmation', type: 'phase', metadata: { level: 3, header_type: 'h3' } },
    { id: 'node_24', label: 'Execute sql', type: 'execute', metadata: { language: 'sql' } },
    { id: 'node_25', label: 'Post-Remediation', type: 'phase', metadata: { level: 2, header_type: 'h2' } },
    { id: 'node_26', label: '[Documentation item]', type: 'step', metadata: { step_type: 'sequential' } },
    { id: 'node_27', label: '[Prevention measure]', type: 'step', metadata: { step_type: 'sequential' } },
    { id: 'node_28', label: '[Process improvement]', type: 'step', metadata: { step_type: 'sequential' } },
  ],
  edges: [
    { id: 'edge_0', source: 'node_0', target: 'node_1' },
    { id: 'edge_1', source: 'node_1', target: 'node_2' },
    { id: 'edge_2', source: 'node_2', target: 'node_3' },
    { id: 'edge_3', source: 'node_3', target: 'node_4' },
    { id: 'edge_4', source: 'node_4', target: 'node_5' },
    { id: 'edge_5', source: 'node_5', target: 'node_6' },
    { id: 'edge_6', source: 'node_6', target: 'node_7' },
    { id: 'edge_7', source: 'node_7', target: 'node_8' },
    { id: 'edge_8', source: 'node_8', target: 'node_9' },
    { id: 'edge_9', source: 'node_9', target: 'node_10' },
    { id: 'edge_10', source: 'node_10', target: 'node_11' },
    { id: 'edge_11', source: 'node_11', target: 'node_12' },
    { id: 'edge_12', source: 'node_12', target: 'node_13' },
    { id: 'edge_13', source: 'node_13', target: 'node_14' },
    { id: 'edge_14', source: 'node_14', target: 'node_15' },
    { id: 'edge_15', source: 'node_15', target: 'node_16' },
    { id: 'edge_16', source: 'node_16', target: 'node_17' },
    { id: 'edge_17', source: 'node_17', target: 'node_18' },
    { id: 'edge_18', source: 'node_18', target: 'node_19' },
    { id: 'edge_19', source: 'node_19', target: 'node_20' },
    { id: 'edge_20', source: 'node_20', target: 'node_21' },
    { id: 'edge_21', source: 'node_21', target: 'node_22' },
    { id: 'edge_22', source: 'node_22', target: 'node_23' },
    { id: 'edge_23', source: 'node_23', target: 'node_24' },
    { id: 'edge_24', source: 'node_24', target: 'node_25' },
    { id: 'edge_25', source: 'node_25', target: 'node_26' },
    { id: 'edge_26', source: 'node_26', target: 'node_27' },
    { id: 'edge_27', source: 'node_27', target: 'node_28' },
  ],
};

export const libraryItem: PlaybookLibraryItem = {
  slug: 'template',
  metadata: {
    title: 'SOC Playbook Template',
    type: 'Template',
    tooling: 'N/A',
    difficulty: 'Beginner',
    lastUpdated: '2026-02-02',
  },
  category: 'template',
  markdown,
  graph,
  description:
    'Blank SOC playbook template with standard sections: Detection, Investigation, Remediation, Verification, Post-Remediation.',
  tags: ['template', 'starter', 'blank'],
};
