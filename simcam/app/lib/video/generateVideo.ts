const VIDEO_GEN_URL      = process.env.VIDEO_GEN_URL!;
const VIDEO_WEBHOOK_URL  = process.env.NEXT_PUBLIC_VIDEO_WEBHOOK!; // define in .env
const VIDEO_API_KEY      = process.env.IMAGE_API_KEY!;

export interface VideoGenPayload {
  id_gen: string;
  resolution: string;
  type_user: "free" | "vip";
  prompt?: string;
  imagePrompt?: string;
  loras?: string;
  gender?: string;
  duration?: string;
  imageFile?: File | null;
  scene?: string;
  version?: string;
}

export async function generateVideo({
  id_gen,
  resolution,
  type_user,
  prompt = "",
  imagePrompt = "None",
  loras = "None",
  gender = "None",
  duration = "5",
  imageFile = null,
  scene = "",
  version = "v1.6",
}: VideoGenPayload): Promise<any> {
  const form = new FormData();

  form.append("api_key", VIDEO_API_KEY);
  form.append("id_gen", id_gen);
  form.append("type_user", type_user);
  form.append("resolution", resolution);
  form.append("prompt", prompt);
  form.append("gender", gender);
  form.append("duration", duration);
  form.append("scene", scene);
  form.append("version", version);
  form.append("webhook", VIDEO_WEBHOOK_URL);

  if (imageFile) {
    /* ---------- gen_video  (image present) ---------------------- */
    form.append("image", imageFile, imageFile.name);
    form.append("type_gen", "gen_video");
    console.log("gen_video");
  } else if (loras !== "None") {
    /* ---------- gen_video  (LoRA present, no image) ------------- */
    form.append("loras", `${loras}.safetensors:1`);
    form.append("image_prompt", imagePrompt);
    form.append("type_gen", "gen_video");
    console.log("gen_video lora non None");
  } else {
    /* ---------- gen_video_text  (prompt-only) ------------------- */
    form.append("type_gen", "gen_video_text");
    console.log("gen_video_text");
  }

  const res = await fetch(VIDEO_GEN_URL, {
    method: "POST",
    headers: { "api_key": VIDEO_API_KEY },
    body: form,
  });

  const text = await res.text();
  console.log("📡 Video gen response:", res.status, text);

  if (!res.ok) throw new Error(`Video generation failed: ${res.status} – ${text}`);

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}