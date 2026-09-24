"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { listBags, listCategories, listStores } from "@/lib/api/store";
import type {
  CategoryResponse,
  StoreProfileResponse,
  SurpriseBagResponse,
} from "@/lib/api/dashboard-types";

export type HomeResourceStatus = "loading" | "success" | "error";

export type HomeResource<T> = {
  data: T[];
  error: string | null;
  status: HomeResourceStatus;
};

type HomeResources = {
  bags: HomeResource<SurpriseBagResponse>;
  categories: HomeResource<CategoryResponse>;
  stores: HomeResource<StoreProfileResponse>;
};

type HomeData = HomeResources & {
  retry: () => void;
};

const INITIAL_HOME_DATA: HomeResources = {
  bags: { data: [], error: null, status: "loading" },
  categories: { data: [], error: null, status: "loading" },
  stores: { data: [], error: null, status: "loading" },
};

const RESOURCE_ERROR_MESSAGES = {
  bags: "We couldn't load surprise bags right now.",
  categories: "We couldn't load food categories right now.",
  stores: "We couldn't load stores right now.",
} as const;

function resolveResource<T>(
  result: PromiseSettledResult<T[]>,
  error: string,
): HomeResource<T> {
  return result.status === "fulfilled"
    ? { data: result.value, error: null, status: "success" }
    : { data: [], error, status: "error" };
}

const HomeDataContext = createContext<HomeData | undefined>(undefined);

export default function HomeDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HomeResources>(INITIAL_HOME_DATA);
  const [requestVersion, setRequestVersion] = useState(0);

  const retry = useCallback(() => {
    setData({
      bags: { data: [], error: null, status: "loading" },
      categories: { data: [], error: null, status: "loading" },
      stores: { data: [], error: null, status: "loading" },
    });
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    let active = true;

    Promise.allSettled([listBags(), listCategories(), listStores()]).then(
      ([bagsResult, categoriesResult, storesResult]) => {
        if (!active) return;

        setData({
          bags: resolveResource(bagsResult, RESOURCE_ERROR_MESSAGES.bags),
          categories: resolveResource(
            categoriesResult,
            RESOURCE_ERROR_MESSAGES.categories,
          ),
          stores: resolveResource(storesResult, RESOURCE_ERROR_MESSAGES.stores),
        });
      },
    );

    return () => {
      active = false;
    };
  }, [requestVersion]);

  const contextValue = useMemo(() => ({ ...data, retry }), [data, retry]);

  return (
    <HomeDataContext.Provider value={contextValue}>
      {children}
    </HomeDataContext.Provider>
  );
}

export function useHomeData() {
  const context = useContext(HomeDataContext);

  if (!context) {
    throw new Error("useHomeData must be used inside HomeDataProvider.");
  }

  return context;
}
