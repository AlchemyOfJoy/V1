"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import Celebration, { type CelebrationSize } from "./Celebration";

interface CelebratePayload {
  size?: CelebrationSize;
  primary: string;
  secondary?: string;
  eyebrow?: string;
}

interface Ctx {
  celebrate: (payload: CelebratePayload) => void;
}

const CelebrationContext = createContext<Ctx | null>(null);

export function useCelebrate(): Ctx {
  const ctx = useContext(CelebrationContext);
  if (!ctx) {
    // Safe fallback — celebration just doesn't fire outside the provider tree.
    return { celebrate: () => {} };
  }
  return ctx;
}

export default function CelebrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [payload, setPayload] = useState<CelebratePayload | null>(null);

  const celebrate = useCallback((next: CelebratePayload) => {
    setPayload(next);
    // Milestone (Bloom tier) and major (Ascension tier) celebrations
    // persist to Memory Stones — replayable in My Alchemy. Spark and
    // Glow are transient acknowledgments, not saved.
    if (next.size === "milestone" || next.size === "major") {
      fetch("/api/me/memory-stones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: next.size === "major" ? "ascension" : "bloom",
          eyebrow: next.eyebrow ?? null,
          headline: next.primary,
          subline: next.secondary ?? null,
        }),
      }).catch(() => {});
    }
  }, []);

  const value = useMemo(() => ({ celebrate }), [celebrate]);

  return (
    <CelebrationContext.Provider value={value}>
      {children}
      {payload && (
        <Celebration
          open
          size={payload.size ?? "milestone"}
          primary={payload.primary}
          secondary={payload.secondary}
          eyebrow={payload.eyebrow}
          onComplete={() => setPayload(null)}
        />
      )}
    </CelebrationContext.Provider>
  );
}
