import { NextResponse } from "next/server";
import { getState } from "@/lib/stateStore";

const PAUSED_STATE = {
  updatedAt: null as number | null,
  status: "paused" as const,
  note: "Bot paused",
};

export async function GET() {
  if (process.env.BOT_DISABLED === "true") {
    return NextResponse.json(PAUSED_STATE);
  }
  try {
    const state = await getState();
    return NextResponse.json(state ?? { timestamp: null, updatedAt: null });
  } catch (e) {
    return NextResponse.json(
      { timestamp: null, updatedAt: null },
      { status: 200 }
    );
  }
}

export const dynamic = "force-dynamic";
