export type SpanKind = "AGENT" | "LLM" | "TOOL" | "RETRIEVER" | "EVALUATOR";
export type SpanStatus = "OK" | "ERROR";

export interface SpanAttributes {
  // LLM spans
  "llm.model_name"?: string;
  "llm.input_messages"?: string;
  "llm.output_messages"?: string;
  "llm.token_count.prompt"?: number;
  "llm.token_count.completion"?: number;
  // TOOL spans
  "tool.name"?: string;
  "tool.parameters"?: string;
  "tool.output"?: string;
  // RETRIEVER spans
  "retrieval.documents"?: string[];
  "retrieval.query"?: string;
  // AGENT spans
  "input.value"?: string;
  "output.value"?: string;
}

export interface Span {
  spanId: string;
  parentSpanId: string | null;
  name: string;
  spanKind: SpanKind;
  startTime: number;   // ms offset from trace start
  duration: number;    // ms
  status: SpanStatus;
  attributes: SpanAttributes;
}

export interface Trace {
  traceId: string;
  spans: Span[];
  totalDuration: number;
}

export interface SpanEval {
  spanId: string;
  hallucination: "LOW" | "MEDIUM" | "HIGH";
  hallucinationScore: number;
  relevance: number;      // 0–100
  conciseness: number;    // 0–100
  overallGrade: "A" | "B" | "C" | "D";
  reasoning: string;
}
