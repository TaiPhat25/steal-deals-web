export type StoreFilter = "all" | "established" | "new";
export type StoreSort = "rating" | "bags" | "name";

export interface StoreListingUrlState {
  query: string;
  filter: StoreFilter;
  sort: StoreSort;
  page: number;
}

export const DEFAULT_STORE_LISTING_STATE: StoreListingUrlState = {
  query: "",
  filter: "all",
  sort: "rating",
  page: 1,
};

const STORE_FILTERS = new Set<StoreFilter>(["all", "established", "new"]);
const STORE_SORTS = new Set<StoreSort>(["rating", "bags", "name"]);

export function parseStoreListingSearchParams(
  searchParams: URLSearchParams,
): StoreListingUrlState {
  const filter = searchParams.get("age") as StoreFilter | null;
  const sort = searchParams.get("sort") as StoreSort | null;
  const parsedPage = Number.parseInt(searchParams.get("page") ?? "", 10);

  return {
    query: searchParams.get("q") ?? DEFAULT_STORE_LISTING_STATE.query,
    filter:
      filter && STORE_FILTERS.has(filter)
        ? filter
        : DEFAULT_STORE_LISTING_STATE.filter,
    sort:
      sort && STORE_SORTS.has(sort) ? sort : DEFAULT_STORE_LISTING_STATE.sort,
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
}

export function buildStoreListingSearchParams(
  currentSearchParams: URLSearchParams,
  state: StoreListingUrlState,
) {
  const searchParams = new URLSearchParams(currentSearchParams);
  const query = state.query.trim();

  setOrDelete(searchParams, "q", query, "");
  setOrDelete(searchParams, "age", state.filter, "all");
  setOrDelete(searchParams, "sort", state.sort, "rating");
  setOrDelete(searchParams, "page", String(state.page), "1");

  return searchParams;
}

function setOrDelete(
  searchParams: URLSearchParams,
  key: string,
  value: string,
  defaultValue: string,
) {
  if (value === defaultValue) {
    searchParams.delete(key);
    return;
  }

  searchParams.set(key, value);
}
