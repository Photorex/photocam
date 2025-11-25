const CLO_GEN_URL = process.env.LORA_GEN_URL_LORA!;
const CLO_WEBHOOK_URL = process.env.NEXT_PUBLIC_CLO_WEBHOOK_LORA_IMAGE!;
const IMAGE_API_KEY = process.env.IMAGE_API_KEY!;

interface LoraImageGenPayload {
    id_gen: string;
    prompt: string;
    name_lora: string; // e.g., "katy_67f38a811e44e7cc1ba32d09"
    type_user: string; // e.g., 'free', 'vip'
    resolution: string;
    gender: string;
    type_gen?: string; // default to 'txt2img'
}

export async function generateImageWithLora({
    id_gen,
    prompt,
    name_lora,
    type_user,
    resolution,
    gender,
    type_gen = "txt2img",
}: LoraImageGenPayload): Promise<any> {
  const form = new FormData();

    form.append("api_key", IMAGE_API_KEY);
    form.append("id_gen", id_gen);
    form.append("type_gen", type_gen);
    form.append("type_user", type_user);
    form.append("webhook", CLO_WEBHOOK_URL);
    form.append("loras", `${name_lora}.safetensors:1`);
    form.append("prompt", prompt);
    form.append("resolution", resolution);
    form.append("gender", gender);

    const res = await fetch(CLO_GEN_URL, {
        method: "POST",
        headers: {
        "api_key": IMAGE_API_KEY,
        },
        body: form,
    });

    const responseText = await res.text();
    console.log("📡 LoRA image gen response:", res.status, responseText);

    if (!res.ok) {
        throw new Error(`Image generation failed: ${res.status} - ${responseText}`);
    }

    try {
        return JSON.parse(responseText);
    } catch {
        return { raw: responseText };
    }
}