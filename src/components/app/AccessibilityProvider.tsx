"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

/**
 * Accessibility settings (§31.1).
 *
 * The "Make it easier on my brain" toggle — when on:
 *   - Body font switches to a dyslexia-friendly stack
 *   - Tighter line lengths
 *   - Breath-paced animations disabled
 *   - Higher contrast where the design supports it
 *
 * Persisted in localStorage (the user's preference is per-device for
 * v1; can migrate to user_preferences.accessibility_settings later).
 */

interface AccessibilityState {
  easier: boolean;
  setEasier: (v: boolean) => void;
}

const Ctx = createContext<AccessibilityState | null>(null);

const KEY = "aoj.accessibility.easier";

export function useAccessibility(): AccessibilityState {
  const ctx = useContext(Ctx);
  if (!ctx) return { easier: false, setEasier: () => {} };
  return ctx;
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [easier, setEasierState] = useState(false);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(KEY);
      if (stored === "true") setEasierState(true);
    } catch {
      // ignore
    }
  }, []);

  // Apply the class on <html> whenever it changes
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (easier) document.documentElement.classList.add("easier-mode");
    else document.documentElement.classList.remove("easier-mode");
  }, [easier]);

  const setEasier = useCallback((v: boolean) => {
    setEasierState(v);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(KEY, v ? "true" : "false");
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <Ctx.Provider value={{ easier, setEasier }}>{children}</Ctx.Provider>
  );
}
