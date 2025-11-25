export interface ImageMetadata {
    _id: string;
    res_image: string;
    size: string;
    createdAt: string;
    type_gen: string;
    status: 'ready' | 'generating' | 'failed';
    model: string;
    favorite: boolean;
  }
  
  export async function fetchUserImages(
    userId: string,
    skip = 0,
    limit = 20
  ): Promise<ImageMetadata[]> {
    const res = await fetch('/api/user/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, skip, limit }),
    });
  
    if (!res.ok) {
      console.error(await res.text());
      throw new Error('Failed to fetch images');
    }
  
    const data = await res.json();
    return data.images as ImageMetadata[];
  }