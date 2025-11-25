"use client";

import * as React from "react";

// HeroUI provider
import {HeroUIProvider} from "@heroui/system";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { AppContextProvider } from "@/app/context/AppContextProvider";

// Session
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

// Next.js specific import
import { useRouter } from "next/navigation";

// import { AppContextProvider } from "@/context/page";


export interface ProvidersProps {
    children: React.ReactNode;
    themeProps?: ThemeProviderProps;
	session?: Session | null;
}

export function Providers({ children, themeProps, session }: ProvidersProps) {
  const router = useRouter();

    return (
        <SessionProvider session={session}>
            <AppContextProvider>
                <HeroUIProvider navigate={router.push}>
                    <NextThemesProvider {...themeProps} attribute="class" defaultTheme="dark">
                        {children}
                    </NextThemesProvider>
                </HeroUIProvider>
            </AppContextProvider>
        </SessionProvider>
    );
}