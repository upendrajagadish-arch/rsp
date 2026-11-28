export type StampCategoryDef = {
  code: string;
  title: string;
  colour: string;
  iconKey: string;
  pageGroup: string;
  sortOrder: number;
};

/** Centralized registry — admins can extend via DB; this is the built-in seed. */
export const STAMP_CATEGORIES: StampCategoryDef[] = [
  { code: "01", title: "Certification Completed", colour: "#6B4C9A", iconKey: "certificate", pageGroup: "certifications", sortOrder: 1 },
  { code: "02", title: "Project Completed", colour: "#2F6B4F", iconKey: "project", pageGroup: "projects", sortOrder: 2 },
  { code: "03", title: "Internship Completed", colour: "#C46A2B", iconKey: "internship", pageGroup: "internships", sortOrder: 3 },
  { code: "04", title: "Hackathon Participated", colour: "#B33A3A", iconKey: "hackathon", pageGroup: "hackathons", sortOrder: 4 },
  { code: "05", title: "Hackathon Winner", colour: "#6B4C9A", iconKey: "trophy", pageGroup: "hackathons", sortOrder: 5 },
  { code: "06", title: "Leadership Role", colour: "#2F6B4F", iconKey: "leadership", pageGroup: "leadership", sortOrder: 6 },
  { code: "07", title: "Volunteer Service", colour: "#2F5F8A", iconKey: "volunteer", pageGroup: "leadership", sortOrder: 7 },
  { code: "08", title: "Semester Topper — 1st", colour: "#7A5C3A", iconKey: "medal", pageGroup: "academic", sortOrder: 8 },
  { code: "09", title: "Semester Topper — 2nd", colour: "#7A5C3A", iconKey: "medal", pageGroup: "academic", sortOrder: 9 },
  { code: "10", title: "Semester Topper — 3rd", colour: "#7A5C3A", iconKey: "medal", pageGroup: "academic", sortOrder: 10 },
  { code: "11", title: "Sports — 1st Place", colour: "#2F5F8A", iconKey: "sports", pageGroup: "sports", sortOrder: 11 },
  { code: "12", title: "Sports — 2nd Place", colour: "#2F5F8A", iconKey: "sports", pageGroup: "sports", sortOrder: 12 },
  { code: "13", title: "Sports — 3rd Place", colour: "#2F5F8A", iconKey: "sports", pageGroup: "sports", sortOrder: 13 },
  { code: "14", title: "Event Participation", colour: "#6B4C9A", iconKey: "event", pageGroup: "cultural", sortOrder: 14 },
  { code: "15", title: "Event Winner", colour: "#B69A59", iconKey: "trophy", pageGroup: "cultural", sortOrder: 15 },
  { code: "16", title: "Dance Participation", colour: "#9B2C4A", iconKey: "dance", pageGroup: "cultural", sortOrder: 16 },
  { code: "17", title: "Singing Participation", colour: "#B33A3A", iconKey: "music", pageGroup: "cultural", sortOrder: 17 },
  { code: "18", title: "Anchoring Participation", colour: "#6B4C9A", iconKey: "mic", pageGroup: "cultural", sortOrder: 18 },
  { code: "19", title: "Drama Participation", colour: "#6A3D8A", iconKey: "drama", pageGroup: "cultural", sortOrder: 19 },
  { code: "20", title: "Music Participation", colour: "#9B2C4A", iconKey: "music", pageGroup: "cultural", sortOrder: 20 },
  { code: "21", title: "Paper Publication", colour: "#B33A3A", iconKey: "publication", pageGroup: "research", sortOrder: 21 },
  { code: "22", title: "Extracurricular Activity", colour: "#9B2C4A", iconKey: "extra", pageGroup: "cultural", sortOrder: 22 },
  { code: "23", title: "Cultural Participation", colour: "#2F5F8A", iconKey: "culture", pageGroup: "cultural", sortOrder: 23 },
  { code: "24", title: "Book Writing", colour: "#1F6F6A", iconKey: "book", pageGroup: "research", sortOrder: 24 },
];

export function stampByCode(code: string) {
  return STAMP_CATEGORIES.find((c) => c.code === code) ?? null;
}

export function stampsByPageGroup(group: string) {
  return STAMP_CATEGORIES.filter((c) => c.pageGroup === group);
}
