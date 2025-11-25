import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb/mongodb";
import User from "@/app/lib/mongodb/models/user";
import { generateVideo } from "@/app/lib/video/generateVideo";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Required fields
    const userId     = formData.get("userId")?.toString();
    const id_gen     = formData.get("id_gen")?.toString();
    const resolution = formData.get("resolution")?.toString();  // "1:1" | "9:16" | "16:9"

    // Optional fields
    const prompt      = formData.get("prompt")?.toString() ?? "";
    const imagePrompt = formData.get("image_prompt")?.toString() ?? "None";
    const loras       = formData.get("loras")?.toString() ?? "None";
    const gender      = formData.get("gender")?.toString() ?? "None";
    const duration    = formData.get("duration")?.toString() ?? "5";
    const scene       = formData.get("scene")?.toString() ?? "";
    const version     = formData.get("version")?.toString() ?? "v1.6";
    const imageFile   = formData.get("image") as File | null;

    if (!userId || !id_gen || !resolution) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    await connectMongoDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const type_user = "vip";

    const result = await generateVideo({
      id_gen,
      resolution,
      type_user,
      prompt,
      imagePrompt,
      loras,
      gender,
      duration,
      scene,
      version,
      imageFile,
    });

    return NextResponse.json({ success: true, result });

  } catch (err: any) {
    console.error("❌ Video gen error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}