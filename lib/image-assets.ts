export const BAG_FALLBACK_IMAGE = "/assets/images/brand/surprise-bag-placeholder.webp";
export const CATEGORY_FALLBACK_IMAGE = "/assets/images/brand/category-placeholder.webp";
export const STORE_FALLBACK_IMAGE = "/assets/images/home/store-fallback.webp";

const OPTIMIZED_REMOTE_IMAGE_PATTERNS = [
  {
    hostname: "stealdeals-public-assets.s3.ap-southeast-1.amazonaws.com",
    pathnamePrefix: "/surprise-bags/",
  },
] as const;

export function shouldUseUnoptimizedImage(src: string) {
  if (src.startsWith("/")) return false;

  try {
    const url = new URL(src);

    return !OPTIMIZED_REMOTE_IMAGE_PATTERNS.some(
      (pattern) =>
        url.protocol === "https:" &&
        url.hostname === pattern.hostname &&
        url.pathname.startsWith(pattern.pathnamePrefix),
    );
  } catch {
    return true;
  }
}
