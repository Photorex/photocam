"use client";

import React, { ReactNode } from "react";

// Import context
import { ControlMenuProvider } from "@/app/context/ControlMenuContext";

import { UserImagesProvider } from "./UserImagesContext";

import { UserContextProvider } from "./UserContext";

import { UserVideosProvider } from "./UserVideosContext";

import { VersionProvider } from "./VersionContext";

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <UserContextProvider>
      <VersionProvider>
        <ControlMenuProvider>
          <UserImagesProvider>
            <UserVideosProvider>
              {children}
            </UserVideosProvider>
          </UserImagesProvider>
        </ControlMenuProvider>
      </VersionProvider>
    </UserContextProvider>
  );
};