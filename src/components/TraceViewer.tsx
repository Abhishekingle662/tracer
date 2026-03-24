"use client";

import { useState } from "react";
import { Trace, Span, SpanKind } from "@/lib/types";
import SpanNode from "./SpanNode";
import clsx from "clsx";

const KIND_TIMELINE_COLOR: Record<SpanKind, string> = {
  AGENT: "bg-tracer-agent",
  LLM: "bg-tracer-llm",
  TOOL: "bg-tracer-tool",
  RETRIEVER: "bg-tracer-retriever",
  EVALUATOR: "bg-tracer-evaluator",
};

interface TraceViewerProps {
  trace: Trace | null;
}

export default function TraceViewer({ trace }: TraceViewerProps) {
  const [copyDone, setCopyDone] = useState(false);

  if (!trace) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-center p-8">
        <EmptyStateIcon />
        <div>
          <p className="text-tracer-secondary font-medium">No trace yet</p>
          <p className="text-sm text-tracer-border mt-1">
            Run an agent task to see the trace tree
          </p>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(trace, null, 2));
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  };

  // Build tree: map parentSpanId → children
  const childMap = new Map<string | null, Span[]>();
  const sorted = [...trace.spans].sort((a, b) => a.startTime - b.startTime);
  for (const span of sorted) {
    const key = span.parentSpanId;
    if (!childMap.has(key)) childMap.set(key, []);
    childMap.get(key)!.push(span);
  }

  function renderTree(parentId: string | null, depth: number): React.ReactNode {
    const children = childMap.get(parentId) ?? [];
    return children.map((span) => {
      const grandchildren = renderTree(span.spanId, depth + 1);
      return (
        <SpanNode key={span.spanId} span={span} depth={depth}>
          {grandchildren}
        </SpanNode>
      );
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-tracer-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-tracer-secondary font-mono">
              Trace{" "}
              <span className="text-tracer-primary">{trace.traceId}</span>
            </p>
            <p className="text-xs text-tracer-secondary">
              {trace.spans.length} spans &middot;{" "}
              <span className="text-tracer-primary font-medium">
                {trace.totalDuration}ms total
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
            copyDone
              ? "border-tracer-evaluator/50 text-tracer-evaluator bg-tracer-evaluator/10"
              : "border-tracer-border text-tracer-secondary hover:text-tracer-primary hover:border-tracer-secondary/50 bg-tracer-bg"
          )}
        >
          {copyDone ? <CheckSmall /> : <CopyIcon />}
          {copyDone ? "Copied!" : "Copy JSON"}
        </button>
      </div>

      {/* Timeline */}
      <div className="px-4 py-3 border-b border-tracer-border flex-shrink-0">
        <p className="text-[10px] text-tracer-secondary uppercase tracking-wider mb-2 font-semibold">
          Timeline
        </p>
        <div className="relative h-5 bg-tracer-bg rounded overflow-hidden border border-tracer-border/50">
          {sorted.map((span) => {
            const left = (span.startTime / trace.totalDuration) * 100;
            const width = Math.max((span.duration / trace.totalDuration) * 100, 0.5);
            return (
              <div
                key={span.spanId}
                className={clsx(
                  "absolute top-1 h-3 rounded-sm opacity-80",
                  KIND_TIMELINE_COLOR[span.spanKind]
                )}
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${span.name} (${span.duration}ms)`}
              />
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-2">
          {(
            Object.entries(KIND_TIMELINE_COLOR) as [SpanKind, string][]
          ).map(([kind, colorClass]) => (
            <span key={kind} className="flex items-center gap-1">
              <span className={clsx("w-2 h-2 rounded-sm", colorClass)} />
              <span className="text-[10px] text-tracer-secondary">{kind}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Span tree */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {renderTree(null, 0)}
      </div>
    </div>
  );
}

function EmptyStateIcon() {
  return (
    <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-tracer-border flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-tracer-border"
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckSmall() {
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
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
