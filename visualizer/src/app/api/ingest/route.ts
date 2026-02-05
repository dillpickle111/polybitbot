import { NextRequest, NextResponse } from "next/server";
import type { BotState } from "@/types/botState";
import { setState } from "@/lib/stateStore";

export async function POST(req: NextRequest) {
  if (process.env.BOT_DISABLED === "true") {
    return NextResponse.json({ ok: false, disabled: true });
  }
  try {
    const body = await req.json();
    const state = body as BotState;
    await setState({ ...state, updatedAt: Date.now() });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: String((e as Error)?.message ?? e) },
      { status: 400 }
    );
  }
}

export const dynamic = "force-dynamic";
