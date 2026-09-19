export const BRAND_NAME = "StealDeals";
export const BRAND_DESCRIPTOR = "Rescue Food Marketplace";
export const BRAND_TITLE = `${BRAND_NAME} | ${BRAND_DESCRIPTOR}`;

export function withBrandTitle(title: string) {
  return `${title} | ${BRAND_NAME}`;
}
