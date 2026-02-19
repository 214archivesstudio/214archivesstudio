"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { BackgroundMedia } from "@/types";

interface BackgroundContextValue {
  readonly overrideMedia: BackgroundMedia | null;
  readonly setOverrideMedia: (media: BackgroundMedia | null) => void;
}

const BackgroundContext = createContext<BackgroundContextValue | null>(null);

export function BackgroundProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [overrideMedia, setOverrideMediaState] =
    useState<BackgroundMedia | null>(null);

  const setOverrideMedia = useCallback(
    (media: BackgroundMedia | null) => setOverrideMediaState(media),
    []
  );

  return (
    <BackgroundContext value={{ overrideMedia, setOverrideMedia }}>
      {children}
    </BackgroundContext>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error("useBackground must be used within a BackgroundProvider");
  }
  return context;
}
