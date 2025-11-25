import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const country = req.headers.get("cf-ipcountry") || "unknown";
    console.log("🌍 User Country:", country);

    return NextResponse.json({ country }, { status: 200 });
  } catch (error) {
    console.warn("⚠️ Could not determine IP country. Falling back to unknown.");
    return NextResponse.json({ country: "unknown" }, { status: 200 });
  }
}