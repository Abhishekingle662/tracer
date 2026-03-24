"use client";

import { Span, SpanEval } from "@/lib/types";
import clsx from "clsx";

interface EvalPanelProps {
  evals: SpanEval[];
  spans: Span[];
  isEvaluating: boolean;
}

export default function EvalPanel({
  evals,
  spans,
  isEvaluating,
}: EvalPanelProps) {
  if (evals.length === 0 && !isEvaluating) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-center p-6">
        <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-tracer-border flex items-center justify-center">
          <ScoreIcon />
        </div>
        <div>
          <p className="text-tracer-secondary font-medium text-sm">No evaluations yet</p>
          <p className="text-xs text-tracer-border mt-1">
            Run an agent task to auto-evaluate LLM spans
          </p>
        </div>
      </div>
    );
  }

  if (isEvaluating && evals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
        <div className="w-6 h-6 border-2 border-tracer-evaluator border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-tracer-secondary">Running evaluations...</p>
      </div>
    );
  }

  // Aggregate stats
  const avgRelevance = Math.round(evals.reduce((s, e) => s + e.relevance, 0) / evals.length);
  const avgConciseness = Math.round(evals.reduce((s, e) => s + e.conciseness, 0) / evals.length);
  const gradeCounts = evals.reduce(
    (acc, e) => ({ ...acc, [e.overallGrade]: (acc[e.overallGrade] || 0) + 1 }),
    {} as Record<string, number>
  );
  const topGrade = Object.entries(gradeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as "A" | "B" | "C" | "D";
  const hallucinationHigh = evals.filter((e) => e.hallucination === "HIGH").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-tracer-border flex-shrink-0">
        <h2 className="text-sm font-semibold text-tracer-primary">Evaluations</h2>
        <p className="text-xs text-tracer-secondary mt-0.5">
          {evals.length} LLM span{evals.length !== 1 ? "s" : ""} evaluated
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Summary card */}
        <div className="m-3 p-3 rounded-xl border border-tracer-border bg-tracer-bg">
          <p className="text-[10px] font-semibold text-tracer-secondary uppercase tracking-wider mb-2.5">
            Aggregate Summary
          </p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <StatTile
              label="Avg Relevance"
              value={`${avgRelevance}`}
              unit="%"
              color={scoreColor(avgRelevance)}
            />
            <StatTile
              label="Avg Concise"
              value={`${avgConciseness}`}
              unit="%"
              color={scoreColor(avgConciseness)}
            />
            <StatTile
              label="Top Grade"
              value={topGrade || "—"}
              color={gradeColor(topGrade)}
            />
          </div>
          {hallucinationHigh > 0 && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <p className="text-xs text-red-400">
                {hallucinationHigh} span{hallucinationHigh !== 1 ? "s" : ""} with HIGH hallucination risk
              </p>
            </div>
          )}
        </div>

        {/* Per-span eval cards */}
        <div className="px-3 space-y-3 pb-3">
          {evals.map((ev) => {
            const span = spans.find((s) => s.spanId === ev.spanId);
            return (
              <EvalCard key={ev.spanId} eval={ev} spanName={span?.name ?? ev.spanId} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EvalCard({ eval: ev, spanName }: { eval: SpanEval; spanName: string }) {
  return (
    <div className="rounded-xl border border-tracer-border bg-tracer-surface p-3 space-y-2.5">
      {/* Span name + grade */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-tracer-primary leading-tight">{spanName}</p>
        <span
          className={clsx(
            "flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-lg",
            gradeColor(ev.overallGrade)
          )}
        >
          {ev.overallGrade}
        </span>
      </div>

      {/* Hallucination badge */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-tracer-secondary uppercase tracking-wider font-semibold">
          Hallucination
        </span>
        <span
          className={clsx(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            hallucinationBadgeColor(ev.hallucination)
          )}
        >
          {ev.hallucination}
        </span>
      </div>

      {/* Relevance */}
      <ScoreBar label="Relevance" value={ev.relevance} color="bg-tracer-llm" />

      {/* Conciseness */}
      <ScoreBar label="Conciseness" value={ev.conciseness} color="bg-tracer-retriever" />

      {/* Reasoning */}
      {ev.reasoning && (
        <p className="text-[11px] text-tracer-secondary line-clamp-2 leading-relaxed italic border-t border-tracer-border/50 pt-2">
          &ldquo;{ev.reasoning}&rdquo;
        </p>
      )}
    </div>
  );
}

function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-tracer-secondary">{label}</span>
        <span className="text-[10px] font-medium text-tracer-primary">{value}/100</span>
      </div>
      <div className="h-1.5 bg-tracer-bg rounded-full overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit?: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className={clsx("text-lg font-bold", color)}>
        {value}
        {unit && <span className="text-xs">{unit}</span>}
      </p>
      <p className="text-[10px] text-tracer-secondary leading-tight mt-0.5">{label}</p>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 85) return "text-tracer-evaluator";
  if (score >= 65) return "text-tracer-tool";
  return "text-red-400";
}

function gradeColor(grade: "A" | "B" | "C" | "D" | string): string {
  const map: Record<string, string> = {
    A: "bg-tracer-evaluator/20 text-tracer-evaluator",
    B: "bg-tracer-llm/20 text-tracer-llm",
    C: "bg-tracer-tool/20 text-tracer-tool",
    D: "bg-red-500/20 text-red-400",
  };
  return map[grade] ?? "bg-tracer-border text-tracer-secondary";
}

function hallucinationBadgeColor(h: "LOW" | "MEDIUM" | "HIGH"): string {
  return {
    LOW: "bg-tracer-evaluator/20 text-tracer-evaluator",
    MEDIUM: "bg-tracer-tool/20 text-tracer-tool",
    HIGH: "bg-red-500/20 text-red-400",
  }[h];
}

function ScoreIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-tracer-border"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
    </svg>
  );
}

