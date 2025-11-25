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
  VideoMetadata,
  fetchUserVideos,
} from '@/app/lib/api/fetchUserVideos';

/* ---- helpers -------------------------------------------------------- */
const uniqueById = (arr: VideoMetadata[]) => {
  const map = new Map<string, VideoMetadata>();
  arr.forEach((v) => map.set(v._id, v));
  return Array.from(map.values());
};

/* ---- context contract ---------------------------------------------- */
interface Ctx {
  videos: VideoMetadata[];
  setVideos: React.Dispatch<React.SetStateAction<VideoMetadata[]>>;
  fetchMoreVideos: () => Promise<void>;
  refetchVideos: () => Promise<VideoMetadata[]>;
  videoLoading: boolean;
  videoHasMore: boolean;
  resetVideos: () => void;
}

const UserVideosContext = createContext<Ctx | null>(null);

/* ---- provider ------------------------------------------------------- */
export const UserVideosProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();

  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [page, setPage] = useState(0);
  const [videoLoading, setLoading] = useState(false);
  const [videoHasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 20;

  /* -- infinite-scroll pagination ------------------------------------- */
  const fetchMoreVideos = useCallback(async () => {
    if (!session?.user?.id || videoLoading || !videoHasMore) return;

    setLoading(true);
    try {
      const next = await fetchUserVideos(
        session.user.id,
        page * PAGE_SIZE,
        PAGE_SIZE
      );

      if (next.length === 0) setHasMore(false);

      setVideos((prev) => uniqueById([...prev, ...next]));
      setPage((p) => p + 1);
    } catch (err) {
      console.error('Error fetching more user videos:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, page, videoLoading, videoHasMore]);

  /* -- full refetch (e.g. after webhook) ------------------------------ */
  const refetchVideos = useCallback(async () => {
    if (!session?.user?.id) return [];

    setLoading(true);
    try {
      const refreshed = await fetchUserVideos(
        session.user.id,
        0,
        (page + 1) * PAGE_SIZE
      );
      const unique = uniqueById(refreshed);
      setVideos(unique);
      return unique;
    } catch (err) {
      console.error('Error refetching videos:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, page]);

  /* -- helpers -------------------------------------------------------- */
  const resetVideos = () => {
    setVideos([]);
    setPage(0);
    setHasMore(true);
  };

  return (
    <UserVideosContext.Provider
      value={{
        videos,
        setVideos,
        fetchMoreVideos,
        refetchVideos,
        videoLoading,
        videoHasMore,
        resetVideos,
      }}
    >
      {children}
    </UserVideosContext.Provider>
  );
};

/* ---- consumer hook -------------------------------------------------- */
export const useUserVideos = () => {
  const ctx = useContext(UserVideosContext);
  if (!ctx)
    throw new Error('useUserVideos must be used within a UserVideosProvider');
  return ctx;
};