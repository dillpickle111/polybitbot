import { NextResponse } from "next/server";
import { getState } from "@/lib/stateStore";

export async function GET() {
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
