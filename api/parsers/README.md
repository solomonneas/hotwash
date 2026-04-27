# Markdown Parser Documentation

## Overview

The Markdown Parser converts structured markdown playbooks into a node/edge graph format compatible with React Flow. It enables visual representation of operational playbooks, runbooks, and incident response procedures.

## Features

### Supported Markdown Elements

1. **Headers (H1/H2)** → Phase Nodes
   - `# Main Phase` → Creates a phase node (level 1)
   - `## Sub Phase` → Creates a phase node (level 2)

2. **Numbered Lists** → Sequential Step Nodes
   - `1. First step` → Creates sequential step nodes
   - `2. Second step` → Connected in order

3. **Bullet Points with Decision Keywords** → Decision Nodes
   - `- If condition` → Creates decision node with branches
   - `- When event` → Creates decision node
   - `- Else` / `- Otherwise` → Alternative branches

4. **Code Blocks** → Execute Nodes
   - ` ```bash ... ``` ` → Creates execute node with code content
   - Preserves language specification and code content

## Usage

### Basic Example

```python
from api.parsers.markdown_parser import MarkdownParser

parser = MarkdownParser()
content = """
# Deployment Process

1. Run tests
2. Build application

- If tests pass
  - Deploy to production
  - Monitor metrics
"""

graph = parser.parse(content)

# Access nodes and edges
print(f"Nodes: {len(graph.nodes)}")
print(f"Edges: {len(graph.edges)}")

# Convert to JSON for React Flow
graph_dict = graph.model_dump()
```

### Sample Playbook

```markdown
# Incident Response Playbook

## Initial Assessment

1. Receive alert notification
2. Verify alert legitimacy
3. Classify incident severity

- If severity is critical
  - Activate emergency response team
  - Notify management immediately
- Else
  - Assign to on-call engineer

## Investigation

```bash
grep ERROR /var/log/app.log | tail -100
systemctl status app.service
```

1. Gather system logs
2. Identify affected systems
3. Document findings

## Remediation

- When root cause is identified
  - Apply fix
  - Test solution
- Otherwise
  - Escalate to senior engineer

1. Update incident report
2. Schedule post-mortem
```

## Output Format

The parser returns a `PlaybookGraph` object with:

### Node Structure

```python
{
    "id": "node_0",
    "label": "Deploy to Production",
    "type": "step",  # or "phase", "decision", "execute", "merge"
    "metadata": {
        "step_type": "sequential",
        # Additional context-specific metadata
    }
}
```

### Node Types

- **phase**: H1/H2 headers representing major phases
- **step**: Sequential steps from numbered lists or regular bullets
- **decision**: Conditional branches (if/when/else)
- **execute**: Code blocks with executable content
- **merge**: Automatic merge points after decision branches

### Edge Structure

```python
{
    "id": "edge_0",
    "source": "node_0",
    "target": "node_1",
    "label": "yes"  # Optional, used for decision branches
}
```

## Testing

### Run Tests

```bash
# After installing dependencies
make install

# Run all tests
make test

# Or run pytest directly
python3 -m pytest api/tests/test_markdown_parser.py -v

# Or run manual test suite (no pytest required)
python3 api/tests/run_parser_tests.py
```

### Test Coverage

The test suite includes:
- Empty content handling
- Header parsing (H1/H2)
- Sequential numbered lists
- Regular bullet points
- Decision nodes with if/when/else
- Code blocks with/without language
- Complex nested structures
- React Flow compatibility validation
- Realistic incident response playbook

## Implementation Details

### Parsing Algorithm

1. **Line-by-line Processing**: Iterates through markdown lines
2. **Pattern Matching**: Identifies element types via regex
3. **State Management**: Tracks last node for edge creation
4. **Phase Hierarchy**: Maintains stack for nested phases
5. **Decision Detection**: Scans for keywords (if/when/else)
6. **Branch Parsing**: Looks ahead for indented items
7. **Edge Creation**: Automatically connects sequential elements

### Decision Node Logic

When a bullet point contains decision keywords:
1. Creates a decision node with the condition
2. Looks ahead for indented sub-items (branches)
3. Creates branch nodes for each sub-item
4. Adds edge labels ("yes"/"no") for clarity
5. Creates merge node if multiple branches exist
6. Connects all branches to merge point

### Code Block Parsing

1. Detects opening ` ``` ` with optional language
2. Collects all lines until closing ` ``` `
3. Creates execute node with:
   - Label: "Execute {language}"
   - Metadata containing full code content
   - Language specification for syntax highlighting

## React Flow Integration

The output format is directly compatible with React Flow:

```javascript
// In React component
import ReactFlow from 'reactflow';

function PlaybookVisualization({ graph }) {
  return (
    <ReactFlow
      nodes={graph.nodes}
      edges={graph.edges}
      fitView
    />
  );
}
```

### Custom Node Types

To render different node types in React Flow:

```javascript
const nodeTypes = {
  phase: PhaseNode,
  step: StepNode,
  decision: DecisionNode,
  execute: ExecuteNode,
  merge: MergeNode,
};

<ReactFlow nodeTypes={nodeTypes} ... />
```

## Error Handling

The parser is designed to be forgiving:
- Skips unrecognized patterns
- Continues parsing on malformed input
- Returns partial results rather than failing
- Empty content returns empty graph (not an error)

## Future Enhancements

Potential improvements:
- Mermaid diagram format support
- YAML frontmatter metadata
- Link detection for cross-references
- Parallel path detection
- Loop/iteration support
- Swimlane/actor assignment

## API Reference

### `MarkdownParser`

#### Methods

##### `parse(content: str) -> PlaybookGraph`

Parses markdown content into a flowchart graph.

**Parameters:**
- `content` (str): Markdown string to parse

**Returns:**
- `PlaybookGraph`: Object containing nodes and edges lists

**Example:**
```python
parser = MarkdownParser()
graph = parser.parse("# Test\n1. Step one\n2. Step two")
```

### `PlaybookGraph`

#### Attributes

- `nodes` (List[PlaybookNode]): List of all nodes in the graph
- `edges` (List[PlaybookEdge]): List of all edges connecting nodes

#### Methods

- `model_dump()`: Converts to dictionary (for JSON serialization)

## Contributing

When modifying the parser:
1. Add tests for new functionality
2. Maintain backward compatibility
3. Update this documentation
4. Follow existing code patterns
5. Preserve React Flow compatibility

## License

Part of the Hotwash project.
