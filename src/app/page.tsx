"use client";

import { useState, useRef } from "react";
import TopNav from "@/components/TopNav";
import AgentRunner from "@/components/AgentRunner";
import TraceViewer from "@/components/TraceViewer";
import EvalPanel from "@/components/EvalPanel";
import { Trace, SpanEval } from "@/lib/types";

export default function Home() {
  const [task, setTask] = useState("");
  const [trace, setTrace] = useState<Trace | null>(null);
  const [evals, setEvals] = useState<SpanEval[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [runError, setRunError] = useState<string | null>(null);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advanceSteps = () => {
    let step = 0;
    setCurrentStep(0);
    stepIntervalRef.current = setInterval(() => {
      step += 1;
      if (step <= 4) {
        setCurrentStep(step);
      } else {
        if (stepIntervalRef.current) {
          clearInterval(stepIntervalRef.current);
        }
      }
    }, 700);
  };

  const stopStepAdvance = () => {
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
  };

  const runEvaluations = async (traceData: Trace) => {
    setIsEvaluating(true);
    setCurrentStep(5);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spans: traceData.spans }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvals(data.spanEvals ?? []);
      }
    } catch (err) {
      console.error("Evaluation failed:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRunAgent = async () => {
    if (!task.trim() || isRunning) return;

    setIsRunning(true);
    setTrace(null);
    setEvals([]);
    setRunError(null);
    advanceSteps();

    try {
      const res = await fetch("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });

      stopStepAdvance();

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const traceData: Trace = await res.json();
      setTrace(traceData);
      setIsRunning(false);

      // Immediately kick off evaluations
      await runEvaluations(traceData);
    } catch (err) {
      console.error("Agent run failed:", err);
      stopStepAdvance();
      setIsRunning(false);
      setRunError("Agent run failed. Check your API key or try again.");
    }
  };

  const handleNewTrace = () => {
    stopStepAdvance();
    setTrace(null);
    setEvals([]);
    setIsRunning(false);
    setIsEvaluating(false);
    setCurrentStep(0);
    setTask("");
    setRunError(null);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav onNewTrace={handleNewTrace} />

      {/* Three-column body */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left — Agent Runner (30%) */}
        <div className="w-[30%] min-w-[260px] border-r border-tracer-border flex flex-col overflow-hidden">
          <AgentRunner
            task={task}
            onTaskChange={setTask}
            onRun={handleRunAgent}
            isRunning={isRunning}
            currentStep={currentStep}
            error={runError}
          />
        </div>

        {/* Center — Trace Viewer (45%) */}
        <div className="flex-1 border-r border-tracer-border flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-tracer-border flex-shrink-0">
            <h2 className="text-sm font-semibold text-tracer-primary">Trace Viewer</h2>
            <p className="text-xs text-tracer-secondary mt-0.5">
              Span tree with OpenTelemetry-style attributes
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            <TraceViewer trace={trace} />
          </div>
        </div>

        {/* Right — Eval Panel (25%) */}
        <div className="w-[25%] min-w-[220px] flex flex-col overflow-hidden">
          <EvalPanel
            evals={evals}
            spans={trace?.spans ?? []}
            isEvaluating={isEvaluating}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-tracer-border px-6 py-2.5 bg-tracer-surface">
        <p className="text-[11px] text-tracer-border text-center">
          Demo prototype built to mirror{" "}
          <span className="text-tracer-secondary">Arize AI&rsquo;s Phoenix platform</span>
          {" "}· Built by{" "}
          <span className="text-tracer-secondary font-medium">Abhishek Ingle</span>
        </p>
      </footer>
    </div>
  );
}
