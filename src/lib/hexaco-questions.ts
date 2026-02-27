/**
 * HEXACO-60 questionnaire items and scoring keys.
 *
 * Reference:
 *   Ashton, M. C., & Lee, K. (2009). The HEXACO-60: A Short Measure of the
 *   Major Dimensions of Personality. Journal of Personality Assessment, 91(4),
 *   340-345.
 *
 * Items are used here for non-profit academic research (Tilburg University,
 * ethics approval TSB_RP2449_27).
 */

export type Dimension =
  | "honesty_humility"
  | "emotionality"
  | "extraversion"
  | "agreeableness"
  | "conscientiousness"
  | "openness";

export interface HexacoItem {
  /** 1-based item number */
  number: number;
  /** Item text */
  text: string;
  /** HEXACO dimension this item belongs to */
  dimension: Dimension;
  /** Whether this item is reverse-scored */
  reversed: boolean;
}

export const HEXACO_60_ITEMS: HexacoItem[] = [
  // 1 – Openness (R)
  { number: 1, text: "I would be quite bored by a visit to an art gallery.", dimension: "openness", reversed: true },
  // 2 – Conscientiousness
  { number: 2, text: "I plan ahead and organize things, to avoid scrambling at the last minute.", dimension: "conscientiousness", reversed: false },
  // 3 – Agreeableness
  { number: 3, text: "I rarely hold a grudge, even against people who have badly wronged me.", dimension: "agreeableness", reversed: false },
  // 4 – Extraversion
  { number: 4, text: "I feel reasonably satisfied with myself overall.", dimension: "extraversion", reversed: false },
  // 5 – Emotionality
  { number: 5, text: "I would feel afraid if I had to travel in bad weather conditions.", dimension: "emotionality", reversed: false },
  // 6 – Honesty-Humility
  { number: 6, text: "I wouldn't use flattery to get a raise or promotion at work, even if I thought it would succeed.", dimension: "honesty_humility", reversed: false },
  // 7 – Openness
  { number: 7, text: "I'm interested in learning about the history and politics of other countries.", dimension: "openness", reversed: false },
  // 8 – Conscientiousness
  { number: 8, text: "I often push myself very hard when trying to achieve a goal.", dimension: "conscientiousness", reversed: false },
  // 9 – Agreeableness (R)
  { number: 9, text: "People sometimes tell me that I am too critical of others.", dimension: "agreeableness", reversed: true },
  // 10 – Extraversion (R)
  { number: 10, text: "I rarely express my opinions in group meetings.", dimension: "extraversion", reversed: true },
  // 11 – Emotionality
  { number: 11, text: "I sometimes can't help worrying about little things.", dimension: "emotionality", reversed: false },
  // 12 – Honesty-Humility (R)
  { number: 12, text: "If I knew that I could never get caught, I would be willing to steal a million dollars.", dimension: "honesty_humility", reversed: true },
  // 13 – Openness
  { number: 13, text: "I would enjoy creating a work of art, such as a novel, a song, or a painting.", dimension: "openness", reversed: false },
  // 14 – Conscientiousness (R)
  { number: 14, text: "When working on something, I don't pay much attention to small details.", dimension: "conscientiousness", reversed: true },
  // 15 – Agreeableness (R)
  { number: 15, text: "People sometimes tell me that I'm too stubborn.", dimension: "agreeableness", reversed: true },
  // 16 – Extraversion
  { number: 16, text: "I prefer jobs that involve active social interaction to those that involve working alone.", dimension: "extraversion", reversed: false },
  // 17 – Emotionality
  { number: 17, text: "When I suffer from a painful experience, I need someone to make me feel comfortable.", dimension: "emotionality", reversed: false },
  // 18 – Honesty-Humility
  { number: 18, text: "Having a lot of money is not especially important to me.", dimension: "honesty_humility", reversed: false },
  // 19 – Openness (R)
  { number: 19, text: "I think that paying attention to radical ideas is a waste of time.", dimension: "openness", reversed: true },
  // 20 – Conscientiousness (R)
  { number: 20, text: "I make decisions based on the feeling of the moment rather than on careful thought.", dimension: "conscientiousness", reversed: true },
  // 21 – Agreeableness (R)
  { number: 21, text: "People think of me as someone who has a quick temper.", dimension: "agreeableness", reversed: true },
  // 22 – Extraversion
  { number: 22, text: "On most days, I feel cheerful and optimistic.", dimension: "extraversion", reversed: false },
  // 23 – Emotionality
  { number: 23, text: "I feel like crying when I see other people crying.", dimension: "emotionality", reversed: false },
  // 24 – Honesty-Humility (R)
  { number: 24, text: "I think that I am entitled to more respect than the average person is.", dimension: "honesty_humility", reversed: true },
  // 25 – Openness
  { number: 25, text: "If I had the opportunity, I would like to attend a classical music concert.", dimension: "openness", reversed: false },
  // 26 – Conscientiousness (R)
  { number: 26, text: "When working, I sometimes have difficulties due to being disorganized.", dimension: "conscientiousness", reversed: true },
  // 27 – Agreeableness
  { number: 27, text: "My attitude toward people who have treated me badly is \u2018forgive and forget.\u2019", dimension: "agreeableness", reversed: false },
  // 28 – Extraversion (R)
  { number: 28, text: "I feel that I am an unpopular person.", dimension: "extraversion", reversed: true },
  // 29 – Emotionality
  { number: 29, text: "When it comes to physical danger, I am very fearful.", dimension: "emotionality", reversed: false },
  // 30 – Honesty-Humility (R)
  { number: 30, text: "If I want something from someone, I will laugh at that person's worst jokes.", dimension: "honesty_humility", reversed: true },
  // 31 – Openness (R)
  { number: 31, text: "I've never really enjoyed looking through an encyclopedia.", dimension: "openness", reversed: true },
  // 32 – Conscientiousness (R)
  { number: 32, text: "I do only the minimum amount of work needed to get by.", dimension: "conscientiousness", reversed: true },
  // 33 – Agreeableness
  { number: 33, text: "I tend to be lenient in judging other people.", dimension: "agreeableness", reversed: false },
  // 34 – Extraversion
  { number: 34, text: "In social situations, I'm usually the one who makes the first move.", dimension: "extraversion", reversed: false },
  // 35 – Emotionality (R)
  { number: 35, text: "I worry a lot less than most people do.", dimension: "emotionality", reversed: true },
  // 36 – Honesty-Humility
  { number: 36, text: "I would never accept a bribe, even if it were very large.", dimension: "honesty_humility", reversed: false },
  // 37 – Openness
  { number: 37, text: "People have often told me that I have a good imagination.", dimension: "openness", reversed: false },
  // 38 – Conscientiousness
  { number: 38, text: "I always try to be accurate in my work, even at the expense of time.", dimension: "conscientiousness", reversed: false },
  // 39 – Agreeableness
  { number: 39, text: "I am usually quite flexible in my opinions when people disagree with me.", dimension: "agreeableness", reversed: false },
  // 40 – Extraversion
  { number: 40, text: "The first thing that I always do in a new place is to make friends.", dimension: "extraversion", reversed: false },
  // 41 – Emotionality (R)
  { number: 41, text: "I can handle difficult situations without needing emotional support from anyone else.", dimension: "emotionality", reversed: true },
  // 42 – Honesty-Humility (R)
  { number: 42, text: "I would get a lot of pleasure from owning expensive luxury goods.", dimension: "honesty_humility", reversed: true },
  // 43 – Openness
  { number: 43, text: "I like people who have unconventional views.", dimension: "openness", reversed: false },
  // 44 – Conscientiousness (R)
  { number: 44, text: "I make a lot of mistakes because I don't think before I act.", dimension: "conscientiousness", reversed: true },
  // 45 – Agreeableness
  { number: 45, text: "Most people tend to get angry more quickly than I do.", dimension: "agreeableness", reversed: false },
  // 46 – Extraversion (R)
  { number: 46, text: "Most people are more upbeat and dynamic than I generally am.", dimension: "extraversion", reversed: true },
  // 47 – Emotionality
  { number: 47, text: "I feel strong emotions when someone close to me is going away for a long time.", dimension: "emotionality", reversed: false },
  // 48 – Honesty-Humility (R)
  { number: 48, text: "I want people to know that I am an important person of high status.", dimension: "honesty_humility", reversed: true },
  // 49 – Openness (R)
  { number: 49, text: "I don't think of myself as the artistic or creative type.", dimension: "openness", reversed: true },
  // 50 – Conscientiousness
  { number: 50, text: "People often call me a perfectionist.", dimension: "conscientiousness", reversed: false },
  // 51 – Agreeableness
  { number: 51, text: "Even when people make a lot of mistakes, I rarely say anything negative.", dimension: "agreeableness", reversed: false },
  // 52 – Extraversion (R)
  { number: 52, text: "I sometimes feel that I am a worthless person.", dimension: "extraversion", reversed: true },
  // 53 – Emotionality (R)
  { number: 53, text: "Even in an emergency I wouldn't feel like panicking.", dimension: "emotionality", reversed: true },
  // 54 – Honesty-Humility
  { number: 54, text: "I wouldn't pretend to like someone just to get that person to do favors for me.", dimension: "honesty_humility", reversed: false },
  // 55 – Openness (R)
  { number: 55, text: "I find it boring to discuss philosophy.", dimension: "openness", reversed: true },
  // 56 – Conscientiousness (R)
  { number: 56, text: "I prefer to do whatever comes to mind, rather than stick to a plan.", dimension: "conscientiousness", reversed: true },
  // 57 – Agreeableness (R)
  { number: 57, text: "When people tell me that I'm wrong, my first reaction is to argue with them.", dimension: "agreeableness", reversed: true },
  // 58 – Extraversion
  { number: 58, text: "When I'm in a group of people, I'm often the one who speaks on behalf of the group.", dimension: "extraversion", reversed: false },
  // 59 – Emotionality (R)
  { number: 59, text: "I remain unemotional even in situations where most people get very sentimental.", dimension: "emotionality", reversed: true },
  // 60 – Honesty-Humility (R)
  { number: 60, text: "I'd be tempted to use counterfeit money, if I were sure I could get away with it.", dimension: "honesty_humility", reversed: true },
];

/** Labels for the 5-point Likert response scale */
export const RESPONSE_OPTIONS = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
] as const;

/** Human-readable dimension labels */
export const DIMENSION_LABELS: Record<Dimension, string> = {
  honesty_humility: "Honesty-Humility",
  emotionality: "Emotionality",
  extraversion: "Extraversion",
  agreeableness: "Agreeableness",
  conscientiousness: "Conscientiousness",
  openness: "Openness to Experience",
};

/**
 * Calculate HEXACO dimension scores from raw answers.
 * @param answers - Map from 1-based item number to raw response (1-5)
 * @returns Dimension scores (each 1.0-5.0), or null if any answers are missing
 */
export function calculateScores(
  answers: Record<number, number>
): Record<Dimension, number> | null {
  const dimensions: Dimension[] = [
    "honesty_humility",
    "emotionality",
    "extraversion",
    "agreeableness",
    "conscientiousness",
    "openness",
  ];

  const result: Partial<Record<Dimension, number>> = {};

  for (const dim of dimensions) {
    const items = HEXACO_60_ITEMS.filter((item) => item.dimension === dim);
    let sum = 0;

    for (const item of items) {
      const raw = answers[item.number];
      if (raw === undefined || raw < 1 || raw > 5) return null;
      sum += item.reversed ? 6 - raw : raw;
    }

    result[dim] = Math.round((sum / items.length) * 100) / 100;
  }

  return result as Record<Dimension, number>;
}
