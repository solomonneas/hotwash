"""
Data Models for Hotwash API

Defines Pydantic models for request/response validation and type safety.
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class PlaybookNode(BaseModel):
    """Represents a single node in the playbook flowchart."""
    id: str = Field(..., description="Unique node identifier")
    label: str = Field(..., description="Display label for the node")
    type: str = Field(default="default", description="Node type (default, decision, start, end)")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional node metadata")


class PlaybookEdge(BaseModel):
    """Represents a connection between two nodes."""
    id: str = Field(..., description="Unique edge identifier")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    label: Optional[str] = Field(default=None, description="Edge label (e.g., 'yes', 'no')")


class PlaybookGraph(BaseModel):
    """Complete flowchart graph structure."""
    nodes: List[PlaybookNode] = Field(default_factory=list, description="List of nodes")
    edges: List[PlaybookEdge] = Field(default_factory=list, description="List of edges")


class PlaybookRequest(BaseModel):
    """Request to parse a playbook."""
    content: str = Field(..., description="Markdown or mermaid content to parse")
    format: str = Field(default="markdown", description="Input format (markdown or mermaid)")


class PlaybookResponse(BaseModel):
    """Response containing parsed playbook graph."""
    graph: PlaybookGraph = Field(..., description="Parsed flowchart graph")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Parsing metadata")
    errors: List[str] = Field(default_factory=list, description="Parsing errors or warnings")


class ParseRequest(BaseModel):
    """Request model for POST /api/parse endpoint."""
    content: str = Field(..., description="Markdown or mermaid text to parse", min_length=1)
    format: Optional[Literal['markdown', 'mermaid']] = Field(
        default=None,
        description="Input format (markdown or mermaid). Auto-detects if not specified."
    )


class ParseMetadata(BaseModel):
    """Metadata about the parsing operation."""
    title: Optional[str] = Field(default=None, description="Extracted title from content")
    description: Optional[str] = Field(default=None, description="Extracted description")
    format: str = Field(..., description="Detected or specified format")
    node_count: int = Field(..., description="Number of nodes in the graph")
    edge_count: int = Field(..., description="Number of edges in the graph")


class ParseResponse(BaseModel):
    """Response model for POST /api/parse endpoint."""
    nodes: List[PlaybookNode] = Field(..., description="List of flowchart nodes")
    edges: List[PlaybookEdge] = Field(..., description="List of flowchart edges")
    metadata: ParseMetadata = Field(..., description="Parsing metadata")


class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str = Field(..., description="Error message")
    error_type: Optional[str] = Field(default=None, description="Error category")
