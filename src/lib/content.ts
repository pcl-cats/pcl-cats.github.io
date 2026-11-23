import { getCollection, type CollectionEntry } from 'astro:content';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { site } from '../config';

export type Cat = CollectionEntry<'cats'>;
export type Diary = CollectionEntry<'diary'>;
export type Comic = CollectionEntry<'comics'>;
export type CatStatus = Cat['data']['status'];

/* ---------- 链接 ---------- */

export const catUrl = (id: string) => `/cats/${id}/`;
export const diaryUrl = (date: string) => `/diary/${date}/`;
export const comicSlug = (issue: number) => String(issue).padStart(2, '0');
export const comicUrl = (issue: number) => `/comics/${comicSlug(issue)}/`;

/* ---------- 日期 ---------- */

const WEEKDAYS = '日一二三四五六';
const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

const parts = (date: string) => date.split('-').map(Number) as [number, number, number];

export const formatDate = (date: string) => {
  const [y, m, d] = parts(date);
  return `${y} 年 ${m} 月 ${d} 日`;
};
export const shortDate = (date: string) => {
  const [, m, d] = parts(date);
  return `${m} 月 ${d} 日`;
};
export const dayOfMonth = (date: string) => parts(date)[2];
export const weekday = (date: string) => {
  const [y, m, d] = parts(date);
  return `周${WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}`;
};
export const formatMonth = (yearMonth: string) => {
  const [y, m] = yearMonth.split('-').map(Number);
  return `${y} 年 ${m} 月`;
};
export const monthName = (month: number) => MONTHS[month - 1];

/** 当前月份（1–12），按站点时区计算。 */
export const currentMonth = () =>
  Number(new Intl.DateTimeFormat('en-US', { timeZone: site.timeZone, month: 'numeric' }).format(new Date()));

/* ---------- 文本 ---------- */

export const excerpt = (body = '', length = 60) => {
  const text = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > length ? `${text.slice(0, length)}…` : text;
};

/* ---------- 猫猫 ---------- */

export const statusLabel: Record<CatStatus, string> = {
  园区活动: '在园区',
  已领养: '已领养',
  失踪: '失踪',
};
export const statusTone: Record<CatStatus, 'sage' | 'peach' | 'mute'> = {
  园区活动: 'sage',
  已领养: 'peach',
  失踪: 'mute',
};
const statusRank: Record<CatStatus, number> = { 园区活动: 0, 已领养: 1, 失踪: 2 };

export const catFacts = (cat: Cat) => {
  const { appearance, sex, birthMonth, sterilized } = cat.data;
  const facts: string[] = [];
  if (appearance) facts.push(appearance);
  if (sex) facts.push(sex);
  if (birthMonth) {
    const [y, m] = birthMonth.split('-').map(Number);
    facts.push(m ? `${y} 年 ${m} 月生` : `${y} 年生`);
  }
  if (sterilized !== undefined) facts.push(sterilized ? '已绝育' : '还没绝育');
  return facts;
};

/**
 * 漫画形象：把 public/art/cats/<id>-1.webp … <id>-6.webp 放进去就会自动用上。
 */
export const catArt = (id: string) => {
  const poses: string[] = [];
  for (let n = 1; n <= 6; n++) {
    if (existsSync(join(process.cwd(), 'public/art/cats', `${id}-${n}.webp`))) poses.push(`/art/cats/${id}-${n}.webp`);
  }
  return poses;
};

/* ---------- 集合 ---------- */

/** 日记，最新的在前。 */
export async function getDiary() {
  return (await getCollection('diary')).sort((a, b) => b.data.date.localeCompare(a.data.date));
}

/**
 * 猫猫排序：在园区的在前，其次已领养、失踪；
 * 同一组里最近在日记中出现的在前，没出现过的按名字排。
 */
export async function getCats() {
  const [cats, diary] = await Promise.all([getCollection('cats'), getDiary()]);
  const lastSeen = new Map<string, string>();
  for (const entry of diary) {
    for (const id of entry.data.cats ?? []) if (!lastSeen.has(id)) lastSeen.set(id, entry.data.date);
  }
  return cats.sort(
    (a, b) =>
      statusRank[a.data.status] - statusRank[b.data.status] ||
      (lastSeen.get(b.id) ?? '').localeCompare(lastSeen.get(a.id) ?? '') ||
      a.data.name.localeCompare(b.data.name, 'zh-CN'),
  );
}

export async function getComics() {
  return (await getCollection('comics')).sort((a, b) => a.data.issue - b.data.issue);
}

/** 网站内容的最近更新日期：取最新一篇日记。 */
export async function lastUpdated() {
  return (await getDiary())[0]?.data.date;
}
