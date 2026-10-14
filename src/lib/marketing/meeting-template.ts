export interface MeetingFields {
  cadence: string;
  generalLine: string;
  meetingLine: string;
  summary: string;
  agenda: string[];
  date: string;
  time: string;
  location: string;
}

export const DEFAULT_MEETING_FIELDS: MeetingFields = {
  cadence: "WEEKLY / BIWEEKLY",
  generalLine: "General",
  meetingLine: "Meeting",
  summary: "[ONE-LINE SUMMARY OF WHAT WE'RE COVERING]",
  agenda: ["[AGENDA ITEM 1]", "[AGENDA ITEM 2]"],
  date: "[DAY, DATE]",
  time: "[TIME]",
  location: "[ROOM / LOCATION]",
};
