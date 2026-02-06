/**
 * Demo Playbook Data — Barrel Export
 *
 * Exports all demo playbook data for use by hooks and components.
 * Each module provides: markdown (raw string), graph (PlaybookGraph), libraryItem (PlaybookLibraryItem).
 */

import { PlaybookLibraryItem } from '../types';
import { libraryItem as python, markdown as pythonMarkdown, graph as pythonGraph } from './vulnerability-remediation-python';
import { libraryItem as software, markdown as softwareMarkdown, graph as softwareGraph } from './vulnerability-remediation-software';
import { libraryItem as virtualbox, markdown as virtualboxMarkdown, graph as virtualboxGraph } from './vulnerability-remediation-virtualbox';
import { libraryItem as wazuhExport, markdown as wazuhExportMarkdown, graph as wazuhExportGraph } from './wazuh-vulnerability-export';
import { libraryItem as template, markdown as templateMarkdown, graph as templateGraph } from './template';

export { python as pythonPlaybook, software as softwarePlaybook, virtualbox as virtualboxPlaybook, wazuhExport as wazuhExportPlaybook, template as templatePlaybook };
export { pythonMarkdown, pythonGraph, softwareMarkdown, softwareGraph, virtualboxMarkdown, virtualboxGraph, wazuhExportMarkdown, wazuhExportGraph, templateMarkdown, templateGraph };

export const allPlaybooks: PlaybookLibraryItem[] = [
  python,
  software,
  virtualbox,
  wazuhExport,
  template,
];
