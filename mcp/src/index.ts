import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { HotwashClient } from "./client.js";
import { getConfig } from "./config.js";
import { registerArtifactTools } from "./tools/artifacts.js";
import { registerPlaybookTools } from "./tools/playbooks.js";
import { registerRunTools } from "./tools/runs.js";
import { registerSuggestionTools } from "./tools/suggestions.js";

async function main(): Promise<void> {
  const config = getConfig();

  const server = new McpServer({
    name: "hotwash-mcp",
    version: "0.3.0",
    description:
      "Drive Hotwash incident response playbooks: list playbooks, start runs against incidents, advance steps, attach evidence, query timelines, and review the Wazuh ingest suggestion queue. Wraps the Hotwash REST API.",
  });

  const client = new HotwashClient(config);

  registerPlaybookTools(server, client);
  registerRunTools(server, client);
  registerArtifactTools(server, client);
  registerSuggestionTools(server, client);

  const transport = new StdioServerTransport();
  // Strip the draft-07 `$schema` the MCP SDK stamps on tool schemas; Anthropic
  // rejects it ("must match JSON Schema draft 2020-12") when the full tool set
  // is sent, e.g. on subagent spawns. Intercept tools/list output here.
  const __send = transport.send.bind(transport);
  (transport as any).send = (message: any) => {
    const tools = message?.result?.tools;
    if (Array.isArray(tools)) {
      for (const t of tools) {
        if (t?.inputSchema) delete t.inputSchema.$schema;
        if (t?.outputSchema) delete t.outputSchema.$schema;
      }
    }
    return __send(message);
  };
  await server.connect(transport);
}

main().catch((error) => {
  console.error("hotwash-mcp failed to start:", error);
  process.exit(1);
});
