"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

/**
 * The two-register principle (§5.8 / §16.6).
 *
 * Default register: Daily Joy — warm cream, light motion, soft gold accent.
 * Sacred Work register: Midnight Indigo background, slower motion, dimmed
 * chrome. Triggered when entering Forgiveness Vault, Self-Eulogy, deep
 * narrative work, SubScript reading. Returning to a non-sacred page
 * lifts the register automatically.
 *
 * Implementation: a `data-sacred="true"` attribute on <body> + CSS
 * overrides (Tailwind has darker variants applied via this attribute).
 * Components that need to know imperatively can read `useSacredWork()`.
 */

interface Ctx {
  sacred: boolean;
  enterSacred: () => void;
  exitSacred: () => void;
}

const SacredCtx = createContext<Ctx | null>(null);

export function useSacredWork(): Ctx {
  const ctx = useContext(SacredCtx);
  if (!ctx) return { sacred: false, enterSacred: () => {}, exitSacred: () => {} };
  return ctx;
}

export function SacredWorkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sacred, setSacred] = useState(false);

  const enterSacred = useCallback(() => setSacred(true), []);
  const exitSacred = useCallback(() => setSacred(false), []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (sacred) {
      document.body.setAttribute("data-sacred", "true");
      // Apply a slow palette shift via a CSS class on <html>
      document.documentElement.classList.add("sacred-mode");
    } else {
      document.body.removeAttribute("data-sacred");
      document.documentElement.classList.remove("sacred-mode");
    }
    return () => {
      document.body.removeAttribute("data-sacred");
      document.documentElement.classList.remove("sacred-mode");
    };
  }, [sacred]);

  return (
    <SacredCtx.Provider value={{ sacred, enterSacred, exitSacred }}>
      {children}
    </SacredCtx.Provider>
  );
}

/**
 * Drop-in: any page that should be Sacred Work simply renders
 * <SacredPage /> at the top. Handles enter/exit on mount/unmount.
 */
export function SacredPage() {
  const { enterSacred, exitSacred } = useSacredWork();
  useEffect(() => {
    enterSacred();
    return () => exitSacred();
  }, [enterSacred, exitSacred]);
  return null;
}
