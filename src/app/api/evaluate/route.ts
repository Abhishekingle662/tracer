import { NextResponse } from "next/server";
import { evaluateSpans } from "@/lib/anthropic";
import { Span } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { spans } = body as { spans: Span[] };

    if (!Array.isArray(spans)) {
      return NextResponse.json(
        { error: "spans must be an array" },
        { status: 400 }
      );
    }

    if (spans.length > 50) {
      return NextResponse.json(
        { error: "spans array must have 50 or fewer items" },
        { status: 400 }
      );
    }

    const spanEvals = await evaluateSpans(spans);
    return NextResponse.json({ spanEvals });
  } catch (error) {
    console.error("[evaluate] Error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate spans" },
      { status: 500 }
    );
  }
}
