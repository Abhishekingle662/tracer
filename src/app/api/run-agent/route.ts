import { NextResponse } from "next/server";
import { generateTrace } from "@/lib/anthropic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task } = body as { task: string };

    if (!task || typeof task !== "string" || task.trim().length === 0) {
      return NextResponse.json(
        { error: "task is required" },
        { status: 400 }
      );
    }

    if (task.trim().length > 2000) {
      return NextResponse.json(
        { error: "task must be 2000 characters or fewer" },
        { status: 400 }
      );
    }

    const trace = await generateTrace(task.trim());
    return NextResponse.json(trace);
  } catch (error) {
    console.error("[run-agent] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate trace" },
      { status: 500 }
    );
  }
}
