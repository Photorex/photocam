import { NextResponse } from "next/server";

export async function GET() {
  // This route is used for health checks.
  try {
    return NextResponse.json({ status: "ok", message: "Test route working" }, { status: 200 });
  } catch (error) {
    console.error("Test route error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}