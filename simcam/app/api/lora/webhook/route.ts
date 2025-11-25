import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import User from '@/app/lib/mongodb/models/user';
import Busboy from 'busboy';
import { generateDefaultImageForModel } from '@/app/lib/lora/generateDefaultImageForLora';
import { Readable } from 'stream';

// Convert Web ReadableStream to Node Readable
function toNodeReadable(req: NextRequest): Readable {
  const reader = req.body?.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader!.read();
      if (done) this.push(null);
      else this.push(value);
    },
  });
}

export async function POST(req: NextRequest) {
    const contentType = req.headers.get("content-type") || "";
  
    // Handle JSON payload
    if (contentType.includes("application/json")) {
      try {
        const data = await req.json();
        // console.warn("❌ JSON received on webhook (expected form-data). Payload:", data);
  
        const { message, id_gen } = data;
  
        if (message?.includes("startTrainingLora")) {
          console.log("🚀 LoRA training started:", message);
        } else {
          console.log("📨 JSON webhook message:", data);
        }
  
        return NextResponse.json({ received: true }, { status: 200 });
      } catch (error) {
        console.error("❌ Failed to parse JSON:", error);
        return NextResponse.json({ error: "Invalid JSON" }, { status: 200 });
      }
    }
  
    // Handle form-data using busboy (streaming multipart)
    const headers = Object.fromEntries(req.headers.entries());
    const busboy = Busboy({ headers });
    const fields: Record<string, string> = {};
  
    const result = await new Promise((resolve, reject) => {
      busboy.on("field", (name, value) => {
        fields[name] = value;
      });
  
      busboy.on("finish", () => resolve(fields));
      busboy.on("error", (err) => reject(err));
  
      toNodeReadable(req).pipe(busboy);
    });
  
    const { id_gen } = result as Record<string, string>;
  
    console.log("✅ Form-data webhook received:", result);
  
    if (!id_gen) {
      console.warn("⚠️ Form-data webhook missing id_gen");
      return NextResponse.json({ warning: "Missing model ID" }, { status: 200 });
    }
  
    try {
      await connectMongoDB();
      const user = await User.findOne({ "modelMap.id_gen": id_gen });
  
      if (!user) {
        console.warn("⚠️ No user found with model ID:", id_gen);
      } else {
        const model = user.modelMap.find((m: any) => m.id_gen === id_gen);
        if (model) model.status = "ready";
        await user.save();
        console.log("✅ User modelMap status updated to 'ready'");

        try {
            const type_user = user.subscription === "Free" ? "free" : "vip";
            const defaultGenResult = await generateDefaultImageForModel({
              id_gen: model.id_gen,
              name_lora: model.name_lora,
              gender: model.gender,
              type_user,
            });
        
            console.log("🎨 Default model image gen triggered:", defaultGenResult);
          } catch (err) {
            console.error("❌ Failed to generate default model image:", err);
          }
      }
  
      return NextResponse.json({ received: true }, { status: 200 });
    } catch (err) {
      console.error("❌ Error updating modelMap:", err);
      return NextResponse.json({ error: "Server error" }, { status: 200 });
    }
  }