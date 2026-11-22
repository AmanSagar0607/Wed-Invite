import { defaultTheme } from "@/lib/themes";
import type { InviteData } from "@/lib/invite-schema";

export const sampleInvite: InviteData = {
  couple: {
    bride: "Ritisha",
    groom: "Samyak",
    tagline: "Two hearts, one beautiful beginning",
    brideFamily: "Beloved daughter of the family",
    groomFamily: "Beloved son of the family",
  },
  wording: {
    blessing: "With the blessings of our families, we invite you to join us as we begin our forever.",
    hostHeading: "Together with our families",
    invitation: "Please join us for a celebration filled with love, laughter, and cherished memories.",
  },
  weddingDate: "2027-01-03",
  whatsappNumber: "",
  hashtag: "#RitishaWedsSamyak",
  musicUrl: "",
  heroImage: "",
  heroVideo: "",
  events: [
    { id: "mehendi", title: "Mehendi", dateLabel: "Friday, 1 January 2027", calendarDate: "2027-01-01", time: "4:00 PM onwards", venue: "JMD Resort", city: "Mandav, Madhya Pradesh", dressCode: "Festive hues", mapsUrl: "https://maps.google.com/?q=JMD+Resort+Mandav+Madhya+Pradesh", imageUrl: "" },
    { id: "sangeet", title: "Sangeet Sandhya", dateLabel: "Saturday, 2 January 2027", calendarDate: "2027-01-02", time: "7:00 PM onwards", venue: "JMD Resort", city: "Mandav, Madhya Pradesh", dressCode: "Evening elegance", mapsUrl: "https://maps.google.com/?q=JMD+Resort+Mandav+Madhya+Pradesh", imageUrl: "" },
    { id: "wedding", title: "The Wedding Ceremony", dateLabel: "Sunday, 3 January 2027", calendarDate: "2027-01-03", time: "7:00 PM", venue: "JMD Resort", city: "Mandav, Madhya Pradesh", dressCode: "Traditional attire", mapsUrl: "https://maps.google.com/?q=JMD+Resort+Mandav+Madhya+Pradesh", imageUrl: "" },
  ],
  gallery: [],
  sections: { hero: true, blessing: true, date: true, countdown: true, events: true, gallery: true, rsvp: true, share: true, footer: true },
  sectionOrder: ["hero", "blessing", "date", "countdown", "events", "gallery", "rsvp", "share", "footer"],
  contacts: [],
  theme: defaultTheme,
};
