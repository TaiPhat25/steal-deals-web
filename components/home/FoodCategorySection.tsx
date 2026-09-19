"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listCategories, listBags } from "@/lib/api/store";
import { CATEGORY_FALLBACK_IMAGE } from "@/lib/image-assets";

type CategoryItem = {
  name: string;
  count: string;
  image: string;
};

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { name: "Bakery", count: "12 bags", image: CATEGORY_FALLBACK_IMAGE },
  { name: "Fruits", count: "9 bags", image: CATEGORY_FALLBACK_IMAGE },
  { name: "Vegetables", count: "14 bags", image: CATEGORY_FALLBACK_IMAGE },
  { name: "Prepared Meals", count: "8 bags", image: CATEGORY_FALLBACK_IMAGE },
  { name: "Seafood", count: "6 bags", image: CATEGORY_FALLBACK_IMAGE },
  { name: "Drinks", count: "7 bags", image: CATEGORY_FALLBACK_IMAGE },
  { name: "Dairy & Cheese", count: "5 bags", image: CATEGORY_FALLBACK_IMAGE },
  { name: "Grocery", count: "10 bags", image: CATEGORY_FALLBACK_IMAGE },
];

export default function FoodCategorySection() {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    let active = true;

    Promise.all([listCategories(), listBags()])
      .then(([categoriesRes, bagsRes]) => {
        if (!active) return;

        const activeBags = bagsRes.filter(
          (bag) => (bag.status || "").toLowerCase() === "active"
        );

        const activeCategories = categoriesRes.filter((cat) => cat.isActive);

        if (activeCategories.length > 0) {
          const mapped: CategoryItem[] = activeCategories.map((cat) => {
            const bagCount = activeBags.filter((bag) =>
              bag.categories?.some((c) => c.id === cat.id || c.name.toLowerCase() === cat.name.toLowerCase())
            ).length;

            return {
              name: cat.name,
              count: `${bagCount} ${bagCount === 1 ? "bag" : "bags"}`,
              image: cat.iconUrl || CATEGORY_FALLBACK_IMAGE,
            };
          });

          setCategories(mapped);
        }
      })
      .catch(() => {
        // keep DEFAULT_CATEGORIES on API fallback
      });

    return () => {
      active = false;
    };
  }, []);

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
      <div className="cat-section mt-4 mb-3">
        <div className="row">
          {categories.map((category) => {
            const categoryHref = `/products?category=${encodeURIComponent(category.name)}`;

            return (
              <div key={category.name} className="col-6 col-sm-4 col-md-3 col-xl-8col">
                <div className="cat bg-white pt-1 mb-2">
                  <div className="cat-image d-flex justify-content-center align-items-center">
                    <Link href={categoryHref}>
                      <img
                        src={category.image}
                        width="137"
                        height="137"
                        alt={`${category.name} surprise bags`}
                      />
                    </Link>
                  </div>
                  <div className="cat-content text-center">
                    <Link href={categoryHref} className="cat-title">{category.name}</Link>
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
    </section>
  );
}
