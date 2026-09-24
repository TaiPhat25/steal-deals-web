"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CATEGORY_FALLBACK_IMAGE,
  shouldUseUnoptimizedImage,
} from "@/lib/image-assets";
import HomeCollectionState from "./HomeCollectionState";
import { useHomeData } from "./HomeDataProvider";

type CategoryItem = {
  name: string;
  count: string;
  image: string;
};

export default function FoodCategorySection() {
  const { bags, categories, retry } = useHomeData();
  const activeBags = bags.data.filter(
    (bag) => (bag.status || "").toLowerCase() === "active",
  );
  const categoryItems: CategoryItem[] = categories.data
    .filter((category) => category.isActive)
    .map((category) => {
      const bagCount = activeBags.filter((bag) =>
        bag.categories?.some(
          (bagCategory) =>
            bagCategory.id === category.id ||
            bagCategory.name.toLowerCase() === category.name.toLowerCase(),
        ),
      ).length;

      return {
        name: category.name,
        count: `${bagCount} ${bagCount === 1 ? "bag" : "bags"}`,
        image: category.iconUrl || CATEGORY_FALLBACK_IMAGE,
      };
    });
  const isLoading =
    bags.status === "loading" || categories.status === "loading";
  const error = categories.error || bags.error;

  return (
    <section className="home-category-section container" aria-labelledby="category-title">
      <hr className="m-0" />
      <div className="home-category-heading">
        <div>
          <p className="home-category-heading__eyebrow">Find your next rescue meal</p>
          <h2 id="category-title" className="title mb-1">Browse by Category</h2>
          <p className="home-category-heading__description mb-0">
            Explore surprise bags from the food categories you enjoy most.
          </p>
        </div>
        <Link href="/products" className="home-category-heading__link">
          Explore all bags
          <i className="icon-angle-right" aria-hidden="true"></i>
        </Link>
      </div>
      {isLoading ? (
        <HomeCollectionState
          state="loading"
          message="Loading food categories"
        />
      ) : error ? (
        <HomeCollectionState
          state="error"
          title="Categories are temporarily unavailable"
          message={error}
          onRetry={retry}
        />
      ) : categoryItems.length === 0 ? (
        <HomeCollectionState
          state="empty"
          title="No categories available"
          message="Food categories will appear here when they are available."
        />
      ) : (
        <div className="cat-section mt-4 mb-3">
          <div className="row">
            {categoryItems.map((category) => {
              const categoryHref = `/products?category=${encodeURIComponent(category.name)}`;

              return (
                <div
                  key={category.name}
                  className="col-6 col-sm-4 col-md-3 col-xl-8col"
                >
                  <div className="cat bg-white pt-1 mb-2">
                    <div className="cat-image d-flex justify-content-center align-items-center">
                      <Link href={categoryHref}>
                        <Image
                          src={category.image}
                          width={137}
                          height={137}
                          sizes="137px"
                          alt={`${category.name} surprise bags`}
                          unoptimized={shouldUseUnoptimizedImage(category.image)}
                        />
                      </Link>
                    </div>
                    <div className="cat-content text-center">
                      <Link href={categoryHref} className="cat-title">
                        {category.name}
                      </Link>
                      <h4 className="cat-count letter-spacing-normal d-block font-weight-light">
                        {category.count}
                      </h4>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
