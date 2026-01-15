'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import {
  ImageMetadata,
  fetchUserImages,
} from '@/app/lib/api/fetchUserImages';

/* ---------- helpers (dedupe for extra safety) ------------------------- */
const uniqueById = (arr: ImageMetadata[]) => {
  const map = new Map<string, ImageMetadata>();
  arr.forEach((img) => map.set(img._id, img));
  return Array.from(map.values());
};

/* ---------- context --------------------------------------------------- */
interface Ctx {
  images: ImageMetadata[];
  setImages: React.Dispatch<React.SetStateAction<ImageMetadata[]>>;
  fetchMoreImages: () => Promise<void>;
  refetchImages: () => Promise<ImageMetadata[]>;
  loading: boolean;
  hasMore: boolean;
  resetImages: () => void;
}

const UserImagesContext = createContext<Ctx | null>(null);

export const UserImagesProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();

  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const IMAGES_PER_PAGE = 20;

  /* --- pagination ----------------------------------------------------- */
  const fetchMoreImages = useCallback(async () => {
    if (!session?.user?.id || loading || !hasMore) return;

    setLoading(true);
    try {
      const next = await fetchUserImages(
        session.user.id,
        page * IMAGES_PER_PAGE,
        IMAGES_PER_PAGE
      );

      if (next.length === 0) setHasMore(false);

      setImages((prev) => uniqueById([...prev, ...next]));
      setPage((p) => p + 1);
    } catch (err) {
      console.error('Error fetching more user images:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, page, loading, hasMore]);

  /* --- complete refetch ---------------------------------------------- */
  const refetchImages = useCallback(async () => {
    if (!session?.user?.id) return [];

    setLoading(true);
    try {
      const refreshed = await fetchUserImages(
        session.user.id,
        0,
        (page + 1) * IMAGES_PER_PAGE
      );
      const unique = uniqueById(refreshed);
      setImages(unique);
      return unique;
    } catch (err) {
      // Silently handle - not an error if user has no images
      return [];
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, page]);

  /* --- helpers -------------------------------------------------------- */
  const resetImages = () => {
    setImages([]);
    setPage(0);
    setHasMore(true);
  };

  return (
    <UserImagesContext.Provider
      value={{
        images,
        setImages,
        fetchMoreImages,
        refetchImages,
        loading,
        hasMore,
        resetImages,
      }}
    >
      {children}
    </UserImagesContext.Provider>
  );
};

export const useUserImages = () => {
  const ctx = useContext(UserImagesContext);
  if (!ctx)
    throw new Error('useUserImages must be used within a UserImagesProvider');
  return ctx;
};