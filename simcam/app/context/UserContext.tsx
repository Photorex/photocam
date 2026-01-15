"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

// Type definition for model map from next-auth.d.ts
interface ModelMapItem {
  name: string;
  id_gen: string;
  name_lora: string;
  age: string;
  status: "generating" | "ready";
  model_image?: string | null;
  gender: string;
  _id?: string;
}

interface UserContextType {
  modelMap: ModelMapItem[];
  setModelMap: (modelMap: ModelMapItem[]) => void;
  updateModelMap: () => Promise<void>;
  isUpdatingModelMap: boolean;
}

const defaultValues: UserContextType = {
  modelMap: [],
  setModelMap: () => {},
  updateModelMap: async () => {},
  isUpdatingModelMap: false,
};

const UserContext = createContext<UserContextType>(defaultValues);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, update } = useSession();
  const [modelMap, setModelMap] = useState<ModelMapItem[]>([]);
  const [isUpdatingModelMap, setIsUpdatingModelMap] = useState(false);

  // Function to update modelMap from API
  const updateModelMap = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setIsUpdatingModelMap(true);
    
    try {
      const response = await fetch(`/api/user/${session.user.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setModelMap(data.user.modelMap || []);
      }
    } catch (error) {
      console.error('Error fetching model map data:', error);
    } finally {
      setIsUpdatingModelMap(false);
    }
  }, [session?.user?.id]);

  // Initial fetch when session is available
  useEffect(() => {
    if (session?.user?.id) {
      updateModelMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]); // Removed updateModelMap from deps to prevent loops

  return (
    <UserContext.Provider
      value={{
        modelMap,
        setModelMap,
        updateModelMap,
        isUpdatingModelMap
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext); 