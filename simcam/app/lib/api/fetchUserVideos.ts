export interface VideoMetadata {
  _id: string;
  res_video: string;
  createdAt: string;
  resolution: string;
  type_gen: string;
  status: 'ready' | 'generating' | 'failed';
  prompt?: string;
  favorite: boolean;
}

export async function fetchUserVideos(
  userId: string,
  skip = 0,
  limit = 10
): Promise<VideoMetadata[]> {
  const res = await fetch('/api/user/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, skip, limit }),
  });

  if (!res.ok) {
    // Silently return empty array if no videos found (normal for new users)
    if (res.status === 404) {
      return [];
    }
    // Only log actual errors
    const text = await res.text();
    console.error('Error fetching videos:', text);
    throw new Error('Failed to fetch videos');
  }

  const data = await res.json();
  return data.videos as VideoMetadata[];
}