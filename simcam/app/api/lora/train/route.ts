import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb/mongodb";
import User from "@/app/lib/mongodb/models/user";
import { trainLoraModel } from "@/app/lib/lora/trainLoraModel";

// const LIMITS = {
//     Free:   0,
//     Muse:   1,
//     Glow:   2,
//     Studio: 2,
//     Icon:   4,
//   } as const;
  
//   type SubKey = keyof typeof LIMITS;

export async function POST(req: Request) {
  const formData = await req.formData();
  const userId = formData.get("userId")?.toString();
  const id_gen = formData.get("id_gen")?.toString();
  const name_lora = formData.get("name_lora")?.toString();
  const name = formData.get("name")?.toString();
  const gender = formData.get("gender")?.toString();
  const age = formData.get("age")?.toString();
  const image = formData.getAll("images");

  if (!userId || !id_gen || !name_lora || !name || !age || !gender || image.length !== 10) {
    return NextResponse.json({ error: "Missing required fields or incorrect image count." }, { status: 400 });
  }

  try {
    await connectMongoDB();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // const LIMITS = { Free: 0, Muse: 1, Glow: 2, Studio: 2, Icon: 4 } as const;
    // const sub = (user.subscription ?? 'Free') as SubKey;
    // const modelCnt  = user.modelMap?.length ?? 0;
    // const canCreate = modelCnt < LIMITS[sub];

    // if (!canCreate) {
    //     return NextResponse.json(
    //     { error: "limit-reached" },
    //     { status: 403 },
    //     );
    // }

    // const type_user = user.subscription === "Free" ? "free" : "vip";
    const type_user = "vip";

    // console.log('id_gen, name_lora, name, gender, age, image, type_user: ', id_gen, name_lora, name, gender, age, image, type_user,)

    const result = await trainLoraModel({
      id_gen,
      name_lora,
      name,
      gender,
      age,
      image,
      type_user,
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Failed to trigger training:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}