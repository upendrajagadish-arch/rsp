export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type JourneyResource = {
  id: string;
  title: string;
  provider: string;
  url: string;
  resourceType: "course" | "docs" | "practice" | "project" | "certification";
  isFree: boolean;
  estimatedHours?: number;
  notes?: string;
  credentialConfirmed?: boolean;
};

export type JourneyMilestone = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  sortOrder: number;
  estimatedHours: number;
  requiredSkills: string[];
  practiceActivities: string[];
  projectChallenge: string;
  completionRequirements: string;
  optionalCertifications: string[];
  resources: JourneyResource[];
  dependsOn: string[];
};

export type CareerPath = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  jobRoleSlug: string;
  technologies: string[];
  milestones: JourneyMilestone[];
};

export const CAREER_PATHS: CareerPath[] = [
  {
    id: "path-frontend",
    slug: "frontend-developer",
    title: "Frontend Developer",
    summary: "Build accessible web interfaces with HTML, CSS, JavaScript/TypeScript, and React.",
    jobRoleSlug: "frontend-developer",
    technologies: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js"],
    milestones: [
      {
        id: "fe-m1",
        slug: "web-foundations",
        title: "Web foundations",
        summary: "Semantic HTML, modern CSS layout, and browser basics.",
        sortOrder: 1,
        estimatedHours: 12,
        requiredSkills: ["Programming Fundamentals", "JavaScript"],
        practiceActivities: [
          "Rebuild a simple college homepage with semantic HTML",
          "Recreate a card layout using Flexbox and Grid",
        ],
        projectChallenge: "Publish a personal profile page with responsive layout.",
        completionRequirements:
          "Submit a public page link plus a short note listing accessibility choices you made.",
        optionalCertifications: ["FreeCodeCamp Responsive Web Design (self-reported)"],
        dependsOn: [],
        resources: [
          {
            id: "r-mdn-html",
            title: "MDN HTML: A good basis for accessibility",
            provider: "MDN",
            url: "https://developer.mozilla.org/en-US/docs/Learn/Accessibility/HTML",
            resourceType: "docs",
            isFree: true,
            estimatedHours: 3,
          },
          {
            id: "r-webdev-css",
            title: "Learn CSS Grid",
            provider: "web.dev",
            url: "https://web.dev/learn/css/grid/",
            resourceType: "course",
            isFree: true,
            estimatedHours: 4,
          },
        ],
      },
      {
        id: "fe-m2",
        slug: "javascript-essentials",
        title: "JavaScript essentials",
        summary: "Language fundamentals, DOM practice, and small interactive widgets.",
        sortOrder: 2,
        estimatedHours: 16,
        requiredSkills: ["JavaScript", "Programming Fundamentals"],
        practiceActivities: [
          "Build a quiz scorer without a framework",
          "Write 10 array/object transformation exercises",
        ],
        projectChallenge: "Create a client-side skill checklist with local persistence.",
        completionRequirements:
          "Share a GitHub repo or CodeSandbox with at least one interactive feature and a README.",
        optionalCertifications: [],
        dependsOn: ["web-foundations"],
        resources: [
          {
            id: "r-js-info",
            title: "The Modern JavaScript Tutorial",
            provider: "javascript.info",
            url: "https://javascript.info/",
            resourceType: "course",
            isFree: true,
            estimatedHours: 10,
          },
        ],
      },
      {
        id: "fe-m3",
        slug: "react-interfaces",
        title: "React interfaces",
        summary: "Components, state, and data-driven UI patterns.",
        sortOrder: 3,
        estimatedHours: 20,
        requiredSkills: ["React", "JavaScript", "TypeScript"],
        practiceActivities: [
          "Convert a static page into React components",
          "Fetch and render a public JSON list with loading/error states",
        ],
        projectChallenge: "Build a filterable skills board for your passport.",
        completionRequirements:
          "Demo video or live URL plus a short explanation of component structure.",
        optionalCertifications: ["Meta Front-End related modules (self-reported if no issuer adapter)"],
        dependsOn: ["javascript-essentials"],
        resources: [
          {
            id: "r-react-learn",
            title: "React Learn",
            provider: "react.dev",
            url: "https://react.dev/learn",
            resourceType: "docs",
            isFree: true,
            estimatedHours: 8,
          },
          {
            id: "r-next-learn",
            title: "Next.js Learn",
            provider: "Vercel",
            url: "https://nextjs.org/learn",
            resourceType: "course",
            isFree: true,
            estimatedHours: 8,
            notes: "Credential availability depends on the specific track; do not assume a certificate.",
          },
        ],
      },
    ],
  },
  {
    id: "path-backend",
    slug: "backend-developer",
    title: "Backend Developer",
    summary: "APIs, data modeling, and server-side reliability with SQL and application logic.",
    jobRoleSlug: "backend-developer",
    technologies: ["Python", "Node.js", "SQL", "PostgreSQL", "REST APIs"],
    milestones: [
      {
        id: "be-m1",
        slug: "programming-core",
        title: "Programming core",
        summary: "Solid fundamentals before frameworks.",
        sortOrder: 1,
        estimatedHours: 14,
        requiredSkills: ["Programming Fundamentals", "Python"],
        practiceActivities: ["Solve 15 beginner algorithm problems", "Write unit tests for 3 functions"],
        projectChallenge: "CLI utility that transforms CSV to JSON with validation.",
        completionRequirements: "Repo with tests and sample input/output.",
        optionalCertifications: [],
        dependsOn: [],
        resources: [
          {
            id: "r-python-docs",
            title: "Python Tutorial",
            provider: "python.org",
            url: "https://docs.python.org/3/tutorial/",
            resourceType: "docs",
            isFree: true,
            estimatedHours: 8,
          },
        ],
      },
      {
        id: "be-m2",
        slug: "sql-data",
        title: "SQL and data modeling",
        summary: "Queries, joins, indexes awareness, and schema design basics.",
        sortOrder: 2,
        estimatedHours: 12,
        requiredSkills: ["SQL", "PostgreSQL"],
        practiceActivities: ["Design a 5-table schema for campus clubs", "Write reporting queries with joins"],
        projectChallenge: "Schema + seed + 8 useful queries for a student skills DB.",
        completionRequirements: "SQL file or migration folder with a README of query intents.",
        optionalCertifications: [],
        dependsOn: ["programming-core"],
        resources: [
          {
            id: "r-pg-tutorial",
            title: "PostgreSQL Tutorial",
            provider: "PostgreSQL",
            url: "https://www.postgresql.org/docs/current/tutorial.html",
            resourceType: "docs",
            isFree: true,
            estimatedHours: 6,
          },
        ],
      },
      {
        id: "be-m3",
        slug: "api-services",
        title: "API services",
        summary: "REST endpoints, validation, and auth-aware design.",
        sortOrder: 3,
        estimatedHours: 18,
        requiredSkills: ["Python", "SQL", "Programming Fundamentals"],
        practiceActivities: ["Build CRUD endpoints for skills", "Add request validation and error shapes"],
        projectChallenge: "Small API for certificate metadata with authenticated read/write roles.",
        completionRequirements: "OpenAPI or README endpoint table plus sample requests.",
        optionalCertifications: [],
        dependsOn: ["sql-data"],
        resources: [
          {
            id: "r-fastapi",
            title: "FastAPI Tutorial",
            provider: "FastAPI",
            url: "https://fastapi.tiangolo.com/tutorial/",
            resourceType: "docs",
            isFree: true,
            estimatedHours: 8,
          },
        ],
      },
    ],
  },
  {
    id: "path-cloud",
    slug: "cloud-engineer",
    title: "Cloud Engineer",
    summary: "Cloud fundamentals, core services, and security-minded operations.",
    jobRoleSlug: "cloud-engineer",
    technologies: ["AWS", "Cloud Fundamentals", "Networking basics", "Linux"],
    milestones: [
      {
        id: "cl-m1",
        slug: "cloud-foundations",
        title: "Cloud foundations",
        summary: "Shared responsibility, regions, and core service categories.",
        sortOrder: 1,
        estimatedHours: 10,
        requiredSkills: ["Cloud Fundamentals"],
        practiceActivities: ["Map a simple 3-tier app onto cloud services", "Draw a network boundary sketch"],
        projectChallenge: "Architecture one-pager for hosting a student passport app.",
        completionRequirements: "One-page diagram + short rationale document.",
        optionalCertifications: ["AWS Cloud Practitioner (issuer verification required for green stamp)"],
        dependsOn: [],
        resources: [
          {
            id: "r-aws-skill",
            title: "AWS Skill Builder — Cloud Essentials",
            provider: "AWS Skill Builder",
            url: "https://skillbuilder.aws/",
            resourceType: "course",
            isFree: true,
            estimatedHours: 6,
            notes: "Do not claim certificate award unless the specific course policy confirms it.",
            credentialConfirmed: false,
          },
          {
            id: "r-ms-learn-cloud",
            title: "Microsoft Learn — Cloud Concepts",
            provider: "Microsoft Learn",
            url: "https://learn.microsoft.com/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/",
            resourceType: "course",
            isFree: true,
            estimatedHours: 4,
          },
        ],
      },
      {
        id: "cl-m2",
        slug: "aws-core-services",
        title: "AWS core services",
        summary: "Compute, storage, IAM awareness, and hands-on labs.",
        sortOrder: 2,
        estimatedHours: 16,
        requiredSkills: ["AWS Services", "Cloud Fundamentals", "Cloud Security Fundamentals"],
        practiceActivities: ["Complete a free introductory lab", "Write an IAM least-privilege checklist"],
        projectChallenge: "Deploy a static site or simple API using free-tier friendly services.",
        completionRequirements: "Architecture notes + screenshots (no secrets) of the deployment.",
        optionalCertifications: ["AWS Cloud Practitioner"],
        dependsOn: ["cloud-foundations"],
        resources: [
          {
            id: "r-aws-docs",
            title: "AWS Getting Started",
            provider: "AWS",
            url: "https://aws.amazon.com/getting-started/",
            resourceType: "docs",
            isFree: true,
            estimatedHours: 4,
          },
        ],
      },
    ],
  },
  {
    id: "path-data",
    slug: "data-analyst",
    title: "Data Analyst",
    summary: "SQL, analysis workflows, and clear communication of findings.",
    jobRoleSlug: "data-analyst",
    technologies: ["SQL", "Python", "Spreadsheets", "Data Analysis"],
    milestones: [
      {
        id: "da-m1",
        slug: "analytics-sql",
        title: "Analytics with SQL",
        summary: "Querying, aggregations, and trustworthy metrics definitions.",
        sortOrder: 1,
        estimatedHours: 12,
        requiredSkills: ["SQL", "Data Analysis"],
        practiceActivities: ["Define 5 campus KPIs and write queries for each"],
        projectChallenge: "Dashboard-ready query pack for placement outcomes.",
        completionRequirements: "SQL notebook or file with KPI definitions.",
        optionalCertifications: [],
        dependsOn: [],
        resources: [
          {
            id: "r-mode-sql",
            title: "SQL Tutorial",
            provider: "Mode",
            url: "https://mode.com/sql-tutorial/",
            resourceType: "course",
            isFree: true,
            estimatedHours: 6,
          },
        ],
      },
      {
        id: "da-m2",
        slug: "python-analysis",
        title: "Python for analysis",
        summary: "Cleaning, exploration, and reproducible notebooks.",
        sortOrder: 2,
        estimatedHours: 14,
        requiredSkills: ["Python", "Data Analysis"],
        practiceActivities: ["Clean a messy CSV and document assumptions"],
        projectChallenge: "Notebook that explores skill demand vs student evidence for one role.",
        completionRequirements: "Notebook + short findings summary (no fabricated conclusions).",
        optionalCertifications: [],
        dependsOn: ["analytics-sql"],
        resources: [
          {
            id: "r-pandas",
            title: "Pandas getting started",
            provider: "pandas",
            url: "https://pandas.pydata.org/docs/getting_started/index.html",
            resourceType: "docs",
            isFree: true,
            estimatedHours: 5,
          },
        ],
      },
    ],
  },
];

export function getCareerPath(slugOrId: string) {
  return CAREER_PATHS.find((p) => p.slug === slugOrId || p.id === slugOrId) ?? null;
}

export function listCareerPaths() {
  return CAREER_PATHS.map(({ milestones: _m, ...rest }) => rest);
}
