export const CATEGORY_LABELS: Record<string, string> = {
  workshop: "Workshop",
  soc_meeting: "SOC Meeting",
  headshot_session: "Headshot Session",
  speaker: "Guest Speaker",
};

export const EVENT_CATEGORIES = Object.keys(CATEGORY_LABELS) as Array<
  keyof typeof CATEGORY_LABELS
>;