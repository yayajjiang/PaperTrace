import rawEvents from "@/data/events.json";

export type EventType = "Conference" | "Hackathon" | "Expo" | "Call";
export type EventFormat = "In person" | "Online" | "Hybrid";

export interface ResearchEvent {
  id: string;
  title: string;
  titleZh: string;
  type: EventType;
  domains: string[];
  startsAt: string;
  endsAt: string;
  deadlineAt?: string;
  deadlineLabel?: string;
  deadlineLabelZh?: string;
  location: string;
  locationZh: string;
  format: EventFormat;
  summary: string;
  summaryZh: string;
  organizer: string;
  href: string;
  verifiedAt: string;
}

export const researchEvents = rawEvents as ResearchEvent[];

