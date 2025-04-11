import fetch from "cross-fetch";

/**
 * Planner calls local LLM to decide what resources to fetch
 * Semantic Routing, considering: https://github.com/aurelio-labs/semantic-router
 */
export async function runPlanner(userMessage: string) {
  const planPrompt = `
    You are a helpful planner.
    User's message: "${userMessage}"
    Decide if we need any resources from local markdown,
    then rewrite the user question for final answer.
    Respond in JSON, e.g.:
    {
      "resources": ["docs://chapter1"],
      "finalQuestion": "some restated question"
    }`;

  const resp = await fetch("http://localhost:8000/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: planPrompt,
      max_new_tokens: 200,
    }),
  });
  const data = await resp.json();

  try {
    const plan = JSON.parse(data.generated_text);
    return plan;
  } catch {
    return {
      resources: [],
      finalQuestion: userMessage,
    };
  }
}
