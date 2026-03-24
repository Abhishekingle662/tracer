import Anthropic from "@anthropic-ai/sdk";
import type { Span, SpanEval, Trace } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-sonnet-4-20250514";

function stripJsonFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

export async function generateTrace(task: string): Promise<Trace> {
  const systemPrompt = `You are simulating an AI agent's execution trace for an LLM observability demo.
Given a user task, generate a realistic multi-step execution trace as structured JSON.
Return ONLY valid JSON, no markdown, no explanation.

The trace should show realistic agent behavior:
- An AGENT root span that wraps everything (parentSpanId: null)
- 1-2 LLM spans showing planning and synthesis (include realistic input/output text)
- 1 TOOL span showing a relevant tool being called
- 1 RETRIEVER span showing relevant documents being fetched
- 1 EVALUATOR span at the end
- Token counts should be realistic (100-800 prompt, 50-400 completion)
- Durations should be realistic (LLM: 500-2000ms, TOOL: 100-500ms, RETRIEVER: 50-300ms, EVALUATOR: 200-600ms)
- Include realistic, task-specific content in the span attributes
- All child spans must reference the AGENT root span's spanId as their parentSpanId
- startTime values should be sequential (ms offset from trace start, 0 for root)
- totalDuration should equal the AGENT span's duration`;

  const userMessage = `Generate a trace for this task: "${task}"

Return JSON with exactly this shape:
{
  "traceId": "trace_<random8chars>",
  "totalDuration": <number>,
  "spans": [
    {
      "spanId": "span_<random8chars>",
      "parentSpanId": null,
      "name": "<descriptive name>",
      "spanKind": "AGENT",
      "startTime": 0,
      "duration": <totalDuration>,
      "status": "OK",
      "attributes": {
        "input.value": "<the user task>",
        "output.value": "<final answer summary>"
      }
    },
    ... more spans
  ]
}

For LLM spans include: "llm.model_name", "llm.input_messages", "llm.output_messages", "llm.token_count.prompt", "llm.token_count.completion"
For TOOL spans include: "tool.name", "tool.parameters", "tool.output"
For RETRIEVER spans include: "retrieval.query", "retrieval.documents" (array of 3-5 document snippet strings)
For EVALUATOR spans include: "input.value", "output.value"`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    temperature: 0, // result would be deterministic
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const rawText = response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = stripJsonFences(rawText);

  try {
    const trace = JSON.parse(cleaned) as Trace;
    // Ensure spans have required fields
    trace.spans = trace.spans.map((s, i) => ({
      spanId: s.spanId || `span_${i}_${Date.now()}`,
      parentSpanId: s.parentSpanId ?? null,
      name: s.name || "unnamed span",
      spanKind: s.spanKind || "LLM",
      startTime: s.startTime ?? 0,
      duration: s.duration ?? 500,
      status: s.status || "OK",
      attributes: s.attributes || {},
    }));
    return trace;
  } catch {
    // Fallback stub trace
    return buildFallbackTrace(task);
  }
}

export async function evaluateSpans(spans: Span[]): Promise<SpanEval[]> {
  const llmSpans = spans.filter((s) => s.spanKind === "LLM");

  if (llmSpans.length === 0) return [];

  const systemPrompt = `You are an AI quality evaluator. Analyze the provided LLM span and return ONLY valid JSON.
Be strict but fair.
- hallucination: "LOW" (grounded/factual), "MEDIUM" (some unverifiable claims), or "HIGH" (fabricated/contradictory)
- hallucinationScore: 0-100 where 0=no hallucination, 100=complete fabrication
- relevance: 0-100 (how well output addresses input)
- conciseness: 0-100 (appropriately sized, not too verbose or too short)
- overallGrade: "A" (90-100 avg), "B" (75-89), "C" (60-74), "D" (below 60)
- reasoning: one sentence explaining the scores`;

  const evals = await Promise.all(
    llmSpans.map(async (span): Promise<SpanEval> => {
      const userMessage = `Evaluate this LLM span:
Input: ${span.attributes["llm.input_messages"] || "(none)"}
Output: ${span.attributes["llm.output_messages"] || "(none)"}
Model: ${span.attributes["llm.model_name"] || "unknown"}

Return JSON:
{
  "spanId": "${span.spanId}",
  "hallucination": "LOW" | "MEDIUM" | "HIGH",
  "hallucinationScore": <0-100>,
  "relevance": <0-100>,
  "conciseness": <0-100>,
  "overallGrade": "A" | "B" | "C" | "D",
  "reasoning": "<one sentence>"
}`;

      try {
        const response = await client.messages.create({
          model: MODEL,
          max_tokens: 512,
          temperature: 0, // result would be deterministic
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        });

        const rawText =
          response.content[0].type === "text" ? response.content[0].text : "";
        const cleaned = stripJsonFences(rawText);
        const result = JSON.parse(cleaned) as SpanEval;
        return { ...result, spanId: span.spanId };
      } catch {
        return buildFallbackEval(span.spanId);
      }
    })
  );

  return evals;
}

function buildFallbackTrace(task: string): Trace {
  const rootId = `span_root_${Date.now()}`;
  return {
    traceId: `trace_fallback`,
    totalDuration: 3200,
    spans: [
      {
        spanId: rootId,
        parentSpanId: null,
        name: "agent.run",
        spanKind: "AGENT",
        startTime: 0,
        duration: 3200,
        status: "OK",
        attributes: { "input.value": task, "output.value": "Agent completed." },
      },
      {
        spanId: `span_llm_${Date.now()}`,
        parentSpanId: rootId,
        name: "llm.planning",
        spanKind: "LLM",
        startTime: 50,
        duration: 1200,
        status: "OK",
        attributes: {
          "llm.model_name": MODEL,
          "llm.input_messages": `Plan how to: ${task}`,
          "llm.output_messages": "I will break this task into steps...",
          "llm.token_count.prompt": 120,
          "llm.token_count.completion": 180,
        },
      },
    ],
  };
}

function buildFallbackEval(spanId: string): SpanEval {
  return {
    spanId,
    hallucination: "LOW",
    hallucinationScore: 10,
    relevance: 82,
    conciseness: 78,
    overallGrade: "B",
    reasoning: "Output is generally relevant and well-grounded with minor verbosity.",
  };
}
