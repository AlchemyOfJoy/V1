/** The 20 AOJ Toolkit entries — verbatim text from the spec §11. */

export interface ToolkitEntry {
  slug: string;
  title: string;
  subtitle: string;
  body: string;
  /** If this tool has a hands-on exercise elsewhere, link to it. */
  practiceHref?: string;
}

export const TOOLKIT: ToolkitEntry[] = [
  {
    slug: "sixty-second-shift",
    title: "60-Second Shift",
    subtitle: "Move before fear catches up.",
    body: "The 60-Second Shift is a decision-making tool based on one powerful principle: when you feel a surge of inspiration or an intuitive nudge to act, you have roughly 60 seconds to take bold action before your brain talks you out of it. Make the call, send the message, book the ticket, say yes — move before fear catches up. The goal is not perfection but movement, because movement rewires your identity into someone who acts in alignment with what matters most.",
  },
  {
    slug: "biological-prime-time",
    title: "Biological Prime Time / Biological Down Time",
    subtitle: "Work with your biology, not against it.",
    body: "Your Biological Prime Time (BPT) is the window in your day when your brain and body are naturally at their peak — when focus is sharpest and energy is highest. Your Biological Down Time (BDT) is the natural trough when energy dips and your body is asking you to slow down. By identifying both windows and aligning your most demanding tasks with your BPT and lighter tasks or movement with your BDT, you work with your biology instead of against it, making your days feel exponentially easier.",
  },
  {
    slug: "dopamine-detox",
    title: "Dopamine Detox",
    subtitle: "Reclaim your brain's reward system.",
    body: "The Dopamine Detox is a 30-day challenge to reclaim your brain's reward system from modern “dopamine hijackers” — social media, news apps, processed foods, binge-watching, and mindless shopping. The practice involves deleting news apps, turning off all push notifications, eliminating doomscrolling, stopping binge-watching, and cutting processed food and sugar. By reducing these artificial stimulants, you retrain your brain to find joy in more natural, sustainable sources and reconnect with calm, clarity, and presence.",
  },
  {
    slug: "emotional-alchemy-formula",
    title: "Emotional Alchemy Formula",
    subtitle: "Feel it. Ask it. Move it.",
    body: "The Emotional Alchemy Formula is a three-step practice for transforming difficult emotions into clarity, wisdom, and forward momentum: (1) Feel It — name the emotion and notice where it lives in your body; (2) Ask It — treat the emotion like a messenger and ask what it is trying to tell you; (3) Move It — give the emotion a healthy physical outlet such as movement, breathwork, journaling, or time in nature so it does not stay stuck. When you stop seeing emotions as problems and start seeing them as portals, they become fuel for growth.",
  },
  {
    slug: "evening-wind-down",
    title: "Evening Wind-Down",
    subtitle: "Signal to your body that the day is done.",
    body: "The Evening Wind-Down is an intentional nightly routine designed to help you transition from the activity of your day into a state of rest, reflection, and integration. It involves disconnecting from screens, engaging in calming activities like a hot shower, reading, or calming music, and practicing gratitude. A consistent Evening Wind-Down signals to your body that it is time for repair mode, helping you process the day, prepare for restorative sleep, and set the stage for a stronger morning.",
  },
  {
    slug: "forgiveness-framework",
    title: "Forgiveness Framework",
    subtitle: "Release the weight you've been carrying.",
    body: "The Forgiveness Framework is a four-step private process for releasing the emotional weight of past hurts and resentments: (1) Victim Rant — get all your pain out with complete honesty; (2) Empath Rave — try to see the humanity and perspective of the person who hurt you; (3) Universal Meaning — find the lesson, growth, or deeper purpose the experience gave you; (4) Forgiveness — formally release the energetic tie and choose love for yourself. This process is done privately for your own freedom — you do not need to contact the other person — and should be worked through in exact order for each person on your Forgiveness Hit List.",
  },
  {
    slug: "habit-renaissance",
    title: "Habit Renaissance",
    subtitle: "Become the conscious architect of your days.",
    body: "The Habit Renaissance is the process of becoming the conscious architect of your daily life by identifying and unwinding the default habits that drain your energy and intentionally replacing them with joyful rituals that serve your growth. It begins with honestly spotlighting your current harmful habits, then layering in new ones — starting with your morning and evening rituals, sleep, and gradually adding movement, meditation, giving, and play. The core principle is that if you do not design your days with intention, they will be designed for you by algorithms, old wounds, and autopilot programming.",
  },
  {
    slug: "itt-framework",
    title: "ITT Framework",
    subtitle: "Invest in Joy · Train Your Brain · Take Bold Action.",
    body: "The ITT Framework is the core roadmap of the Alchemy of Joy system, built on three pillars: Invest in Joy (making joy a daily, non-negotiable priority), Train Your Brain (reprogramming your subconscious mind through practices like visualization, meditation, and intentional repetition), and Take Bold Action (turning inner work into outer transformation by acting when you are in an elevated, inspired state). Together, these three pillars create a permanent neurological, emotional, and spiritual path back to who you truly are.",
  },
  {
    slug: "jomo",
    title: "JOMO — Joy of Missing Out",
    subtitle: "Every intentional “no” is really a sacred “yes”.",
    body: "JOMO is the practice of intentionally saying “no” to things that do not align with your values, priorities, or energy so you can create space for a full-bodied “yes” to what truly matters. It is a conscious shift away from the fear of missing out (FOMO) and toward becoming wildly intentional with where you place your time, energy, and attention. Every intentional “no” is really a sacred “yes” — a yes to more presence, more meaning, and more of the life your soul has been quietly asking for.",
  },
  {
    slug: "joy-judo",
    title: "Joy Judo",
    subtitle: "Use life's hardest moments as fuel.",
    body: "Joy Judo is the art of using life's hardest moments as fuel for your greatest breakthroughs, rather than being crushed by them. The three steps are: (1) Accept and Assess — pause, get curious instead of furious, and understand what you are dealing with; (2) Leverage and Adapt — find the hidden opportunity or lesson within the challenge; (3) Execute — redirect the energy of the challenge toward growth and wisdom. Joy Judo is not about pretending bad things are good — it is about discovering the good that can exist alongside the bad and using life's force to propel you forward.",
  },
  {
    slug: "jq-assessment",
    title: "Joy Quotient (JQ) Assessment",
    subtitle: "Because what gets measured gets momentum.",
    body: "The Joy Quotient is a simple self-assessment quiz you can complete in less than five minutes that gives you a clear snapshot of how much real, felt, embodied joy is currently present in your life. It serves as your starting line and tracking tool — recommended monthly for the first year, then quarterly — so you can measure your progress and see the transformation over time. Because what gets measured gets momentum, and the JQ makes the invisible shifts visible.",
    practiceHref: "/assessment",
  },
  {
    slug: "dad-framework",
    title: "Joyful Habit Framework — D.A.D.",
    subtitle: "Desire · Action · Dopamine.",
    body: "The Joyful Habit Framework uses your brain's natural reward system to build new habits through three steps: Desire (start with something you already crave), Action (place the new habit immediately before that craving as the cost of entry), and Dopamine (reward yourself with the craving right after completing the habit). Over time, your brain begins to associate the new habit with the reward itself, making it something you want to do rather than something you force. You can also stack multiple new habits before the same reward through habit compounding.",
  },
  {
    slug: "law-of-expansion",
    title: "Law of Expansion",
    subtitle: "What you focus on expands.",
    body: "The Law of Expansion is the principle that what you focus on expands. Your Reticular Activating System (RAS) acts as a filter for your awareness, meaning where you place your attention and energy is what you will notice and experience more of. If you consciously focus on what is good, positive, and joyful, you will train your brain to see and draw more of that into your life, whereas focusing on the negative will only amplify what you don't want.",
  },
  {
    slug: "law-of-zero-gravity",
    title: "Law of Zero Gravity",
    subtitle: "Clear the gravity. Rise into what matters.",
    body: "The Law of Zero Gravity is a time and energy management principle: if you can pay someone less than your own hourly rate to do a task that drains your energy, outsource it and reclaim that time for what brings you joy. In this context, “gravity” is the invisible pull of tasks, obligations, and responsibilities that weigh you down and steal your space for what truly matters. By doing a simple audit of your commitments and clearing the clutter that drags you down, you create the lightness and freedom to rise into a more intentional, joyful way of living.",
  },
  {
    slug: "morning-orbit",
    title: "Morning Orbit",
    subtitle: "Launch the day on purpose.",
    body: "The Morning Orbit is an intentional morning routine that serves as a launch sequence for your day, putting you into the right mental, emotional, and physical orbit. It has four key parts: mental (lingering in theta brainwaves upon waking and priming with your SubScript), biological (hydrating and clearing your system), physical (at least 10–15 minutes of movement), and emotional (meditation to calm and center your nervous system). Whether your Morning Orbit is two hours or twenty minutes, what matters is that it is intentional — you are choosing what you feed your mind and body first, instead of letting your phone or inbox set your energy for the day.",
  },
  {
    slug: "one-minute-window",
    title: "One Minute Window",
    subtitle: "A 60-second pattern interrupt back into the present.",
    body: "The One Minute Window is a simple but powerful 60-second pattern interrupt that snaps you out of unconscious autopilot and back into the present moment — the only place joy truly exists. For just one minute, you pause all activity, take a physiological sigh (inhale 6 seconds, hold 4, exhale 8 with a soft “ahhhhh”), and then zoom in on one thing around you with full sensory attention. This practice slows your heart rate, lowers cortisol, quiets the amygdala, and creates space for joy to rise naturally.",
  },
  {
    slug: "overview-effect",
    title: "Overview Effect",
    subtitle: "See the full arc of your life.",
    body: "Inspired by the profound shift in perspective astronauts experience when viewing Earth from space, the Overview Effect exercise is designed to give you that same clarity — not for the planet, but for your life. You do this by writing your own Self Eulogy from the perspective of one person you deeply love and respect, imagining what they would say about who you were, how you lived, and the impact you made. This practice pulls you out of the daily grind to see the full arc of your life, helping you realign your priorities and live with a greater sense of purpose and meaning.",
  },
  {
    slug: "reframe-ritual",
    title: "Reframe Ritual",
    subtitle: "Catch the story. Flip the script. Anchor the shift.",
    body: "The Reframe Ritual is a three-step framework for rewriting limiting beliefs and old stories that no longer serve you, drawing on narrative therapy, cognitive behavioral psychology, and neuroplasticity. The steps are: (1) Catch the Story — notice when you are slipping into a negative narrative, pause, take three slow breaths, and ask “What story am I telling myself right now?”; (2) Flip the Script — take the old belief and consciously rewrite it into an empowering truth; (3) Anchor the Shift — close your eyes, place your hand on your heart, and repeat the new story five times while feeling its truth in your body. With repetition, your brain rewires and the old scripts lose their grip.",
  },
  {
    slug: "reset-breath",
    title: "Reset Breath",
    subtitle: "Your nervous system's reset button.",
    body: "The Reset Breath is your nervous system's reset button — a simple breathing pattern you can use anytime you feel overwhelmed, anxious, or emotionally flooded. Inhale deeply through your nose for 6 seconds, hold gently for 4 seconds, then exhale slowly through your mouth for 8 seconds with a soft “ahhhhh” sound, and repeat for 3 to 5 rounds. This extended exhale stimulates the vagus nerve, signaling safety to your brain and body, helping you shift out of fight-or-flight and into calm, grounded presence in less than a minute.",
  },
  {
    slug: "spirit-walks",
    title: "Spirit Walks",
    subtitle: "Long walks with one soulful question.",
    body: "A Spirit Walk is a long, intentional, solo walk in nature with one soulful question on your heart — done without any distractions: no phone, no headphones, no music. Before you head out, choose one open-hearted question to hold gently as you walk, such as “What am I ready to release?” or “What does my soul need right now?” The combination of movement, nature, and self-inquiry creates a sacred space where your nervous system softens, old stories loosen their grip, and quiet clarity begins to emerge.",
  },
];

export function findTool(slug: string): ToolkitEntry | undefined {
  return TOOLKIT.find((t) => t.slug === slug);
}
