import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export interface McpConnections {
  localMarkdownClient: Client;
}

/**
 * Creates and initializes the MCP Clients for your various servers
 * Uses auto-spawn for local markdown server
 */
export async function createMcpConnections(): Promise<McpConnections> {
  // Create a transport that auto-spawns the server process
  const localMarkdownTransport = new StdioClientTransport({
    command: "node",
    args: ["../mcp-local-markdown-server/dist/index.js"],
    // env: { ... },
    // stderr: "inherit", // or "pipe", or "overlapped"
  });

  // Start the transport to spawn the process
  await localMarkdownTransport.start();

  // Create the MCP Client and connect
  const localMarkdownClient = new Client({
    name: "mcp-client",
    version: "0.1.0",
  });
  await localMarkdownClient.connect(localMarkdownTransport);

  console.log("Connected to local-markdown-server via auto-spawned STDIO transport.");

  // Return connections
  return {
    localMarkdownClient,
  };
}
