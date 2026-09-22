"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { listBags, listCategories, listStores } from "@/lib/api/store";
import type {
  CategoryResponse,
  StoreProfileResponse,
  SurpriseBagResponse,
} from "@/lib/api/dashboard-types";

type HomeData = {
  bags: SurpriseBagResponse[] | null;
  categories: CategoryResponse[] | null;
  stores: StoreProfileResponse[] | null;
};

const INITIAL_HOME_DATA: HomeData = {
  bags: null,
  categories: null,
  stores: null,
};

const HomeDataContext = createContext<HomeData | undefined>(undefined);

export default function HomeDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HomeData>(INITIAL_HOME_DATA);

  useEffect(() => {
    let active = true;

    Promise.allSettled([listBags(), listCategories(), listStores()]).then(
      ([bagsResult, categoriesResult, storesResult]) => {
        if (!active) return;

        setData({
          bags: bagsResult.status === "fulfilled" ? bagsResult.value : null,
          categories:
            categoriesResult.status === "fulfilled"
              ? categoriesResult.value
              : null,
          stores: storesResult.status === "fulfilled" ? storesResult.value : null,
        });
      },
    );

    return () => {
      active = false;
    };
  }, []);

  return (
    <HomeDataContext.Provider value={data}>{children}</HomeDataContext.Provider>
  );
}

export function useHomeData() {
  const context = useContext(HomeDataContext);

  if (!context) {
    throw new Error("useHomeData must be used inside HomeDataProvider.");
  }

  return context;
}
