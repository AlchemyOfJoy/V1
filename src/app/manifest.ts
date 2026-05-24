import type { MetadataRoute } from "next";

/**
 * PWA manifest with home-screen shortcuts (Build Directive §2.2 #5).
 *
 * Once the user installs the PWA (Safari "Add to Home Screen" on iOS;
 * Chrome / Edge install on Android + desktop), long-pressing the icon
 * exposes these shortcuts — single-tap entry points to the three
 * most-used surfaces in the methodology:
 *
 *   • Add a joy        → /quick-add
 *   • Reset Breath     → /curriculum/module/04-bold-action/60-second-reset
 *   • Log Joy Pulse    → /home?focus=pulse
 *
 * iOS shortcuts work from iOS 16.4+. Android since Chrome 84.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Alchemy of Joy",
    short_name: "Alchemy of Joy",
    description:
      "Your pocket coach for the Alchemy of Joy methodology — daily.",
    start_url: "/home",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Add a joy",
        short_name: "Add joy",
        description: "Add something to your List of Joy",
        url: "/quick-add",
        icons: [{ src: "/icon.png", sizes: "192x192" }],
      },
      {
        name: "Reset Breath",
        short_name: "Reset",
        description: "60-second nervous-system reset",
        url: "/curriculum/module/04-bold-action/60-second-reset",
        icons: [{ src: "/icon.png", sizes: "192x192" }],
      },
      {
        name: "Log Joy Pulse",
        short_name: "Pulse",
        description: "Quick 10-second mood check-in",
        url: "/home?focus=pulse",
        icons: [{ src: "/icon.png", sizes: "192x192" }],
      },
    ],
  };
}
