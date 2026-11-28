export type PassportPageDef = {
  page: number;
  kind:
    | "identity"
    | "instructions"
    | "achievements"
    | "summary"
    | "verification"
    | "blank";
  title: string;
  pageGroup?: string;
  tocLabel: string;
};

/** Initial 32-page structure; additional achievement overflow appends after page 30. */
export const PASSPORT_PAGES: PassportPageDef[] = [
  { page: 1, kind: "identity", title: "Student Identity", tocLabel: "Identity" },
  { page: 2, kind: "instructions", title: "Institutional Message", tocLabel: "Instructions" },
  { page: 3, kind: "achievements", title: "Academic Achievements", pageGroup: "academic", tocLabel: "Academic I" },
  { page: 4, kind: "achievements", title: "Academic Achievements", pageGroup: "academic", tocLabel: "Academic II" },
  { page: 5, kind: "achievements", title: "Certifications & Technical Skills", pageGroup: "certifications", tocLabel: "Certifications I" },
  { page: 6, kind: "achievements", title: "Certifications & Technical Skills", pageGroup: "certifications", tocLabel: "Certifications II" },
  { page: 7, kind: "achievements", title: "Certifications & Technical Skills", pageGroup: "certifications", tocLabel: "Certifications III" },
  { page: 8, kind: "achievements", title: "Certifications & Technical Skills", pageGroup: "certifications", tocLabel: "Certifications IV" },
  { page: 9, kind: "achievements", title: "Certifications & Technical Skills", pageGroup: "certifications", tocLabel: "Certifications V" },
  { page: 10, kind: "achievements", title: "Certifications & Technical Skills", pageGroup: "certifications", tocLabel: "Certifications VI" },
  { page: 11, kind: "achievements", title: "Projects & Innovations", pageGroup: "projects", tocLabel: "Projects I" },
  { page: 12, kind: "achievements", title: "Projects & Innovations", pageGroup: "projects", tocLabel: "Projects II" },
  { page: 13, kind: "achievements", title: "Projects & Innovations", pageGroup: "projects", tocLabel: "Projects III" },
  { page: 14, kind: "achievements", title: "Projects & Innovations", pageGroup: "projects", tocLabel: "Projects IV" },
  { page: 15, kind: "achievements", title: "Internships & Industry", pageGroup: "internships", tocLabel: "Internships I" },
  { page: 16, kind: "achievements", title: "Internships & Industry", pageGroup: "internships", tocLabel: "Internships II" },
  { page: 17, kind: "achievements", title: "Hackathons & Competitions", pageGroup: "hackathons", tocLabel: "Hackathons I" },
  { page: 18, kind: "achievements", title: "Hackathons & Competitions", pageGroup: "hackathons", tocLabel: "Hackathons II" },
  { page: 19, kind: "achievements", title: "Leadership & Volunteer Service", pageGroup: "leadership", tocLabel: "Leadership I" },
  { page: 20, kind: "achievements", title: "Leadership & Volunteer Service", pageGroup: "leadership", tocLabel: "Leadership II" },
  { page: 21, kind: "achievements", title: "Sports Achievements", pageGroup: "sports", tocLabel: "Sports I" },
  { page: 22, kind: "achievements", title: "Sports Achievements", pageGroup: "sports", tocLabel: "Sports II" },
  { page: 23, kind: "achievements", title: "Cultural & Extracurricular", pageGroup: "cultural", tocLabel: "Cultural I" },
  { page: 24, kind: "achievements", title: "Cultural & Extracurricular", pageGroup: "cultural", tocLabel: "Cultural II" },
  { page: 25, kind: "achievements", title: "Research & Publications", pageGroup: "research", tocLabel: "Research I" },
  { page: 26, kind: "achievements", title: "Research & Publications", pageGroup: "research", tocLabel: "Research II" },
  { page: 27, kind: "achievements", title: "Training & Career Readiness", pageGroup: "training", tocLabel: "Training I" },
  { page: 28, kind: "achievements", title: "Training & Career Readiness", pageGroup: "training", tocLabel: "Training II" },
  { page: 29, kind: "achievements", title: "Special Achievements", pageGroup: "special", tocLabel: "Special I" },
  { page: 30, kind: "achievements", title: "Special Achievements", pageGroup: "special", tocLabel: "Special II" },
  { page: 31, kind: "summary", title: "Achievement Summary", tocLabel: "Summary" },
  { page: 32, kind: "verification", title: "Digital Verification", tocLabel: "Verification" },
];

export const SLOTS_PER_ACHIEVEMENT_PAGE = 4;
