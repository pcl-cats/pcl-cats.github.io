import type { CollectionEntry } from 'astro:content';

export type Cat = CollectionEntry<'cats'>;
export type Diary = CollectionEntry<'diary'>;

export const catUrl = (id: string) => `/cats/${id}/`;
export const diaryUrl = (date: string) => `/diary/${date}/`;
export const formatDate = (date: string) => {
  const [year, month, day] = date.split('-');
  return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
};
export const shortDate = (date: string) => {
  const [, month, day] = date.split('-');
  return `${Number(month)}月${Number(day)}日`;
};
export const excerpt = (body: string, length = 84) => {
  const text = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]+\]\([^)]*\)/g, '')
    .replace(/[#>*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > length ? `${text.slice(0, length)}…` : text;
};
