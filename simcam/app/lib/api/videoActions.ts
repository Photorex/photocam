import { VideoMetadata } from "./fetchUserVideos";

export const toggleFavoriteVideo = async (
  videoId: string,
  userId: string,
  res_video: string,
  setVideos: React.Dispatch<React.SetStateAction<VideoMetadata[]>>
) => {
  try {
    setVideos(prev =>
      prev.map(video =>
        video._id === videoId ? { ...video, favorite: !video.favorite } : video
      )
    );

    const res = await fetch('/api/video/favorites/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, userId, res_video }),
    });

    const data = await res.json();
    if (data.message !== 'Favorites updated successfully') {
      throw new Error(data.message);
    }
  } catch (err) {
    console.error('❌ Failed to toggle video favorite:', err);
  }
};

export const deleteVideoById = async (
  videoId: string,
  setVideos: React.Dispatch<React.SetStateAction<VideoMetadata[]>>
) => {
  try {
    if (!videoId) return;

    setVideos(prev => prev.filter(vid => vid._id !== videoId));

    const res = await fetch(`/api/video/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
    });

    const data = await res.json();
    if (data.message !== 'Video deleted successfully') {
      throw new Error(data.message);
    }
  } catch (err) {
    console.error('❌ Failed to delete video:', err);
  }
};