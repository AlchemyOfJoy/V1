/**
 * Notification copy library.
 *
 * Per the Build Directive tone guide (§9.5 / §10.3): never guilt, never
 * urgency, never "you broke X". Brent's voice — calm, warm, short.
 *
 * Each notification kind has copy for each channel because the medium
 * matters: push gets a title + body, email gets a subject + heading +
 * body, SMS gets one short line.
 */

export type NotificationKind =
  | "morning_subscript"
  | "evening_subscript"
  | "weekly_pillar"
  | "letter_delivered"
  | "gone_dark_7"
  | "gone_dark_21"
  | "milestone";

export type Channel = "push" | "email" | "sms";

export interface NotificationCopy {
  push: { title: string; body: string };
  email: { subject: string; heading: string; body: string };
  sms: string;
  /** Where the user lands when they tap the notification. */
  url: string;
}

export function copyFor(
  kind: NotificationKind,
  ctx: { name?: string; currentDay?: number; milestoneLabel?: string } = {},
): NotificationCopy {
  const first = ctx.name?.split(" ")[0] ?? "";
  const greeting = first ? `${first}, ` : "";
  const day = ctx.currentDay ?? null;

  switch (kind) {
    case "morning_subscript":
      return {
        push: {
          title: "Your SubScript is waiting",
          body: `${greeting}set the frequency before the world does.`,
        },
        email: {
          subject: "Your morning SubScript",
          heading: greeting ? `Morning, ${first}.` : "Morning.",
          body: "Five minutes with your SubScript before the day starts pulling at you. It sets the frequency.",
        },
        sms: `${greeting}your SubScript is waiting. Five minutes.`,
        url: "/curriculum/module/02-joyful-operating-system/subscript",
      };

    case "evening_subscript":
      return {
        push: {
          title: "Close the day",
          body: "Read your SubScript once more. Let it settle.",
        },
        email: {
          subject: "Close the day",
          heading: "One more time.",
          body: "Read your SubScript before sleep. It's the second half of the install.",
        },
        sms: "Close the day with your SubScript. Once more before sleep.",
        url: "/curriculum/module/02-joyful-operating-system/subscript",
      };

    case "weekly_pillar":
      return {
        push: {
          title: "Pillar check-in",
          body: "Where are you this week? Two minutes.",
        },
        email: {
          subject: "A weekly look at your Pillars",
          heading: "How are the Pillars?",
          body: "Score where you are now. The drift over time is the data — that's where the work shows up.",
        },
        sms: "Quick Pillar check-in this week. Two minutes.",
        url: "/curriculum/module/02-joyful-operating-system/priority-pillars",
      };

    case "letter_delivered":
      return {
        push: {
          title: "A letter arrived",
          body: "You wrote this. It's been waiting for today.",
        },
        email: {
          subject: "A letter from your past self arrived",
          heading: "A letter from you, to you.",
          body: "You wrote this on a past day with today in mind. It's waiting for you to open it.",
        },
        sms: "A letter from your past self arrived. It's been waiting for today.",
        url: "/me/letters",
      };

    case "gone_dark_7":
      return {
        push: {
          title: "The work is still here",
          body: "No streak to recover. Pick up wherever feels right.",
        },
        email: {
          subject: "The work is still here",
          heading: "Quietly checking in.",
          body: "It's been about a week. No streak to recover — the practice is here whenever you're ready. Start where you are.",
        },
        sms: "The work is still here. No streak to recover. Start where you are.",
        url: "/home",
      };

    case "gone_dark_21":
      return {
        push: {
          title: "Still here when you are",
          body: "Three weeks. The shelf is exactly as you left it.",
        },
        email: {
          subject: "Still here when you are",
          heading: "No pressure, no guilt.",
          body: "Three weeks. The methodology is the same. Your Pillars, your Self-Eulogy, your SubScript — exactly as you left them. We'll be quiet from here.",
        },
        sms: "Still here when you are. No pressure.",
        url: "/home",
      };

    case "milestone":
      return {
        push: {
          title: ctx.milestoneLabel ?? "Milestone earned",
          body: day ? `Day ${day}. The work is working.` : "The work is working.",
        },
        email: {
          subject: ctx.milestoneLabel ?? "Milestone earned",
          heading: ctx.milestoneLabel ?? "A marker on the path.",
          body: day
            ? `Day ${day}. The work is compounding. Notice what's different.`
            : "Another marker on the path. Notice what's different.",
        },
        sms: ctx.milestoneLabel
          ? `${ctx.milestoneLabel}. The work is working.`
          : "Milestone earned. The work is working.",
        url: "/me/wins",
      };
  }
}
