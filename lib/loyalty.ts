export const TIERS = [
  { name: "diamond", min: 700, discount: 10, label: "Kim Cương", color: "#3a9490", icon: "fa-gem" },
  { name: "gold",    min: 300, discount: 7,  label: "Vàng",      color: "#E5A919", icon: "fa-crown" },
  { name: "silver",  min: 100, discount: 3,  label: "Bạc",       color: "#9e9e9e", icon: "fa-medal" },
  { name: "bronze",  min: 0,   discount: 0,  label: "Đồng",      color: "#cd7f32", icon: "fa-award" },
] as const;

export type TierName = (typeof TIERS)[number]["name"];

export const POINTS_PER_BOOKING = 50;
export const GUIDE_LOYALTY_THRESHOLD = 3;
export const GUIDE_LOYALTY_BONUS_PCT = 5;

export function getTier(points: number) {
  return TIERS.find((t) => points >= t.min)!;
}

export function calcDiscount(points: number, hasGuideLoyalty: boolean): number {
  return getTier(points).discount + (hasGuideLoyalty ? GUIDE_LOYALTY_BONUS_PCT : 0);
}

export function pointsToNextTier(points: number): { next: string; needed: number } | null {
  const current = getTier(points);
  const idx = TIERS.findIndex((t) => t.name === current.name);
  if (idx === 0) return null; // already diamond
  const next = TIERS[idx - 1];
  return { next: next.label, needed: next.min - points };
}
