declare module 'virtual:site-assets' {
  export interface ImageInfo {
    width: number;
    height: number;
    /** 照片的平均色，加载前当底色 */
    color: string;
    /** 已生成的缩略图宽度 */
    thumbs: number[];
  }
  export const fontUrl: string;
  export const images: Record<string, ImageInfo>;
}
