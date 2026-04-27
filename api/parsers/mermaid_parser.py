"""
Mermaid Parser for Hotwash

Converts Mermaid flowchart syntax into a node/edge graph format compatible with React Flow.

Parsing Rules:
- Supports 'flowchart TD/LR' and 'graph TD/LR' syntax
- Node shapes map to types: [] -> step, {} -> decision, () -> step, (()) -> phase
- Edge types: --> (solid), --text--> (labeled), -.-> (dotted), ==> (bold)
- Subgraphs become phase/group nodes
- Returns same JSON structure as markdown parser
"""

import re
from typing import List, Dict, Optional, Tuple, Set
from api.models import PlaybookNode, PlaybookEdge, PlaybookGraph


class MermaidParser:
    """Parser for converting Mermaid flowcharts to graph format."""

    # Node shape patterns
    NODE_PATTERNS = {
        r'\[([^\]]+)\]': 'step',           # [text] -> square/step
        r'\{([^\}]+)\}': 'decision',       # {text} -> diamond/decision
        r'\(\(([^\)]+)\)\)': 'phase',      # ((text)) -> circle/phase
        r'\(([^\)]+)\)': 'step',           # (text) -> rounded/step
        r'>([^\]]+)\]': 'step',            # >text] -> flag/step
        r'\[\[([^\]]+)\]\]': 'step',       # [[text]] -> subroutine/step
    }

    # Edge patterns
    EDGE_PATTERNS = [
        # Labeled edges with various arrow types
        (r'--\s*([^-]+?)\s*-->', 'solid'),      # --text-->
        (r'-\.\s*([^-]+?)\s*\.->', 'dotted'),    # -.text.->
        (r'==\s*([^=]+?)\s*==>', 'bold'),        # ==text==>
        # Simple edges
        (r'-->', 'solid'),                       # -->
        (r'-\.->', 'dotted'),                    # .->
        (r'==>', 'bold'),                        # ==>
        (r'--->', 'solid'),                      # --->
        (r'---->', 'solid'),                     # ---->
    ]

    def __init__(self):
        """Initialize the Mermaid parser."""
        self.nodes: List[PlaybookNode] = []
        self.edges: List[PlaybookEdge] = []
        self.node_counter = 0
        self.edge_counter = 0
        self.node_id_map: Dict[str, str] = {}  # Maps mermaid IDs to our node IDs
        self.subgraph_stack: List[Tuple[str, str]] = []  # Stack of (id, label) for nested subgraphs
        self.current_subgraph: Optional[str] = None

    def parse(self, content: str) -> PlaybookGraph:
        """
        Parse Mermaid flowchart content into a graph.

        Args:
            content: Mermaid flowchart string

        Returns:
            PlaybookGraph with nodes and edges
        """
        # Reset state for fresh parse
        self.nodes = []
        self.edges = []
        self.node_counter = 0
        self.edge_counter = 0
        self.node_id_map = {}
        self.subgraph_stack = []
        self.current_subgraph = None

        lines = content.split('\n')
        i = 0

        # Skip to flowchart/graph declaration
        while i < len(lines):
            line = lines[i].strip()
            if line.startswith('flowchart') or line.startswith('graph'):
                i += 1
                break
            i += 1

        # Parse lines
        while i < len(lines):
            line = lines[i].strip()

            # Skip empty lines and comments
            if not line or line.startswith('%%'):
                i += 1
                continue

            # Handle subgraph start
            if line.startswith('subgraph'):
                self._parse_subgraph_start(line)
                i += 1
                continue

            # Handle subgraph end
            if line == 'end':
                self._parse_subgraph_end()
                i += 1
                continue

            # Parse node definitions and edges
            self._parse_statement(line)
            i += 1

        return PlaybookGraph(nodes=self.nodes, edges=self.edges)

    def _parse_subgraph_start(self, line: str) -> None:
        """
        Parse subgraph declaration and create a phase node.

        Args:
            line: Subgraph line (e.g., "subgraph Setup Phase")
        """
        # Extract subgraph label
        match = re.match(r'subgraph\s+(.+)', line)
        if not match:
            return

        label = match.group(1).strip()

        # Create phase node for subgraph
        node_id = self._create_node_id()
        node = PlaybookNode(
            id=node_id,
            label=label,
            type="phase",
            metadata={"is_subgraph": True, "level": len(self.subgraph_stack) + 1}
        )
        self.nodes.append(node)

        # Push to stack
        self.subgraph_stack.append((node_id, label))
        self.current_subgraph = node_id

    def _parse_subgraph_end(self) -> None:
        """Handle end of subgraph block."""
        if self.subgraph_stack:
            self.subgraph_stack.pop()
            self.current_subgraph = self.subgraph_stack[-1][0] if self.subgraph_stack else None

    def _parse_statement(self, line: str) -> None:
        """
        Parse a Mermaid statement (node definition or edge).

        Args:
            line: Single line from Mermaid diagram
        """
        # Check if line contains an edge
        edge_found = False
        for edge_pattern, edge_type in self.EDGE_PATTERNS:
            if re.search(edge_pattern, line):
                self._parse_edge_statement(line, edge_pattern, edge_type)
                edge_found = True
                break

        # If no edge found, try to parse as standalone node
        if not edge_found:
            self._parse_node_definition(line)

    def _parse_edge_statement(self, line: str, edge_pattern: str, edge_type: str) -> None:
        """
        Parse a line containing an edge (e.g., "A-->B" or "A--text-->B").

        Args:
            line: Line containing edge definition
            edge_pattern: Regex pattern for the edge
            edge_type: Type of edge (solid, dotted, bold)
        """
        # Split by edge pattern
        parts = re.split(edge_pattern, line)

        if len(parts) < 2:
            return

        # Extract source node
        source_part = parts[0].strip()
        source_id, source_label, source_type = self._extract_node_info(source_part)

        # Get or create source node
        if source_id not in self.node_id_map:
            internal_id = self._create_node_id()
            self.node_id_map[source_id] = internal_id
            node = PlaybookNode(
                id=internal_id,
                label=source_label or source_id,
                type=source_type or "step",
                metadata={"mermaid_id": source_id, "subgraph": self.current_subgraph}
            )
            self.nodes.append(node)

        # Extract edge label if present (for labeled edges)
        edge_label = None
        target_part_idx = 1

        # Check if there's a label captured in the pattern
        if '(' in edge_pattern and len(parts) > 2:
            # Pattern captured a label
            edge_label = parts[1].strip()
            target_part_idx = 2

        # Extract target node(s) - handle multiple targets
        remaining = parts[target_part_idx] if target_part_idx < len(parts) else ""

        # Split by potential connectors for chained edges
        target_parts = re.split(r'(?:-->|-\.->|==>|---+>)', remaining)

        for target_part in target_parts:
            target_part = target_part.strip()
            if not target_part:
                continue

            target_id, target_label, target_type = self._extract_node_info(target_part)

            # Get or create target node
            if target_id not in self.node_id_map:
                internal_id = self._create_node_id()
                self.node_id_map[target_id] = internal_id
                node = PlaybookNode(
                    id=internal_id,
                    label=target_label or target_id,
                    type=target_type or "step",
                    metadata={"mermaid_id": target_id, "subgraph": self.current_subgraph}
                )
                self.nodes.append(node)

            # Create edge
            self._create_edge(
                self.node_id_map[source_id],
                self.node_id_map[target_id],
                label=edge_label,
                edge_type=edge_type
            )

    def _parse_node_definition(self, line: str) -> None:
        """
        Parse a standalone node definition.

        Args:
            line: Line containing node definition (e.g., "A[Start Process]")
        """
        node_id, label, node_type = self._extract_node_info(line)

        if node_id and node_id not in self.node_id_map:
            internal_id = self._create_node_id()
            self.node_id_map[node_id] = internal_id
            node = PlaybookNode(
                id=internal_id,
                label=label or node_id,
                type=node_type or "step",
                metadata={"mermaid_id": node_id, "subgraph": self.current_subgraph}
            )
            self.nodes.append(node)

    def _extract_node_info(self, text: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """
        Extract node ID, label, and type from text.

        Args:
            text: Node definition text (e.g., "A[Start]" or "B{Is Valid?}")

        Returns:
            Tuple of (node_id, label, node_type)
        """
        text = text.strip()

        # Try to match node ID with shape pattern
        for pattern, node_type in self.NODE_PATTERNS.items():
            # Build regex to capture ID and label
            full_pattern = r'([A-Za-z0-9_]+)\s*' + pattern
            match = re.match(full_pattern, text)

            if match:
                node_id = match.group(1)
                label = match.group(2).strip()
                return (node_id, label, node_type)

        # If no shape pattern matched, check for just an ID
        id_match = re.match(r'^([A-Za-z0-9_]+)$', text)
        if id_match:
            node_id = id_match.group(1)
            return (node_id, None, None)

        return (None, None, None)

    def _create_node_id(self) -> str:
        """
        Generate unique internal node ID.

        Returns:
            Node ID string
        """
        node_id = f"node_{self.node_counter}"
        self.node_counter += 1
        return node_id

    def _create_edge(
        self,
        source: str,
        target: str,
        label: Optional[str] = None,
        edge_type: str = "solid"
    ) -> None:
        """
        Create an edge between two nodes.

        Args:
            source: Source node ID
            target: Target node ID
            label: Optional edge label
            edge_type: Edge type (solid, dotted, bold)
        """
        edge_id = f"edge_{self.edge_counter}"
        self.edge_counter += 1

        edge = PlaybookEdge(
            id=edge_id,
            source=source,
            target=target,
            label=label
        )
        self.edges.append(edge)
