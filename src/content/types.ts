import rawContent from './content.json';

export interface PersonLinks {
  github: string;
  linkedin: string;
  email: string;
  resume: string;
}

export interface Person {
  name: string;
  line: string;
  tagline: string;
  location: string;
  college: string;
  photo: string;
  links: PersonLinks;
}

export interface SkillGroup {
  group: string;
  items: string[];
}

export interface TicketConfig {
  title: string;
  serial: string;
  unlockAfter: number;
  hint: string;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  code: string;
  title: string;
  event: string;
  what: string;
  wrong: string;
  stack: string[];
  links: ProjectLink[];
  golden?: boolean;
}

export interface PortfolioContent {
  person: Person;
  about: string[];
  skills: SkillGroup[];
  ticket: TicketConfig;
  projects: Project[];
}

export const content: PortfolioContent = rawContent;

