import { NextResponse } from "next/server";
import { articlesRepo, ideasRepo } from "@/db/repo";
import { newId } from "@/lib/id";

type Idea = NonNullable<Awaited<ReturnType<typeof ideasRepo.get>>>;

type DraftResponse = {
  title: string;
  summary: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
};

type OpenAIContent = {
  type?: string;
  text?: unknown;
};

type OpenAIOutputItem = {
  content?: OpenAIContent[];
};

type OpenAIResponse = {
  output_text?: unknown;
  output?: OpenAIOutputItem[];
};

const DEFAULT_MODEL = "gpt-4.1-mini";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const idea = await ideasRepo.get(id);
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const mode = body.mode === "debate" ? "debate" : body.mode === "draft" ? "draft" : null;
  if (!mode) return NextResponse.json({ error: "Invalid AI mode." }, { status: 400 });

  try {
    if (mode === "draft") {
      if (idea.promotedTo) {
        return NextResponse.json(
          { error: "This idea already has a draft.", articleId: idea.promotedTo },
          { status: 409 },
        );
      }

      const draft = await createArticleDraft(apiKey, idea);
      const now = Date.now();
      const articleId = newId();

      await articlesRepo.insert({
        id: articleId,
        title: draft.title.trim() || idea.title,
        contentHtml: draftToHtml(draft),
        status: "draft",
        tags: idea.tags,
        icon: idea.icon,
        links: idea.links,
        sourceIdea: idea.id,
        createdAt: now,
        updatedAt: now,
      });

      await ideasRepo.update(id, { promotedTo: articleId, updatedAt: now });

      return NextResponse.json({
        articleId,
        title: draft.title,
        summary: draft.summary,
      });
    }

    const message = typeof body.message === "string" ? body.message : "";
    const reply = await debateIdea(apiKey, idea, message);
    return NextResponse.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

async function createArticleDraft(apiKey: string, idea: Idea): Promise<DraftResponse> {
  const text = await callResponsesApi(apiKey, {
    input: [
      {
        role: "system",
        content:
          "You are an exacting but practical article editor. Turn article ideas into usable first drafts. Preserve the writer's intent, keep unsupported factual claims cautious, and mark external facts that need checking with [check].",
      },
      {
        role: "user",
        content: `Create a first draft from this idea. Return only JSON that matches the schema.\n\n${ideaContext(idea)}`,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "article_draft",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            sections: {
              type: "array",
              minItems: 3,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  heading: { type: "string" },
                  paragraphs: {
                    type: "array",
                    minItems: 1,
                    items: { type: "string" },
                  },
                },
                required: ["heading", "paragraphs"],
              },
            },
          },
          required: ["title", "summary", "sections"],
        },
      },
    },
  });

  return JSON.parse(text) as DraftResponse;
}

async function debateIdea(apiKey: string, idea: Idea, message: string): Promise<string> {
  const text = await callResponsesApi(apiKey, {
    input: [
      {
        role: "system",
        content:
          "You are a constructive sparring partner for article ideas. Challenge assumptions, identify the strongest angle, ask useful questions, and be concise. Do not pretend to have researched facts you were not given.",
      },
      {
        role: "user",
        content: `${ideaContext(idea)}\n\nThe writer wants to debate this idea. Their prompt is:\n${message.trim() || "Pressure-test the idea and suggest the strongest way to frame it."}`,
      },
    ],
  });

  return text.trim();
}

async function callResponsesApi(
  apiKey: string,
  payload: Record<string, unknown>,
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      ...payload,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    const message = getErrorMessage(data) || `OpenAI request failed with ${res.status}.`;
    throw new Error(message);
  }

  const text = extractOutputText(data);
  if (!text) throw new Error("OpenAI returned an empty response.");
  return text;
}

function extractOutputText(data: unknown): string {
  if (!isObject(data)) return "";
  const response = data as OpenAIResponse;
  if (typeof response.output_text === "string") return response.output_text;

  return (response.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((content) => (content.type === "output_text" && typeof content.text === "string" ? content.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();
}

function getErrorMessage(data: unknown): string | null {
  if (!isObject(data)) return null;
  const error = data.error;
  if (!isObject(error)) return null;
  return typeof error.message === "string" ? error.message : null;
}

function ideaContext(idea: Idea): string {
  const links = idea.links
    .filter((link) => link.url || link.title)
    .map((link) => `- ${link.title || "Reference"}: ${link.url}`)
    .join("\n");

  return [
    `Title: ${idea.title || "Untitled"}`,
    idea.tags.length ? `Tags: ${idea.tags.join(", ")}` : "Tags: none",
    `Notes:\n${truncate(idea.notes || "No notes yet.", 12000)}`,
    links ? `Reference links:\n${links}` : "Reference links: none",
  ].join("\n\n");
}

function draftToHtml(draft: DraftResponse): string {
  const summary = draft.summary.trim()
    ? `<p><strong>Summary:</strong> ${escapeHtml(draft.summary.trim())}</p>`
    : "";

  const sections = draft.sections
    .map((section) => {
      const heading = section.heading.trim() ? `<h2>${escapeHtml(section.heading.trim())}</h2>` : "";
      const paragraphs = section.paragraphs
        .filter((paragraph) => paragraph.trim())
        .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
        .join("\n");
      return `${heading}\n${paragraphs}`.trim();
    })
    .filter(Boolean)
    .join("\n");

  return [summary, sections].filter(Boolean).join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}\n\n[truncated]` : value;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
