"use client";

import { useState, ReactNode } from "react";
import { Span, SpanKind } from "@/lib/types";
import clsx from "clsx";

const KIND_BG: Record<SpanKind, string> = {
  AGENT: "bg-tracer-agent",
  LLM: "bg-tracer-llm",
  TOOL: "bg-tracer-tool",
  RETRIEVER: "bg-tracer-retriever",
  EVALUATOR: "bg-tracer-evaluator",
};

const KIND_BORDER: Record<SpanKind, string> = {
  AGENT: "border-tracer-agent/40",
  LLM: "border-tracer-llm/40",
  TOOL: "border-tracer-tool/40",
  RETRIEVER: "border-tracer-retriever/40",
  EVALUATOR: "border-tracer-evaluator/40",
};

const KIND_TEXT: Record<SpanKind, string> = {
  AGENT: "text-tracer-agent",
  LLM: "text-tracer-llm",
  TOOL: "text-tracer-tool",
  RETRIEVER: "text-tracer-retriever",
  EVALUATOR: "text-tracer-evaluator",
};

interface SpanNodeProps {
  span: Span;
  children?: ReactNode;
  depth?: number;
}

export default function SpanNode({ span, children, depth = 0 }: SpanNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = !!children;
  const hasAttributes = Object.keys(span.attributes).length > 0;

  return (
    <div className={clsx("relative", depth > 0 && "ml-6 mt-1")}>
      {/* Connector line for non-root nodes */}
      {depth > 0 && (
        <div className="absolute left-[-16px] top-0 bottom-0 w-px bg-tracer-border/50" />
      )}

      {/* Span card */}
      <div
        className={clsx(
          "rounded-lg border bg-tracer-surface transition-all duration-200",
          KIND_BORDER[span.spanKind],
          (hasChildren || hasAttributes) && "cursor-pointer hover:border-opacity-70",
          expanded && "shadow-lg"
        )}
      >
        {/* Header row */}
        <div
          className="flex items-center gap-2.5 px-3 py-2.5"
          onClick={() => (hasChildren || hasAttributes) && setExpanded((e) => !e)}
        >
          {/* Expand toggle */}
          <span className="text-tracer-secondary w-3 flex-shrink-0">
            {hasChildren || hasAttributes ? (
              <ChevronIcon expanded={expanded} />
            ) : (
              <span className="w-2 h-2 rounded-full bg-tracer-border inline-block" />
            )}
          </span>

          {/* Kind badge */}
          <span
            className={clsx(
              "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase",
              KIND_BG[span.spanKind],
              "text-white"
            )}
          >
            {span.spanKind}
          </span>

          {/* Span name */}
          <span className="flex-1 text-sm font-medium text-tracer-primary truncate">
            {span.name}
          </span>

          {/* Duration */}
          <span className="text-xs text-tracer-secondary font-mono flex-shrink-0">
            {span.duration}ms
          </span>

          {/* Status */}
          <span
            className={clsx(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0",
              span.status === "OK"
                ? "bg-tracer-evaluator/10 text-tracer-evaluator"
                : "bg-red-500/10 text-red-400"
            )}
          >
            {span.status}
          </span>
        </div>

        {/* Expanded details */}
        {expanded && hasAttributes && (
          <div className="border-t border-tracer-border/50 px-4 py-3 space-y-3">
            <AttributeDetails span={span} kindTextClass={KIND_TEXT[span.spanKind]} />
          </div>
        )}
      </div>

      {/* Children */}
      {expanded && children && (
        <div className="mt-1">{children}</div>
      )}
    </div>
  );
}

function AttributeDetails({
  span,
  kindTextClass,
}: {
  span: Span;
  kindTextClass: string;
}) {
  const attrs = span.attributes;

  if (span.spanKind === "LLM") {
    return (
      <>
        {attrs["llm.model_name"] && (
          <AttrRow label="Model" value={attrs["llm.model_name"]} accent={kindTextClass} />
        )}
        {(attrs["llm.token_count.prompt"] !== undefined ||
          attrs["llm.token_count.completion"] !== undefined) && (
          <div className="flex gap-4">
            <AttrRow
              label="Prompt tokens"
              value={String(attrs["llm.token_count.prompt"] ?? "—")}
              accent={kindTextClass}
              inline
            />
            <AttrRow
              label="Completion tokens"
              value={String(attrs["llm.token_count.completion"] ?? "—")}
              accent={kindTextClass}
              inline
            />
          </div>
        )}
        {attrs["llm.input_messages"] && (
          <AttrBlock label="Input" value={attrs["llm.input_messages"]} accent={kindTextClass} />
        )}
        {attrs["llm.output_messages"] && (
          <AttrBlock label="Output" value={attrs["llm.output_messages"]} accent={kindTextClass} />
        )}
      </>
    );
  }

  if (span.spanKind === "TOOL") {
    return (
      <>
        {attrs["tool.name"] && (
          <AttrRow label="Tool" value={attrs["tool.name"]} accent={kindTextClass} />
        )}
        {attrs["tool.parameters"] && (
          <AttrBlock label="Parameters" value={attrs["tool.parameters"]} accent={kindTextClass} code />
        )}
        {attrs["tool.output"] && (
          <AttrBlock label="Output" value={attrs["tool.output"]} accent={kindTextClass} />
        )}
      </>
    );
  }

  if (span.spanKind === "RETRIEVER") {
    return (
      <>
        {attrs["retrieval.query"] && (
          <AttrRow label="Query" value={attrs["retrieval.query"]} accent={kindTextClass} />
        )}
        {attrs["retrieval.documents"] && (
          <div>
            <p className="text-[11px] font-semibold text-tracer-secondary uppercase tracking-wider mb-1.5">
              Retrieved Documents ({attrs["retrieval.documents"].length})
            </p>
            <div className="space-y-1.5">
              {attrs["retrieval.documents"].map((doc, i) => (
                <div
                  key={i}
                  className="text-xs text-tracer-secondary bg-tracer-bg rounded p-2 border border-tracer-border/50"
                >
                  <span className={clsx("font-semibold mr-1.5", kindTextClass)}>
                    [{i + 1}]
                  </span>
                  {doc}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  if (span.spanKind === "AGENT" || span.spanKind === "EVALUATOR") {
    return (
      <>
        {attrs["input.value"] && (
          <AttrBlock label="Input" value={attrs["input.value"]} accent={kindTextClass} />
        )}
        {attrs["output.value"] && (
          <AttrBlock label="Output" value={attrs["output.value"]} accent={kindTextClass} />
        )}
      </>
    );
  }

  return null;
}

function AttrRow({
  label,
  value,
  accent,
  inline,
}: {
  label: string;
  value: string;
  accent: string;
  inline?: boolean;
}) {
  return (
    <div className={clsx("flex", inline ? "flex-col" : "items-center gap-2")}>
      <span className="text-[11px] font-semibold text-tracer-secondary uppercase tracking-wider flex-shrink-0">
        {label}
      </span>
      <span className={clsx("text-xs font-mono", accent)}>{value}</span>
    </div>
  );
}

function AttrBlock({
  label,
  value,
  accent,
  code,
}: {
  label: string;
  value: string;
  accent: string;
  code?: boolean;
}) {
  return (
    <div>
      <p className={clsx("text-[11px] font-semibold uppercase tracking-wider mb-1", "text-tracer-secondary")}>
        {label}
      </p>
      <div
        className={clsx(
          "text-xs rounded p-2.5 bg-tracer-bg border border-tracer-border/50 max-h-32 overflow-y-auto",
          code ? "font-mono text-tracer-secondary" : "text-tracer-primary leading-relaxed"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx("transition-transform duration-200", expanded && "rotate-90")}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
