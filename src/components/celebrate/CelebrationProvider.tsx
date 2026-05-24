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
