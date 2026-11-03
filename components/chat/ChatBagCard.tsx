"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { toListingBag } from "@/components/products/product-listing-data";
import type { SurpriseBagResponse } from "@/lib/api/dashboard-types";
import {
  BAG_FALLBACK_IMAGE,
  shouldUseUnoptimizedImage,
} from "@/lib/image-assets";

const priceFormatter = new Intl.NumberFormat("en-US");
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Ho_Chi_Minh",
});

function formatPrice(value: number): string {
  return `${priceFormatter.format(value)} VND`;
}

function formatTimeWindow(startIso: string, endIso: string): string {
  try {
    const start = new Date(startIso);
    const end = new Date(endIso);
    return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
  } catch {
    return "";
  }
}

export default function ChatBagCard({ bag }: { bag: SurpriseBagResponse }) {
  const router = useRouter();
  const { addItem } = useCart();

  const imageSrc = bag.imageUrl || BAG_FALLBACK_IMAGE;
  const productHref = `/product?bag=${encodeURIComponent(bag.id)}`;
  const storeHref = `/stores/${encodeURIComponent(bag.storeId)}`;
  const discountPercent =
    bag.originalPrice > 0
      ? Math.round((1 - bag.salePrice / bag.originalPrice) * 100)
      : 0;
  const pickupTime = formatTimeWindow(bag.pickupStartTime, bag.pickupEndTime);

  const handleAddToCart = () => {
    const listingBag = toListingBag(bag);
    addItem(listingBag, 1);
    router.push("/newcart");
  };

  return (
    <article className="chat-card chat-card--bag">
      <div className="chat-card__media">
        <Link href={productHref} aria-label={`View ${bag.name}`}>
          <Image
            src={imageSrc}
            alt={bag.name}
            width={240}
            height={150}
            className="chat-card__image"
            unoptimized={shouldUseUnoptimizedImage(imageSrc)}
          />
        </Link>
        {discountPercent > 0 && (
          <span className="chat-card__badge">Save {discountPercent}%</span>
        )}
        {bag.distanceKm != null && Number.isFinite(bag.distanceKm) && (
          <span className="chat-card__distance">
            <i className="icon-map-marker" aria-hidden="true"></i>{" "}
            {bag.distanceKm.toFixed(1)} km
          </span>
        )}
      </div>

      <div className="chat-card__body">
        <Link href={storeHref} className="chat-card__subtitle">
          {bag.storeName}
        </Link>
        <h4 className="chat-card__title">
          <Link href={productHref}>{bag.name}</Link>
        </h4>

        <div className="chat-card__pricing">
          <span className="chat-card__price-sale">{formatPrice(bag.salePrice)}</span>
          {bag.originalPrice > bag.salePrice && (
            <del className="chat-card__price-orig">{formatPrice(bag.originalPrice)}</del>
          )}
        </div>

        {pickupTime && (
          <div className="chat-card__meta">
            <i className="la la-clock-o" aria-hidden="true"></i> {pickupTime}
          </div>
        )}

        {/* Stacked vertically: View Details on top, Add to Cart directly below */}
        <div className="chat-card__actions">
          <Link href={productHref} className="btn btn-outline-primary-2 btn-sm w-100 text-center">
            View Details
          </Link>
          <button
            type="button"
            onClick={handleAddToCart}
            className="btn btn-primary btn-sm w-100 text-center"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
