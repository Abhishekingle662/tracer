"use client";

import LoadingSteps from "./LoadingSteps";
import clsx from "clsx";

const PRESETS = [
  "Summarize the latest developments in AI agents",
  "Write a Python function to detect JSON anomalies",
  "Explain transformer attention in simple terms",
  "Debug this error: TypeError undefined is not a function",
  "Compare LangChain vs LlamaIndex for RAG pipelines",
];

interface AgentRunnerProps {
  task: string;
  onTaskChange: (task: string) => void;
  onRun: () => void;
  isRunning: boolean;
  currentStep: number;
  error: string | null;
}

export default function AgentRunner({
  task,
  onTaskChange,
  onRun,
  isRunning,
  currentStep,
  error,
}: AgentRunnerProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-tracer-border flex-shrink-0">
        <h2 className="text-sm font-semibold text-tracer-primary">Agent Runner</h2>
        <p className="text-xs text-tracer-secondary mt-0.5">
          Enter a task and simulate an AI agent execution
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Task input */}
        <div>
          <label htmlFor="task-input" className="block text-[11px] font-semibold uppercase tracking-wider text-tracer-secondary mb-1.5">
            Task
          </label>
          <textarea
            id="task-input"
            value={task}
            onChange={(e) => onTaskChange(e.target.value)}
            disabled={isRunning}
            placeholder="Describe the task for the agent..."
            maxLength={2000}
            rows={4}
            className={clsx(
              "w-full rounded-lg border bg-tracer-bg text-tracer-primary placeholder-tracer-border",
              "text-sm px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-tracer-agent/50",
              "transition-colors",
              isRunning
                ? "border-tracer-border/50 opacity-60 cursor-not-allowed"
                : "border-tracer-border hover:border-tracer-secondary/50"
            )}
          />
        </div>

        {/* Run button */}
        <button
          onClick={onRun}
          disabled={isRunning || !task.trim()}
          className={clsx(
            "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all",
            isRunning || !task.trim()
              ? "bg-tracer-agent/30 text-tracer-agent/50 cursor-not-allowed"
              : "bg-tracer-agent hover:bg-tracer-agent/90 text-white shadow-lg shadow-tracer-agent/20 hover:shadow-tracer-agent/30"
          )}
        >
          {isRunning ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running...
            </>
          ) : (
            <>
              <PlayIcon />
              Run Agent
            </>
          )}
        </button>

        {/* Error banner */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Loading steps */}
        {isRunning && (
          <div className="rounded-xl border border-tracer-border bg-tracer-bg p-3">
            <p className="text-[10px] font-semibold text-tracer-secondary uppercase tracking-wider mb-1">
              Execution Progress
            </p>
            <LoadingSteps currentStep={currentStep} />
          </div>
        )}

        {/* Preset tasks */}
        {!isRunning && (
          <div>
            <p className="text-[11px] font-semibold text-tracer-secondary uppercase tracking-wider mb-2">
              Example Tasks
            </p>
            <div className="flex flex-col gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => onTaskChange(preset)}
                  className={clsx(
                    "text-left text-xs px-3 py-2 rounded-lg border transition-all",
                    task === preset
                      ? "border-tracer-agent/60 bg-tracer-agent/10 text-tracer-primary"
                      : "border-tracer-border text-tracer-secondary hover:border-tracer-secondary/50 hover:text-tracer-primary bg-tracer-bg"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info callout */}
        {!isRunning && (
          <div className="rounded-lg border border-tracer-border/50 bg-tracer-bg p-3">
            <p className="text-[11px] text-tracer-secondary leading-relaxed">
              <span className="text-tracer-agent font-semibold">How it works: </span>
              Each run calls Claude to simulate a realistic agent trace with LLM, tool, retrieval, and evaluation spans — then auto-evaluates output quality.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
