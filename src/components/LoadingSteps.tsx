"use client";

import { SpanKind } from "@/lib/types";

interface Step {
  label: string;
  kind: SpanKind;
}

const STEPS: Step[] = [
  { label: "Initializing agent...", kind: "AGENT" },
  { label: "Calling LLM for planning...", kind: "LLM" },
  { label: "Executing tool...", kind: "TOOL" },
  { label: "Retrieving context...", kind: "RETRIEVER" },
  { label: "Synthesizing response...", kind: "LLM" },
  { label: "Running evaluations...", kind: "EVALUATOR" },
];

const KIND_COLOR: Record<SpanKind, string> = {
  AGENT: "text-tracer-agent",
  LLM: "text-tracer-llm",
  TOOL: "text-tracer-tool",
  RETRIEVER: "text-tracer-retriever",
  EVALUATOR: "text-tracer-evaluator",
};

const KIND_DOT: Record<SpanKind, string> = {
  AGENT: "bg-tracer-agent",
  LLM: "bg-tracer-llm",
  TOOL: "bg-tracer-tool",
  RETRIEVER: "bg-tracer-retriever",
  EVALUATOR: "bg-tracer-evaluator",
};

interface LoadingStepsProps {
  currentStep: number;
}

export default function LoadingSteps({ currentStep }: LoadingStepsProps) {
  return (
    <div className="mt-4 space-y-2">
      {STEPS.map((step, idx) => {
        const isDone = idx < currentStep;
        const isActive = idx === currentStep;
        const isPending = idx > currentStep;

        return (
          <div
            key={idx}
            className={`flex items-center gap-3 py-1.5 px-3 rounded-lg transition-all duration-300 ${
              isActive ? "bg-tracer-surface/60" : ""
            }`}
          >
            {/* Indicator */}
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              {isDone ? (
                <CheckIcon />
              ) : isActive ? (
                <span
                  className={`w-2.5 h-2.5 rounded-full ${KIND_DOT[step.kind]} animate-pulse`}
                />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-tracer-border" />
              )}
            </div>

            {/* Label */}
            <span
              className={`text-sm font-medium transition-colors ${
                isDone
                  ? "text-tracer-secondary line-through"
                  : isActive
                  ? KIND_COLOR[step.kind]
                  : isPending
                  ? "text-tracer-border"
                  : "text-tracer-secondary"
              }`}
            >
              {step.label}
            </span>

            {/* Active badge */}
            {isActive && (
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-tracer-secondary">
                {step.kind}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-tracer-evaluator"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
