export async function trainLoraModel({ 
    id_gen,
    name_lora,
    name,
    gender,
    age,
    image,
    type_user,
  }: {
    id_gen: string;
    name_lora: string;
    name: string;
    gender: string;
    age: string;
    image: FormDataEntryValue[];
    type_user: string;
  }) {
    const CLO_API_KEY = process.env.IMAGE_API_KEY!;
    const CLO_WEBHOOK_URL = process.env.NEXT_PUBLIC_CLO_WEBHOOK_URL!;
    const LORA_GEN_URL = process.env.LORA_GEN_URL!;
  
    const form = new FormData();
    form.append("name_lora", name_lora);
    form.append("id_gen", id_gen);
    form.append("type_gen", "gen_lora");
    form.append("type_user", type_user);
    form.append("webhook", CLO_WEBHOOK_URL);
    form.append("api_key", CLO_API_KEY);
  
    image.forEach((file, idx) => {
      if (file instanceof File) {
        form.append("image", file, `image_${idx}.png`);
      }
    });
  
    const res = await fetch(LORA_GEN_URL, {
      method: "POST",
      headers: {
        'api_key': CLO_API_KEY,
      },
      body: form,
    });
  
    // 🔍 Console out status and response text
    const responseText = await res.text();
    console.log("📡 CLO Lora training response:", res.status, responseText);
  
    if (!res.ok) {
      throw new Error(`CLO Lora training failed: ${res.status} - ${responseText}`);
    }
  
    try {
      return JSON.parse(responseText);
    } catch (err) {
      console.warn("⚠️ Failed to parse JSON, returning raw response text");
      return { raw: responseText };
    }
  }