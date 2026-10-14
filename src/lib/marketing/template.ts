export const MARKETING_ACCENT = "#F5A524";

export interface MarketingFields {
  line1: string;
  line2: string;
  line3: string;
  subheader: string;
  date: string;
  time: string;
  location: string;
  socialEvent: string;
}

export const DEFAULT_MARKETING_FIELDS: MarketingFields = {
  line1: "Tacos",
  line2: "and",
  line3: "Tech",
  subheader: "$1 Tacos and $0 Technology Discussions",
  date: "",
  time: "5 PM",
  location: "Nuevo León at 2069 N Central",
  socialEvent: "SOCIAL EVENT",
};
