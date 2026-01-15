import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb/mongodb";
import User from "@/app/lib/mongodb/models/user";
import { trainLoraModel } from "@/app/lib/lora/trainLoraModel";
import { validateImageFiles, sanitizeId, sanitizeString } from "@/app/lib/security/fileValidation";

// const LIMITS = {
//     Free:   0,
//     Muse:   1,
//     Glow:   2,
//     Studio: 2,
//     Icon:   4,
//   } as const;
  
//   type SubKey = keyof typeof LIMITS;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Extract and validate all input fields
    const userId = formData.get("userId")?.toString();
    const id_gen = formData.get("id_gen")?.toString();
    const name_lora = formData.get("name_lora")?.toString();
    const name = formData.get("name")?.toString();
    const gender = formData.get("gender")?.toString();
    const age = formData.get("age")?.toString();
    const imageEntries = formData.getAll("images");

    // Validate required fields exist
    if (!userId || !id_gen || !name_lora || !name || !age || !gender) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // Validate image count
    if (imageEntries.length !== 10) {
      return NextResponse.json({ 
        error: `Expected 10 images, received ${imageEntries.length}` 
      }, { status: 400 });
    }

    // Validate and sanitize IDs
    const userIdValidation = sanitizeId(userId, 'userId');
    if (!userIdValidation.valid) {
      return NextResponse.json({ error: userIdValidation.error }, { status: 400 });
    }

    const idGenValidation = sanitizeId(id_gen, 'id_gen');
    if (!idGenValidation.valid) {
      return NextResponse.json({ error: idGenValidation.error }, { status: 400 });
    }

    // Validate and sanitize string fields
    const nameLoraValidation = sanitizeString(name_lora, 'name_lora', 100);
    if (!nameLoraValidation.valid) {
      return NextResponse.json({ error: nameLoraValidation.error }, { status: 400 });
    }

    const nameValidation = sanitizeString(name, 'name', 100);
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 });
    }

    const ageValidation = sanitizeString(age, 'age', 50);
    if (!ageValidation.valid) {
      return NextResponse.json({ error: ageValidation.error }, { status: 400 });
    }

    // Validate gender is one of allowed values
    const allowedGenders = ['man', 'woman'];
    if (!allowedGenders.includes(gender.toLowerCase())) {
      return NextResponse.json({ 
        error: `Invalid gender value. Must be one of: ${allowedGenders.join(', ')}` 
      }, { status: 400 });
    }

    // Convert to File array and validate
    const images = imageEntries.filter((entry): entry is File => entry instanceof File);
    
    if (images.length !== 10) {
      return NextResponse.json({ 
        error: "All uploaded items must be valid image files" 
      }, { status: 400 });
    }

    // SECURITY: Validate all uploaded images
    console.log('🔒 Validating uploaded images...');
    const validation = await validateImageFiles(images);
    
    if (!validation.valid) {
      console.error('🚨 Image validation failed:', validation.errors);
      return NextResponse.json({ 
        error: "Image validation failed",
        details: validation.errors 
      }, { status: 400 });
    }

    console.log('✅ All images validated successfully');

    // Connect to database
    await connectMongoDB();

    // Verify user exists
    const user = await User.findById(userIdValidation.sanitizedId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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

    // Trigger LORA training with validated data
    const result = await trainLoraModel({
      id_gen: idGenValidation.sanitizedId!,
      name_lora: nameLoraValidation.sanitizedValue!,
      name: nameValidation.sanitizedValue!,
      gender,
      age: ageValidation.sanitizedValue!,
      image: images,
      type_user,
    });

    return NextResponse.json({ success: true, result });
    
  } catch (err: any) {
    console.error("Failed to trigger training:", err);
    return NextResponse.json({ 
      error: err.message || "Server error" 
    }, { status: 500 });
  }
}