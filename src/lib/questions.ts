export interface Question {
  id: number;
  text: string;
  options: string[];
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "How often do you take time to pause and appreciate the present moment, no matter how busy you are?",
    options: ["Almost never", "Rarely", "Sometimes", "Often", "Daily"],
  },
  {
    id: 2,
    text: "Do you engage in activities purely because they bring you joy, without any external reward or recognition?",
    options: ["Hardly ever", "Rarely", "Occasionally", "Often", "All the time"],
  },
  {
    id: 3,
    text: "How much do you savor small, everyday moments like a great meal, a walk in nature, or a meaningful conversation?",
    options: ["Almost never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 4,
    text: "How frequently do you make time for activities or hobbies that genuinely light you up?",
    options: ["Almost never", "Rarely", "Sometimes", "Often", "Regularly and consistently"],
  },
  {
    id: 5,
    text: "When faced with challenges, how easily can you find something positive or joyful in the situation?",
    options: [
      "I struggle to find joy",
      "Rarely able to see the positive",
      "Sometimes, but it's difficult",
      "Often, I find a silver lining",
      "I always look for growth and joy",
    ],
  },
  {
    id: 6,
    text: "How often do you take time to connect with yourself—through meditation, journaling, or quiet reflection?",
    options: ["Almost never", "Rarely", "Occasionally", "Often", "Daily"],
  },
  {
    id: 7,
    text: "Do you take regular breaks from work or responsibilities to recharge and enjoy life's simple pleasures?",
    options: ["Almost never", "Rarely", "Sometimes", "Often", "Very regularly"],
  },
  {
    id: 8,
    text: "How frequently do you feel gratitude for small, often overlooked blessings in your life?",
    options: ["Almost never", "Rarely", "Sometimes", "Often", "Daily"],
  },
  {
    id: 9,
    text: "When you think about your daily routine, do you feel like it's infused with activities and choices that bring you joy?",
    options: ["Not at all", "A little bit", "Somewhat", "Mostly", "Absolutely"],
  },
  {
    id: 10,
    text: "How much do you prioritize joy and well-being in your daily decision-making?",
    options: ["Not at all", "Rarely", "Sometimes", "Often", "It's my top priority"],
  },
];

export const MAX_SCORE = QUESTIONS.length * 5;
export const MIN_SCORE = QUESTIONS.length;

export interface JQBand {
  label: string;
  min: number;
  max: number;
  summary: string;
  color: string;
}

export const BANDS: JQBand[] = [
  {
    label: "Low JQ",
    min: 10,
    max: 20,
    color: "#64748b",
    summary:
      "You may not be investing in daily joy as much as you could. Consider small changes to bring more presence, gratitude, and joyful activities into your routine.",
  },
  {
    label: "Moderate JQ",
    min: 21,
    max: 30,
    color: "#4fb3c9",
    summary:
      "You experience moments of joy, but there's potential for more. Reflect on what brings you intrinsic joy and create more space for these experiences.",
  },
  {
    label: "High JQ",
    min: 31,
    max: 40,
    color: "#00a8e8",
    summary:
      "Your life is infused with joy, and you make intentional choices to nurture it. Keep expanding and deepening those joyful moments.",
  },
  {
    label: "Very High JQ",
    min: 41,
    max: 50,
    color: "#facc15",
    summary:
      "You live with a rich sense of joy and fulfillment, savoring each day. Keep prioritizing your well-being and inspiring others with your joyful presence!",
  },
];

export function getBand(score: number): JQBand {
  return BANDS.find((b) => score >= b.min && score <= b.max) ?? BANDS[0];
}
