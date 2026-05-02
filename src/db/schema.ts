export type Idea = {
  id: string;
  title: string;
  notes: string;
  tags: string[];
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
  sourceIdea: string | null;
  createdAt: number;
  updatedAt: number;
};
