import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb/mongodb";
import User from "@/app/lib/mongodb/models/user";
import { generateImageWithLora } from "@/app/lib/lora/generateImageWithLora";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const userId = formData.get("userId")?.toString();
    const id_gen = formData.get("id_gen")?.toString();
    const prompt = formData.get("prompt")?.toString();
    const name_lora = formData.get("name_lora")?.toString();
    const resolution = formData.get("resolution")?.toString();
    const gender = formData.get("gender")?.toString();

    if (!userId || !id_gen || !prompt || !name_lora || !resolution || !gender) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    await connectMongoDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // const type_user = user.subscription === "Free" ? "free" : "vip";
    const type_user = "vip";



    const result = await generateImageWithLora({
      id_gen,
      prompt,
      name_lora,
      type_user,
      resolution,
      gender,
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("❌ Error triggering LoRA image generation:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}