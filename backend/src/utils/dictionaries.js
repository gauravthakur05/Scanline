// Curated reference dictionaries used by the deterministic scoring engine.
// These are intentionally broad but not exhaustive -- they exist to give the
// hybrid scorer real signal without depending on the AI call.

export const TECH_SKILLS = [
  // Languages
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "golang", "rust",
  "php", "ruby", "kotlin", "swift", "scala", "sql", "html", "css", "bash", "shell",
  // Frontend
  "react", "react.js", "next.js", "nextjs", "vue", "vue.js", "angular", "svelte",
  "redux", "tailwind", "tailwind css", "bootstrap", "sass", "webpack", "vite",
  // Backend
  "node.js", "nodejs", "express", "express.js", "django", "flask", "fastapi",
  "spring", "spring boot", "laravel", "rails", "ruby on rails", ".net", "asp.net",
  "graphql", "rest api", "restful api", "grpc", "microservices",
  // Databases
  "mongodb", "postgresql", "postgres", "mysql", "sqlite", "redis", "elasticsearch",
  "dynamodb", "firebase", "firestore", "cassandra", "oracle", "mariadb",
  // Cloud / DevOps
  "aws", "amazon web services", "azure", "gcp", "google cloud", "docker",
  "kubernetes", "k8s", "terraform", "jenkins", "ci/cd", "cicd", "github actions",
  "gitlab ci", "ansible", "nginx", "linux", "cloudformation", "serverless",
  // Data / ML
  "machine learning", "deep learning", "tensorflow", "pytorch", "pandas", "numpy",
  "scikit-learn", "data analysis", "data science", "nlp", "computer vision",
  "power bi", "tableau", "excel", "r programming", "spark", "hadoop", "airflow",
  // Tools
  "git", "github", "gitlab", "bitbucket", "jira", "confluence", "figma", "postman",
  "vs code", "webstorm", "npm", "yarn", "jest", "mocha", "cypress", "selenium",
  // Mobile
  "react native", "flutter", "android", "ios", "swiftui", "xamarin",
];

export const SOFT_SKILLS = [
  "communication", "leadership", "teamwork", "collaboration", "problem solving",
  "problem-solving", "critical thinking", "time management", "adaptability",
  "creativity", "attention to detail", "project management", "mentoring",
  "stakeholder management", "public speaking", "negotiation", "conflict resolution",
  "decision making", "analytical", "self-motivated", "ownership", "agile", "scrum",
];

export const ACTION_VERBS = [
  "achieved", "built", "created", "designed", "developed", "engineered",
  "implemented", "improved", "increased", "reduced", "launched", "led",
  "managed", "optimized", "orchestrated", "pioneered", "spearheaded", "streamlined",
  "transformed", "automated", "architected", "delivered", "deployed", "drove",
  "established", "executed", "generated", "initiated", "integrated", "migrated",
  "reengineered", "resolved", "scaled", "shipped", "solved", "strengthened",
  "accelerated", "boosted", "consolidated", "cut", "expanded", "formulated",
  "mentored", "negotiated", "overhauled", "reduced", "refactored", "revamped",
];

export const WEAK_PHRASES = [
  "responsible for", "worked on", "helped with", "duties included", "in charge of",
  "involved in", "tasked with", "assisted with", "participated in", "was part of",
  "hardworking", "team player", "detail oriented", "results driven", "go-getter",
  "think outside the box", "synergy", "hard worker", "self starter",
];

export const STANDARD_SECTION_HEADINGS = {
  summary: ["summary", "professional summary", "objective", "profile", "about me", "career objective"],
  experience: ["experience", "work experience", "professional experience", "employment history", "career history"],
  education: ["education", "academic background", "academic qualifications"],
  skills: ["skills", "technical skills", "core competencies", "key skills", "expertise"],
  projects: ["projects", "personal projects", "academic projects", "key projects"],
  certifications: ["certifications", "certificates", "licenses", "credentials"],
  achievements: ["achievements", "awards", "honors", "accomplishments"],
  contact: ["contact", "contact information"],
};

export const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "by", "from", "as", "is", "are", "was", "were", "be", "been", "being", "this",
  "that", "these", "those", "it", "its", "we", "you", "your", "our", "will", "shall",
  "can", "could", "should", "would", "may", "might", "must", "have", "has", "had",
  "do", "does", "did", "not", "no", "yes", "if", "then", "than", "so", "such",
  "into", "about", "over", "under", "per", "etc", "including", "including",
]);
