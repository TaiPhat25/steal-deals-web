"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { listBags } from "@/lib/api/store";
import {
  PRODUCT_LISTING_IMAGE,
  toListingBag,
  type ListingBag,
} from "@/components/products/product-listing-data";

const MAX_RESULTS = 5;

function formatPrice(value: number) {
  return `${value.toLocaleString("en-US")} VND`;
}

export default function HeaderSearch() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bags, setBags] = useState<ListingBag[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (!isOpen || loadState !== "loading") return;

    let active = true;

    void listBags()
      .then((response) => {
        if (!active) return;

        setBags(
          response
            .filter((bag) => bag.status.toLowerCase() === "active")
            .map(toListingBag),
        );
        setLoadState("ready");
      })
      .catch(() => {
        if (active) setLoadState("error");
      });

    return () => {
      active = false;
    };
  }, [isOpen, loadState]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      rootRef.current?.querySelector<HTMLButtonElement>(".search-toggle")?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];

    return bags
      .filter((bag) =>
        `${bag.name} ${bag.storeName} ${bag.category}`.toLowerCase().includes(keyword),
      )
      .slice(0, MAX_RESULTS);
  }, [bags, query]);

  const openSearch = () => {
    setIsOpen(true);
    if (loadState === "idle") setLoadState("loading");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const trimmedQuery = query.trim();
  const resultsId = "header-search-results";

  return (
    <div ref={rootRef} className="header-search">
      <button
        type="button"
        className={`search-toggle${isOpen ? " active" : ""}`}
        aria-label="Search surprise bags"
        aria-expanded={isOpen}
        aria-controls={resultsId}
        title="Search surprise bags"
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            openSearch();
          }
        }}
      >
        <i className="icon-search" aria-hidden="true"></i>
      </button>

      <form
        action="/products"
        method="get"
        role="search"
        onSubmit={(event) => {
          if (!trimmedQuery) event.preventDefault();
        }}
      >
        <div className={`header-search-wrapper${isOpen ? " show" : ""}`}>
          <label htmlFor="header-search-input" className="sr-only">
            Search surprise bags
          </label>
          <input
            ref={inputRef}
            type="search"
            className="form-control"
            name="q"
            id="header-search-input"
            value={query}
            placeholder="Search surprise bags..."
            autoComplete="off"
            aria-controls={resultsId}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => {
              setIsOpen(true);
              if (loadState === "idle") setLoadState("loading");
            }}
          />

          {trimmedQuery ? (
            <div id={resultsId} className="header-search-results" aria-live="polite">
              {loadState === "loading" ? (
                <p className="header-search-results__message">Searching products...</p>
              ) : loadState === "error" ? (
                <div className="header-search-results__message">
                  <span>Unable to load products.</span>
                  <button type="button" onClick={() => setLoadState("loading")}>Try again</button>
                </div>
              ) : results.length > 0 ? (
                <>
                  <ul className="header-search-results__list">
                    {results.map((bag) => (
                      <li key={bag.backendId ?? bag.slug}>
                        <Link
                          href={`/product?bag=${encodeURIComponent(bag.backendId ?? bag.slug)}`}
                          className="header-search-result"
                          onClick={() => setIsOpen(false)}
                        >
                          <Image
                            src={bag.imageSrc || PRODUCT_LISTING_IMAGE}
                            width={56}
                            height={56}
                            alt=""
                          />
                          <span className="header-search-result__content">
                            <strong>{bag.name}</strong>
                            <span>{bag.storeName}</span>
                            <b>{formatPrice(bag.salePrice)}</b>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/products?q=${encodeURIComponent(trimmedQuery)}`}
                    className="header-search-results__all"
                    onClick={() => setIsOpen(false)}
                  >
                    View all results
                  </Link>
                </>
              ) : loadState === "ready" ? (
                <p className="header-search-results__message">No matching surprise bags found.</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
