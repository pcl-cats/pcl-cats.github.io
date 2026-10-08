import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cats = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/cats' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    photo: z.string(),
    birthMonth: z.string().optional(),
    appearance: z.string().optional(),
    status: z.enum(['园区活动', '已领养', '失踪']),
    sterilized: z.boolean().optional(),
    sex: z.string().optional(),
    relations: z.array(z.object({ cat: z.string(), label: z.string() })).optional(),
  }),
});

const diary = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/diary' }),
  schema: z.object({
    date: z.string(),
    title: z.string(),
    cats: z.array(z.string()).optional(),
    milestone: z.boolean().optional(),
    cover: z.string().optional(),
  }),
});

const comics = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/comics' }),
  schema: z.object({
    issue: z.number(),
    title: z.string(),
    cast: z.string(),
    images: z.array(z.string()),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '{about,guide}.md', base: './content' }),
  schema: z.object({ title: z.string(), updated: z.string() }),
});

export const collections = { cats, diary, comics, pages };
