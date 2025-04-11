import express, { Request, Response } from "express";
import cors from "cors";
import fetch from "cross-fetch";
import { runPlanner } from "./planner.js";
import { createMcpConnections, McpConnections } from "./mcpConnections.js";

let mcp: McpConnections;

const app = express();
app.use(express.json());
app.use(cors());

app.post("/chat", async (req: Request, res: Response): Promise<any> => {
  try {
    const { userMessage } = req.body;

    // "Semantic routing" or simple logic
    const plan = await runPlanner(userMessage);

    // If plan suggests resources => fetch from localMarkdownClient
    let contextFromMarkdown = "";
    if (plan.resources && plan.resources.length > 0) {
      const promises = plan.resources.map(async (uri: string) => {
        const resource = await mcp.localMarkdownClient.readResource({ uri });
        return resource.contents?.map((c) => c.text).join("\n") ?? "";
      });
      const results = await Promise.all(promises);
      contextFromMarkdown = results.join("\n");
    }

    // Build final prompt
    const finalPrompt = `
      Context:
      ${contextFromMarkdown}

      User: ${plan.finalQuestion}
      Assistant:
    `;

    // Call local LLM inference server
    const response = await fetch("http://localhost:8000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: finalPrompt,
        max_new_tokens: 150,
        temperature: 0.7,
      }),
    });
    if (!response.ok) {
      throw new Error(`LLM error: ${response.statusText}`);
    }
    const { generated_text } = await response.json();

    // Return augmented inference to UI
    return res.json({
      role: "assistant",
      content: generated_text,
    });
  } catch (err: any) {
    console.error("Error in /chat:", err);
    return res.status(500).json({ error: err.toString() });
  }
});

async function start() {
  try {
    mcp = await createMcpConnections();
    console.log("All MCP connections established!");

    const PORT = process.env.MCP_CLIENT_PORT || 3000;
    app.listen(PORT, () => {
      console.log(`MCP Client listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to initialize MCP connections:", err);
    process.exit(1);
  }
}

start();

process.on("SIGINT", () => {
  console.log("Shutting down MCP Client...");
  process.exit(0);
});
