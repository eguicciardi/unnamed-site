export const ACCENTS = ["Blue ink", "Terracotta", "Rosa", "Olive"] as const;
export type Accent = (typeof ACCENTS)[number];

export const site = {
  name: "Emanuele Guicciardi",
  domain: "guicciardi.net",
  description:
    "Personal site of Emanuele Guicciardi, a senior full-stack developer in Pisa, Italy.",
  bio: "A senior full-stack developer based in Pisa, Italy, with a deep love for well-built backends. I specialize primarily in backend architecture and modern JavaScript, but I also enjoy shaping APIs, DevOps workflows and the small details that make software feel reliable.",
  email: "emanuele@guicciardi.net",
  github: "https://github.com/eguicciardi",
  linkedin: "https://it.linkedin.com/in/emanueleguicciardi",
  rss: "/rss.xml",
  current: {
    period: "2021 — present",
    role: "Senior Developer",
    employer: "Lifetronic Srl",
    employerUrl: "https://lifetronic.it",
    location: "Pisa, Italy",
    summary:
      "Backend architecture, API design and DevOps for scalable, user-focused products.",
  },
  skills: [
    "Node.js",
    "TypeScript",
    "API design",
    "PostgreSQL",
    "Docker",
    "AWS",
    "CI/CD",
    "System design",
  ],
} as const;
