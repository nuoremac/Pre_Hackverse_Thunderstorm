import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true, service: "pulseplan", ts: new Date().toISOString() });
}

