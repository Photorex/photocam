import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb/mongodb";
import User from "@/app/lib/mongodb/models/user";

export async function POST(req: Request) {
    const { userId, id_gen, name_lora, name, age, gender } = await req.json();

    if (!userId || !id_gen || !name_lora || !name || !age || !gender) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
        await connectMongoDB();

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // 👇 match schema
        user.modelMap.push({
            name,
            id_gen,
            name_lora,
            age,
            status: "generating",
            gender,
        });

        await user.save();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Error updating user modelMap:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}