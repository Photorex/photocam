import { ImageMetadata } from "./fetchUserImages";

/**
 * Toggles the favorite status of an image in both server and client state.
 */
export const toggleFavoriteImage = async (
  imageId: string,
  userId: string,
  res_image: string,
  setImages: React.Dispatch<React.SetStateAction<ImageMetadata[]>>
) => {
  try {
    // Optimistic update
    setImages(prev =>
      prev.map(img =>
        img._id === imageId ? { ...img, favorite: !img.favorite } : img
      )
    );

    const res = await fetch('/api/image/favorites/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId, userId, res_image }),
    });

    const data = await res.json();
    if (data.message !== 'Favorites updated successfully') {
      throw new Error(data.message);
    }

  } catch (err) {
    console.error('❌ Failed to toggle favorite:', err);
  }
};

/**
 * Deletes an image from the server and removes it from client state.
 */
export const deleteImageById = async (
  imageId: string,
  setImages: React.Dispatch<React.SetStateAction<ImageMetadata[]>>
) => {
  try {
    if (!imageId) return;

    // Optimistic UI
    setImages(prev => prev.filter(img => img._id !== imageId));

    const res = await fetch(`/api/image/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId }),
    });

    const data = await res.json();
    if (data.message !== 'Image deleted successfully') {
      throw new Error(data.message);
    }
  } catch (err) {
    console.error('❌ Failed to delete image:', err);
  }
};