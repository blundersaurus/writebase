export type RefLink = {
  url: string;
  title: string;
};

export type Idea = {
  id: string;
  title: string;
  notes: string;
  tags: string[];
  icon: string | null;
  links: RefLink[];
  createdAt: number;
  updatedAt: number;
  promotedTo: string | null;
};

export type Article = {
  id: string;
  title: string;
  contentHtml: string;
  status: "draft" | "completed";
  tags: string[];
  icon: string | null;
  links: RefLink[];
  sourceIdea: string | null;
  createdAt: number;
  updatedAt: number;
};

export type StoryIdea = {
  id: string;
  title: string;
  notes: string;
  tags: string[];
  icon: string | null;
  links: RefLink[];
  createdAt: number;
  updatedAt: number;
  promotedTo: string | null;
};

export type StoryDraft = {
  id: string;
  title: string;
  notes: string;
  tags: string[];
  icon: string | null;
  links: RefLink[];
  sourceIdea: string | null;
  createdAt: number;
  updatedAt: number;
};
