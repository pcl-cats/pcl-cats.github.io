// 照片的缩略图和占位底色。数据由 integrations/site-assets.mjs 在构建前生成。
import { images } from 'virtual:site-assets';

const thumbPath = (src: string, width: number) => `/thumbs/${width}${src.replace(/\.\w+$/, '.webp')}`;

/** 不小于 width 的最小缩略图；没有合适的就用原图。 */
export function thumb(src: string, width: number) {
  const info = images[src];
  const best = info?.thumbs.find((w) => w >= width);
  return best ? thumbPath(src, best) : src;
}

/** 缩略图的 srcset，最大到 maxWidth。 */
export function srcset(src: string, maxWidth = 960) {
  const info = images[src];
  if (!info?.thumbs.length) return undefined;
  return info.thumbs
    .filter((w) => w <= maxWidth)
    .map((w) => `${thumbPath(src, w)} ${Math.min(w, info.width)}w`)
    .join(', ');
}

/** 照片加载出来之前显示的底色。 */
export const placeholder = (src: string) => images[src]?.color ?? 'var(--paper-deep)';
