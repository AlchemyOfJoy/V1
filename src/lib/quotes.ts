/**
 * 100 quotes from Brent's manuscript, tagged by ITT section.
 *
 * These power: Daily Joy Drop on Home, Coach Cards in context, the
 * Library quote browser, and "My Joy Library" favorites. No external
 * verification needed — every quote is from Brent's own published work.
 */

export type QuoteSection = "foundations" | "invest" | "train" | "action";

export type QuoteMood =
  | "inspiring"
  | "comforting"
  | "challenging"
  | "joyful"
  | "reverent"
  | "practical";

export interface Quote {
  id: string;
  body: string;
  section: QuoteSection;
  topics: string[];
  moods: QuoteMood[];
}

const Q = (
  id: string,
  body: string,
  section: QuoteSection,
  topics: string[],
  moods: QuoteMood[],
): Quote => ({ id, body, section, topics, moods });

export const QUOTES: Quote[] = [
  // FOUNDATIONS & OPENING (1–10)
  Q("q001", "Joy is not something you need to create, it's something already inside of you that you need to learn to tap into and unlock.", "foundations", ["joy"], ["inspiring", "reverent"]),
  Q("q002", "It's these hardships that became the seedlings for all future joy in my life.", "foundations", ["hardship", "joy"], ["comforting"]),
  Q("q003", "Right now, right here, you have a choice to make that will fundamentally change your life forever.", "foundations", ["choice", "agency"], ["challenging", "inspiring"]),
  Q("q004", "Today is the first day of the rest of your life.", "foundations", ["presence", "beginnings"], ["inspiring"]),
  Q("q005", "The truth is, the external world can only offer fleeting glimpses of joy.", "foundations", ["joy", "presence"], ["reverent"]),
  Q("q006", "True joy blossoms not from accumulation but from alignment — from living in harmony with our true nature and savoring the journey every step of the way.", "foundations", ["joy", "alignment"], ["reverent", "inspiring"]),
  Q("q007", "The path itself is where life unfolds.", "foundations", ["presence", "journey"], ["reverent"]),
  Q("q008", "True wealth lies not in what we possess, but rather in how deeply we live and how profoundly we love.", "foundations", ["wealth", "love"], ["reverent"]),
  Q("q009", "The moments of laughter, the adventures embarked upon, the love shared, the tears shed, the hardships endured — these are not pit stops on the road to a joyful life; they are the very essence of it.", "foundations", ["presence", "joy"], ["reverent", "inspiring"]),
  Q("q010", "Your dream life awaits… and it's closer than you think.", "foundations", ["dreams", "agency"], ["inspiring"]),

  // INVEST IN JOY (11–35)
  Q("q011", "Joy isn't some far-off reward for checking every box on your to-do list. It's fuel for the journey.", "invest", ["joy"], ["challenging", "practical"]),
  Q("q012", "When you consistently prioritize joy — even in small ways — you begin to rewire your nervous system. You teach your body that it's safe to feel good again.", "invest", ["nervous-system", "joy"], ["practical", "comforting"]),
  Q("q013", "Not someday. Not when everything's perfect. Now.", "invest", ["presence"], ["challenging"]),
  Q("q014", "Most adults slowly drift away from their joy that they forget it even exists, like Peter Pan forgetting he knew how to fly if only he could think happy thoughts.", "invest", ["joy"], ["comforting"]),
  Q("q015", "We get so caught up in the busy-ness of business that we forget to invest time, energy and attention into the things that truly bring us joy.", "invest", ["busyness", "joy"], ["practical"]),
  Q("q016", "What you focus on expands.", "invest", ["focus", "law-of-expansion"], ["practical", "inspiring"]),
  Q("q017", "If your focus isn't attuned to your joy, but rather is solely tuned into the busy-ness of life, your responsibilities and your stressors — your life will continue to be filled with more of exactly that.", "invest", ["focus", "busyness"], ["challenging"]),
  Q("q018", "The List of Joy reconnects you to the things that truly light you up.", "invest", ["list-of-joy"], ["practical"]),
  Q("q019", "They can be big things — but they also can be small as well. It can be the feeling of sunshine on your skin or just the look on your dog's face when you come home for the day.", "invest", ["list-of-joy", "presence"], ["joyful"]),
  Q("q020", "Whatever these things are for you — they are what make YOU truly unique and they are the internal wells that you can tap into to bring you happiness.", "invest", ["list-of-joy", "identity"], ["inspiring"]),
  Q("q021", "Intrinsic motivation is that internal fire, the thing that lights you up simply because it feels good to do it.", "invest", ["motivation"], ["practical"]),
  Q("q022", "When you're driven by what truly matters to you, you naturally feel more fulfilled and engaged.", "invest", ["motivation"], ["practical"]),
  Q("q023", "External validation shifts with trends, expectations, and the opinions of others — it's a moving target that's impossible to hit forever.", "invest", ["validation"], ["challenging"]),
  Q("q024", "Your List of Joy is a guide to your intrinsic motivators. It's a reminder of what brings you alive, what connects you to your authentic self, and what fills your life with meaning.", "invest", ["list-of-joy", "meaning"], ["inspiring"]),
  Q("q025", "The more you align your daily life with these intrinsic joys, the more fulfillment you'll experience, regardless of external pressures or expectations.", "invest", ["alignment"], ["practical"]),
  Q("q026", "Joy isn't just a fleeting moment — it's a constant undercurrent driving everything you do.", "invest", ["joy"], ["reverent"]),
  Q("q027", "A life built on intrinsic joy creates a steady foundation for happiness that isn't shaken by the ups and downs of external validation.", "invest", ["joy", "stability"], ["reverent"]),
  Q("q028", "Invest in experiences that make our hearts sing.", "invest", ["experience"], ["joyful"]),
  Q("q029", "Nurture relationships that deepen our connection to others and the world.", "invest", ["connection"], ["reverent"]),
  Q("q030", "Cultivate a sense of gratitude for the present moment.", "invest", ["gratitude", "presence"], ["reverent"]),
  Q("q031", "Embrace your individuality and pursue what lights you up — regardless of how much money you make or things you buy.", "invest", ["identity"], ["challenging", "inspiring"]),
  Q("q032", "Slow down. Savor the simple pleasures. Find beauty in the everyday, in the seemingly mundane and even in the hardships.", "invest", ["presence", "savoring"], ["reverent"]),
  Q("q033", "Yes, even in the hardships.", "invest", ["hardship"], ["comforting"]),
  Q("q034", "Live not for the promise of what might be but for the joy of what is.", "invest", ["presence"], ["reverent"]),
  Q("q035", "You will find a profound sense of aliveness and fulfillment that no external achievement or acquisition will ever match. That I promise.", "invest", ["fulfillment"], ["inspiring"]),

  // TRAIN YOUR BRAIN (36–74)
  Q("q036", "The story you've been telling yourself is not the truth. It's just a story. And you can rewrite it.", "train", ["core-narrative"], ["challenging", "inspiring"]),
  Q("q037", "Our core narrative isn't reality — it's an interpretation. It's a series of beliefs we've stacked on top of our experiences, layer by layer, until it becomes so deeply embedded that we mistake it for the truth.", "train", ["core-narrative"], ["practical"]),
  Q("q038", "If we want to experience true joy, we have to be willing to question that story.", "train", ["core-narrative"], ["challenging"]),
  Q("q039", "When you go back into your core narrative and shift the meaning, you're not just rewriting a story — you're rewriting your life.", "train", ["core-narrative"], ["inspiring"]),
  Q("q040", "You stop asking, 'Why did this happen to me?' and start asking, 'Why did this happen for me?'", "train", ["core-narrative", "reframe"], ["challenging", "inspiring"]),
  Q("q041", "The events of your past don't define you. The meaning you attach to them does.", "train", ["core-narrative"], ["challenging"]),
  Q("q042", "Turn pain into wisdom, struggle into strength, and loss into love.", "train", ["transformation"], ["inspiring", "reverent"]),
  Q("q043", "Change your story, change your life.", "train", ["core-narrative"], ["inspiring"]),
  Q("q044", "By beginning with the end in mind, you will anchor your life to what and who really matters.", "train", ["self-eulogy"], ["reverent"]),
  Q("q045", "Get the perspective of how short of a ride life really is and what really matters.", "train", ["self-eulogy", "overview-effect"], ["reverent"]),
  Q("q046", "What gets measured gets managed.", "train", ["pillars"], ["practical"]),
  Q("q047", "Whatever you're doing right now is working. That's awesome.", "train", ["pillars"], ["comforting"]),
  Q("q048", "Wherever you're feeling depleted — that's the area to invest in.", "train", ["pillars"], ["practical"]),
  Q("q049", "Trust your intuition and subconscious mind. Usually the first number you think of is the honest, true rating.", "train", ["pillars", "intuition"], ["practical"]),
  Q("q050", "Your subconscious mind drives 95% of the human experience and is 40,000 times more powerful than the conscious mind.", "train", ["subconscious", "subscript"], ["inspiring"]),
  Q("q051", "You already train your subconscious every single day, multiple times per day, and have done so your entire life.", "train", ["subconscious"], ["practical"]),
  Q("q052", "The information we ingest, the people we listen to and the society we are influenced by all train our subconscious mind to believe certain things, behave in a certain way and become the people we are today.", "train", ["subconscious", "environment"], ["practical"]),
  Q("q053", "We are going to leverage your RAS and train it daily to filter out the unnecessary information and pay attention to the information that's relevant for your dreams.", "train", ["ras", "subconscious"], ["practical"]),
  Q("q054", "Take control of what your subconscious mind will pay attention to, and before you know it, odd synchronicities and coincidences will start showing up in your life that will aid you in the direction of your dreams.", "train", ["subconscious", "synchronicity"], ["inspiring"]),
  Q("q055", "Do this priming exercise for 90 days straight and your life will never be the same.", "train", ["subscript", "challenge"], ["challenging", "inspiring"]),
  Q("q056", "World-class athletes visualize their game and victory ahead of the actual event happening. They play the scenarios in their mind and rehearse exactly what they are going to do — before it ever happens.", "train", ["visualization", "subscript"], ["practical"]),
  Q("q057", "When they step onto the field, they have already played the game a thousand times in their head.", "train", ["visualization"], ["practical", "inspiring"]),
  Q("q058", "It's not repetition that rewires your brain — it's repetition with emotion.", "train", ["subscript", "subconscious"], ["practical"]),
  Q("q059", "Your brain doesn't know it's a memory — it only knows the emotion.", "train", ["subconscious"], ["practical"]),
  Q("q060", "Trust the process. Keep going.", "train", ["perseverance"], ["comforting"]),
  Q("q061", "Most people give up in the first few weeks when they are merely three feet from gold.", "train", ["perseverance"], ["challenging"]),
  Q("q062", "You are the creator of your life.", "train", ["agency", "identity"], ["inspiring"]),
  Q("q063", "What will you create today?", "train", ["agency"], ["inspiring", "practical"]),
  Q("q064", "One of the critical unlocks to truly feeling unadulterated and sustaining joy is to remove the anger pangs that plague our happiness like terminal cancer.", "train", ["forgiveness", "anger"], ["challenging"]),
  Q("q065", "What if that situation, circumstance or trauma didn't happen TO you, but rather happened FOR you?", "train", ["reframe", "forgiveness"], ["challenging", "inspiring"]),
  Q("q066", "All hardships are just seedlings for future joy.", "train", ["hardship"], ["comforting"]),
  Q("q067", "Everything I thought happened TO me, actually happened FOR me.", "train", ["reframe", "forgiveness"], ["inspiring"]),
  Q("q068", "Victims that transmute their pain and past traumas into empowerment for a future they are creating — become victors of their lives.", "train", ["transformation"], ["inspiring"]),
  Q("q069", "Anger is the thief of joy. Forgiveness releases you of anger.", "train", ["forgiveness", "anger"], ["practical", "reverent"]),
  Q("q070", "What is left when you remove the emotional charge from a past memory? Wisdom.", "train", ["forgiveness", "wisdom"], ["reverent"]),
  Q("q071", "Forgiveness is the stepping stone to lasting, euphoric joy.", "train", ["forgiveness"], ["reverent"]),
  Q("q072", "Forgiveness is not about condoning or accepting the things that happened in your life as just, right or acceptable. It's about freeing YOU from the chains of their actions that are like anchors tying down a ship in a harbor.", "train", ["forgiveness"], ["reverent", "comforting"]),
  Q("q073", "Forgiveness is not for them. Forgiveness is for YOU.", "train", ["forgiveness"], ["reverent"]),
  Q("q074", "Be the badass that you are.", "train", ["identity"], ["joyful", "inspiring"]),

  // TAKE BOLD ACTION (75–100)
  Q("q075", "No matter how powerful your willpower is or how motivated you are, if you do not change the environment around you, or your behavior towards the world, or your habits — you are destined to fall right back into the old habit of your old self.", "action", ["environment", "habits"], ["challenging", "practical"]),
  Q("q076", "You MUST take aligned action. Every. Single. Day.", "action", ["action"], ["challenging"]),
  Q("q077", "Change never happens in the comfort zone.", "action", ["change"], ["challenging"]),
  Q("q078", "It's when we're pushed, challenged, and stretched beyond what feels comfortable that real transformation occurs.", "action", ["change", "growth"], ["challenging"]),
  Q("q079", "When you embrace challenges, you engage in what's known as positive stress, or eustress.", "action", ["change"], ["practical"]),
  Q("q080", "The more you challenge yourself, the more your comfort zone expands.", "action", ["growth"], ["inspiring"]),
  Q("q081", "What once felt daunting or impossible becomes the new normal.", "action", ["growth"], ["inspiring"]),
  Q("q082", "Challenges, when embraced, don't just test your limits; they expand them.", "action", ["growth"], ["inspiring"]),
  Q("q083", "When you perceive challenges as opportunities to grow, you shift from a mindset of resistance to one of acceptance and empowerment.", "action", ["mindset"], ["practical"]),
  Q("q084", "If you want everything to change, you must be willing to change everything — especially how you perceive and respond to challenges.", "action", ["change"], ["challenging"]),
  Q("q085", "The life of your dreams is not free from difficulties; it's rich with them, because it's through these very challenges that you become the person capable of living that dream.", "action", ["hardship", "dreams"], ["reverent", "challenging"]),
  Q("q086", "Use your pain as fuel, not a prison.", "action", ["hardship"], ["challenging"]),
  Q("q087", "Every challenge you've faced has given you strength.", "action", ["hardship"], ["comforting"]),
  Q("q088", "Past attempts were practice for this very moment.", "action", ["perseverance"], ["comforting"]),
  Q("q089", "I can start with small steps that energize me. Taking action, even little ones, can build momentum.", "action", ["action", "momentum"], ["practical"]),
  Q("q090", "I am someone who hikes with my dog three times per week.", "action", ["identity", "habits"], ["practical"]),
  Q("q091", "Disengaging from the news cycle is an act of reclaiming not only your dopamine balance but also your mental clarity and emotional equilibrium.", "action", ["dopamine", "boundaries"], ["practical"]),
  Q("q092", "Every intentional NO is really a sacred YES — a yes to more presence, more meaning, and more of the life your soul has been quietly asking for.", "action", ["jomo", "boundaries"], ["reverent"]),
  Q("q093", "Free up your life from the things that drain you of joy, outsource them to others who can do them for you at a rate less than your own.", "action", ["zero-gravity"], ["practical"]),
  Q("q094", "Expectations pull our happiness outside of ourselves, making it contingent on factors we can't fully control. Standards bring joy within reach by allowing us to embody our values here and now.", "action", ["expectations", "standards"], ["practical", "inspiring"]),
  Q("q095", "Joy becomes less about what might happen and more about how we choose to show up in each moment.", "action", ["presence"], ["reverent"]),
  Q("q096", "Make one day, today.", "action", ["presence", "action"], ["inspiring", "challenging"]),
  Q("q097", "One day is the greatest deception of our time, a horizon that recedes as we approach.", "action", ["presence"], ["challenging"]),
  Q("q098", "Today is brimming with untapped potential, an uncharted territory of joy and wonder waiting to be discovered.", "action", ["presence"], ["inspiring", "joyful"]),
  Q("q099", "Start small, but start now. Let each day be marked by at least one deliberate act of joy.", "action", ["action"], ["practical"]),
  Q("q100", "You are not who you were when you closed your eyes.", "action", ["transformation"], ["reverent", "inspiring"]),
];

export const QUOTES_BY_ID = new Map(QUOTES.map((q) => [q.id, q]));

export function quotesBySection(section: QuoteSection): Quote[] {
  return QUOTES.filter((q) => q.section === section);
}

export function quotesByTopic(topic: string): Quote[] {
  return QUOTES.filter((q) => q.topics.includes(topic));
}

export function quotesByMood(mood: QuoteMood): Quote[] {
  return QUOTES.filter((q) => q.moods.includes(mood));
}

/** All distinct topics across the library, alphabetized. */
export const ALL_TOPICS = Array.from(
  new Set(QUOTES.flatMap((q) => q.topics)),
).sort();

/** Deterministic daily index. */
export function quoteForDate(d: Date = new Date()): Quote {
  const seed = d.getFullYear() * 1000 + d.getMonth() * 50 + d.getDate();
  return QUOTES[seed % QUOTES.length];
}

/** Contextual pull — bias to a section if given. */
export function quoteForContext(
  d: Date,
  section?: QuoteSection,
): Quote {
  const pool = section ? quotesBySection(section) : QUOTES;
  if (pool.length === 0) return QUOTES[0];
  const seed = d.getFullYear() * 1000 + d.getMonth() * 50 + d.getDate();
  return pool[seed % pool.length];
}
