export interface SpotlightFields {
  memberLine: string;
  spotlightLine: string;
  name: string;
  role: string;
  blurb: string;
  handle: string;
}

export const DEFAULT_SPOTLIGHT_FIELDS: SpotlightFields = {
  memberLine: "Member",
  spotlightLine: "Spotlight",
  name: "John Doe",
  role: "[MAJOR]",
  blurb:
    "[2-3 SENTENCE BLURB ABOUT THE MEMBER: WHAT THEY WORK ON AND WHAT THEY BRING TO AAIR LABS.]",
  handle: "[@HANDLE / LINK IN BIO]",
};
