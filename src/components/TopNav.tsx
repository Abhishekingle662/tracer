"use client";

interface TopNavProps {
  onNewTrace: () => void;
}

export default function TopNav({ onNewTrace }: TopNavProps) {
  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-tracer-border bg-tracer-surface flex-shrink-0">
      {/* Logo + title */}
      <div className="flex items-center gap-3">
        <FlameIcon />
        <div>
          <h1 className="text-lg font-semibold text-tracer-primary leading-tight">
            Tracer
          </h1>
          <p className="text-xs text-tracer-secondary leading-tight">
            LLM Observability Demo &middot; Built for Arize AI
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tracer-agent/10 border border-tracer-agent/30 text-tracer-agent text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-tracer-evaluator animate-pulse" />
          Live Demo
        </span>
        <button
          onClick={onNewTrace}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-tracer-border bg-tracer-bg hover:bg-tracer-surface text-tracer-secondary hover:text-tracer-primary text-sm font-medium transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          New Trace
        </button>
      </div>
    </nav>
  );
}

function FlameIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="flame-grad" x1="16" y1="28" x2="16" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path
        d="M16 4C16 4 10 10 10 16.5C10 20.09 12.69 23 16 23C19.31 23 22 20.09 22 16.5C22 10 16 4 16 4Z"
        fill="url(#flame-grad)"
      />
      <path
        d="M16 15C16 15 13 17.5 13 19.5C13 21.16 14.34 22.5 16 22.5C17.66 22.5 19 21.16 19 19.5C19 17.5 16 15 16 15Z"
        fill="#fde68a"
        opacity="0.9"
      />
    </svg>
  );
}
