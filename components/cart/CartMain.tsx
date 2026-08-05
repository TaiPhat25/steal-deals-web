"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { surpriseBags, type ListingBag } from "@/components/products/product-listing-data";

type CartLine = {
  bag: ListingBag;
  quantity: number;
};

type StoreGroup = {
  storeName: string;
  storeSlug?: string;
  lines: CartLine[];
};

const defaultCartSlugs = [
  "bakery-breakfast-box",
  "bakery-mix-bag",
  "fresh-produce-box",
];

function formatPrice(value: number) {
  return `${value.toLocaleString("en-US")} VND`;
}

function createInitialCart(initialBagSlug?: string, initialQuantity?: number) {
  const slugs = initialBagSlug ? [initialBagSlug] : defaultCartSlugs;

  return slugs.reduce<CartLine[]>((lines, slug) => {
    const bag = surpriseBags.find((item) => item.slug === slug);
    if (!bag || lines.some((line) => line.bag.slug === bag.slug)) return lines;

    const quantity = initialBagSlug === slug && Number.isFinite(initialQuantity)
      ? Math.min(bag.remainingQuantity, Math.max(1, Math.floor(initialQuantity as number)))
      : 1;

    lines.push({ bag, quantity });
    return lines;
  }, []);
}

export default function CartMain({
  initialBagSlug,
  initialQuantity,
}: {
  initialBagSlug?: string;
  initialQuantity?: number;
}) {
  const [lines, setLines] = useState(() => createInitialCart(initialBagSlug, initialQuantity));

  const groups = useMemo(() => {
    const grouped = new Map<string, StoreGroup>();

    lines.forEach((line) => {
      const key = line.bag.storeSlug ?? line.bag.storeName;
      const current = grouped.get(key) ?? {
        storeName: line.bag.storeName,
        storeSlug: line.bag.storeSlug,
        lines: [],
      };

      current.lines.push(line);
      grouped.set(key, current);
    });

    return [...grouped.values()];
  }, [lines]);

  const subtotal = lines.reduce((total, line) => total + line.bag.salePrice * line.quantity, 0);
  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);

  function updateQuantity(slug: string, nextQuantity: number) {
    setLines((current) =>
      current.map((line) => {
        if (line.bag.slug !== slug) return line;

        const safeQuantity = Number.isFinite(nextQuantity)
          ? Math.min(line.bag.remainingQuantity, Math.max(1, Math.floor(nextQuantity)))
          : 1;

        return { ...line, quantity: safeQuantity };
      }),
    );
  }

  function removeItem(slug: string) {
    setLines((current) => current.filter((line) => line.bag.slug !== slug));
  }

  return (
    <main className="main cart-page">
      <nav aria-label="Breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/products">Surprise Bags</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Cart
            </li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <div className="cart-page-heading">
            <div>
              <p>Review your rescued food</p>
              <h1>Your cart</h1>
            </div>
            <span>{itemCount} {itemCount === 1 ? "bag" : "bags"}</span>
          </div>

          {groups.length === 0 ? (
            <section className="cart-empty-state" aria-labelledby="cart-empty-title">
              <i className="icon-shopping-cart" aria-hidden="true"></i>
              <h2 id="cart-empty-title">Your cart is empty</h2>
              <p>Browse local surprise bags and add one when you are ready to rescue a meal.</p>
              <Link href="/products" className="btn btn-primary">
                Browse surprise bags
              </Link>
            </section>
          ) : (
            <div className="cart-layout">
              <div className="cart-store-groups">
                {groups.map((group) => (
                  <section className="cart-store-group" key={group.storeSlug ?? group.storeName}>
                    <header className="cart-store-group__header">
                      <div>
                        <p>Pickup from</p>
                        {group.storeSlug ? (
                          <h2>
                            <Link href={`/stores/${encodeURIComponent(group.storeSlug)}`}>
                              {group.storeName}
                            </Link>
                          </h2>
                        ) : (
                          <h2>{group.storeName}</h2>
                        )}
                      </div>
                      {group.storeSlug ? (
                        <Link href={`/stores/${encodeURIComponent(group.storeSlug)}`}>
                          View store bags
                        </Link>
                      ) : null}
                    </header>

                    <div className="cart-store-table" role="table" aria-label={`${group.storeName} cart items`}>
                      <div className="cart-store-table__header" role="row">
                        <span role="columnheader">Surprise bag</span>
                        <span role="columnheader">Price</span>
                        <span role="columnheader">Quantity</span>
                        <span role="columnheader">Total</span>
                        <span aria-hidden="true"></span>
                      </div>

                      {group.lines.map((line) => (
                        <div className="cart-line" role="row" key={line.bag.slug}>
                          <div className="cart-line__product" role="cell">
                            <Link href={`/product?bag=${encodeURIComponent(line.bag.slug)}`}>
                              <Image
                                src={line.bag.imageSrc}
                                width={112}
                                height={84}
                                sizes="112px"
                                alt={line.bag.imageAlt}
                              />
                            </Link>
                            <div>
                              <Link
                                href={`/products?category=${encodeURIComponent(line.bag.category)}`}
                                className="cart-line__category"
                              >
                                {line.bag.category}
                              </Link>
                              <h3>
                                <Link href={`/product?bag=${encodeURIComponent(line.bag.slug)}`}>
                                  {line.bag.name}
                                </Link>
                              </h3>
                              <p>{line.bag.pickupWindow} · {line.bag.distance}</p>
                            </div>
                          </div>
                          <span className="cart-line__price" role="cell">
                            {formatPrice(line.bag.salePrice)}
                          </span>
                          <div className="cart-line__quantity" role="cell">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${line.bag.name}`}
                              onClick={() => updateQuantity(line.bag.slug, line.quantity - 1)}
                              disabled={line.quantity <= 1}
                            >
                              -
                            </button>
                            <input
                              aria-label={`Quantity of ${line.bag.name}`}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={line.quantity}
                              onChange={(event) => {
                                const digits = event.target.value.replace(/\D/g, "");
                                updateQuantity(line.bag.slug, Number(digits || 1));
                              }}
                            />
                            <button
                              type="button"
                              aria-label={`Increase quantity of ${line.bag.name}`}
                              onClick={() => updateQuantity(line.bag.slug, line.quantity + 1)}
                              disabled={line.quantity >= line.bag.remainingQuantity}
                            >
                              +
                            </button>
                          </div>
                          <strong className="cart-line__total" role="cell">
                            {formatPrice(line.bag.salePrice * line.quantity)}
                          </strong>
                          <button
                            type="button"
                            className="cart-line__remove"
                            aria-label={`Remove ${line.bag.name}`}
                            onClick={() => removeItem(line.bag.slug)}
                          >
                            <i className="icon-close" aria-hidden="true"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <aside className="cart-summary" aria-labelledby="cart-summary-title">
                <p>Order summary</p>
                <h2 id="cart-summary-title">Pickup total</h2>
                <dl>
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatPrice(subtotal)}</dd>
                  </div>
                  <div>
                    <dt>Delivery</dt>
                    <dd>Pickup at store</dd>
                  </div>
                  <div className="cart-summary__total">
                    <dt>Total</dt>
                    <dd>{formatPrice(subtotal)}</dd>
                  </div>
                </dl>
                <Link href="/checkout" className="btn btn-primary btn-block">
                  Proceed to checkout
                </Link>
                <Link href="/products" className="cart-summary__continue">
                  Continue browsing
                </Link>
              </aside>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
