/**
 * Demo Playbook Data — Barrel Export
 *
 * Exports all demo playbook data for use by hooks and components.
 * Each module provides: markdown (raw string), graph (PlaybookGraph), libraryItem (PlaybookLibraryItem).
 */

import { PlaybookLibraryItem } from '../types';

export { libraryItem as pythonPlaybook } from './vulnerability-remediation-python';
export { libraryItem as softwarePlaybook } from './vulnerability-remediation-software';
export { libraryItem as virtualboxPlaybook } from './vulnerability-remediation-virtualbox';
export { libraryItem as wazuhExportPlaybook } from './wazuh-vulnerability-export';
export { libraryItem as templatePlaybook } from './template';

export {
  markdown as pythonMarkdown,
  graph as pythonGraph,
} from './vulnerability-remediation-python';

export {
  markdown as softwareMarkdown,
  graph as softwareGraph,
} from './vulnerability-remediation-software';

export {
  markdown as virtualboxMarkdown,
  graph as virtualboxGraph,
} from './vulnerability-remediation-virtualbox';

export {
  markdown as wazuhExportMarkdown,
  graph as wazuhExportGraph,
} from './wazuh-vulnerability-export';

export {
  markdown as templateMarkdown,
  graph as templateGraph,
} from './template';

/**
 * All playbook library items in a single array for easy consumption.
 */
import { libraryItem as python } from './vulnerability-remediation-python';
import { libraryItem as software } from './vulnerability-remediation-software';
import { libraryItem as virtualbox } from './vulnerability-remediation-virtualbox';
import { libraryItem as wazuhExport } from './wazuh-vulnerability-export';
import { libraryItem as template } from './template';

export const allPlaybooks: PlaybookLibraryItem[] = [
  python,
  software,
  virtualbox,
  wazuhExport,
  template,
];
