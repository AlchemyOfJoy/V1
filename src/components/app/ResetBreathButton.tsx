"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import RightNowSheet from "./RightNowSheet";

/**
 * The universal Reset Breath button (Master Prompt §5.4).
 *
 * Single tap = 42-second Reset Breath (routes to the tool).
 * Long-press (700ms) = opens the Right Now sheet for emergency
 * emotional intervention.
 *
 * Visual: cyan pill, gold-tinted shadow, fixed in the thumb zone.
 * Always available on every signed-in surface.
 */
export default function ResetBreathButton() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredLongPress = useRef(false);

  function startPress() {
    triggeredLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      triggeredLongPress.current = true;
      setSheetOpen(true);
    }, 700);
  }

  function endPress() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }

  function handleClick(e: React.MouseEvent) {
    if (triggeredLongPress.current) {
      e.preventDefault();
      return;
    }
    router.push("/curriculum/module/04-bold-action/60-second-reset");
  }

  return (
    <>
      <button
        type="button"
        aria-label="Reset Breath — tap once, long-press for Right Now"
        onClick={handleClick}
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStart={startPress}
        onTouchEnd={endPress}
        className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-cyan text-white transition duration-150 hover:scale-105 hover:shadow-[0_0_22px_rgba(0,168,232,0.55)] lg:bottom-8 lg:right-8"
        style={{ touchAction: "manipulation" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
          <path d="M13 2L5 14h6l-2 8 8-12h-6l2-8z" fill="white" />
        </svg>
      </button>
      <RightNowSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
