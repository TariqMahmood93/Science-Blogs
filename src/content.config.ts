import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const categories = defineCollection({
  loader: file('src/content/categories.yaml'),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    order: z.number().default(100),
    hidden: z.boolean().default(false),
  }),
});

const contentTypes = defineCollection({
  loader: file('src/content/content-types.yaml'),
  schema: z.object({
    name: z.string(),
    plural: z.string(),
    description: z.string(),
    position: z.number().min(0).max(1),
    tone: z.enum(['established', 'discovery', 'commentary', 'idea', 'future']),
  }),
});

const authors = defineCollection({
  loader: file('src/content/authors.yaml'),
  schema: z.object({
    name: z.string(),
    role: z.string().optional(),
    bio: z.string().optional(),
    url: z.url().optional(),
    organization: z.boolean().default(false),
    // Extended profile, shown on the About page for founders and editors.
    founder: z.boolean().default(false),
    title: z.string().optional(),
    affiliation: z.string().optional(),
    initials: z.string().max(3).optional(),
    interests: z.array(z.string()).default([]),
    highlights: z.array(z.object({ label: z.string(), text: z.string(), url: z.url().optional() })).default([]),
    links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
  }),
});

const referenceEntry = z.object({
  id: z.string(),
  // Full citation text, e.g. "Author, A. (2024). Title. Journal, 1(2), 3–4."
  text: z.string(),
  url: z.url().optional(),
  doi: z.string().optional(),
  // Set to true only after an editor has checked the source exists and says what we cite it for.
  verified: z.boolean().default(false),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        subtitle: z.string().optional(),
        dek: z.string().max(280),
        type: reference('contentTypes'),
        category: reference('categories'),
        tags: z.array(z.string()).default([]),
        authors: z.array(reference('authors')).min(1),
        publishDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        updateNote: z.string().optional(),
        corrections: z.array(z.object({ date: z.coerce.date(), note: z.string() })).default([]),
        heroImage: z
          .object({ src: image(), alt: z.string().min(1), credit: z.string().min(1) })
          .optional(),
        // Built-in animated illustration used when there is no heroImage.
        cover: z.enum(['brain', 'code-scan', 'data-gaps', 'agent-bounds', 'hypotheses', 'uncertainty']).optional(),
        featured: z.boolean().default(false),
        editorsPick: z.boolean().default(false),
        toc: z.boolean().default(true),
        researchQuestion: z.string().optional(),
        // One open question the article leaves the reader with; shown on the homepage.
        openQuestion: z.string().optional(),
        aiAssistance: z.string().optional(),
        sourceLink: z.object({ label: z.string(), url: z.url() }).optional(),
        references: z.array(referenceEntry).default([]),
        related: z.array(z.string()).default([]),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        sample: z.boolean().default(false),
        draft: z.boolean().default(false),
      })
      .superRefine((a, ctx) => {
        if (a.type.id === 'research-idea' && !a.researchQuestion) {
          ctx.addIssue({ code: 'custom', path: ['researchQuestion'], message: 'Research ideas must state a research question.' });
        }
        if (!a.sample && !a.draft) {
          a.references.forEach((r, i) => {
            if (!r.verified) {
              ctx.addIssue({
                code: 'custom',
                path: ['references', i],
                message: `Reference "${r.id}" is not verified. Verify it or keep the article as a draft.`,
              });
            }
          });
        }
      }),
});

const questions = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/questions' }),
  schema: z.object({
    question: z.string(),
    // One or two sentences shown on cards.
    summary: z.string().max(320),
    category: reference('categories'),
    // open: no agreed answer; debated: competing answers with evidence on each side;
    // progressing: partial answers exist but the core question remains.
    status: z.enum(['open', 'debated', 'progressing']),
    tags: z.array(z.string()).default([]),
    relatedArticles: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(100),
    // false until an editor has checked the explanation; shown on the page.
    reviewed: z.boolean().default(false),
    updatedDate: z.coerce.date(),
  }),
});

export const collections = { articles, categories, contentTypes, authors, questions };
