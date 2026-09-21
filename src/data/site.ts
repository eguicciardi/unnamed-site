export const ACCENTS = ["Blue ink", "Terracotta", "Rosa", "Olive"] as const;

const since = 2021;

export const site = {
  name: "Emanuele Guicciardi",
  domain: "guicciardi.net",
  description:
    "Personal site of Emanuele Guicciardi, a senior backend developer in Pisa, Italy.",
  bio: "Senior backend developer in Pisa, Italy. I design, maintain and secure the systems behind products, from architecture and APIs to delivery, so they keep working when traffic grows, networks fail and requirements change. I care about the small details that make software feel reliable.",
  email: "emanuele@guicciardi.net",
  github: "https://github.com/eguicciardi",
  linkedin: "https://it.linkedin.com/in/emanueleguicciardi",
  rss: "/rss.xml",
  current: {
    since,
    period: `${since} — present`,
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
