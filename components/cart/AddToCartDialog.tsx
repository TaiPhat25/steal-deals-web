"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useDialogFocusTrap } from "@/components/login/use-dialog-focus-trap";
import type { SurpriseBag } from "@/components/home/SurpriseBagCard";

const priceFormatter = new Intl.NumberFormat("en-US");

function formatPrice(value: number) {
  return `${priceFormatter.format(value)} VND`;
}

export default function AddToCartDialog({
  bag,
  quantity,
  onClose,
}: {
  bag: SurpriseBag;
  quantity: number;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { itemCount, subtotal } = useCart();

  function closeDialog() {
    onClose();
    requestAnimationFrame(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  }

  useDialogFocusTrap({
    dialogRef,
    initialFocusSelector: ".add-to-cart-dialog__close",
    onEscape: closeDialog,
  });

  return (
    <>
      <div className="modal-backdrop fade show" aria-hidden="true" />
      <div
        ref={dialogRef}
        className="modal fade show add-to-cart-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-cart-title"
        tabIndex={-1}
        style={{ display: "block" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content add-to-cart-dialog">
            <button
              type="button"
              className="add-to-cart-dialog__close"
              onClick={closeDialog}
              aria-label="Close added to cart dialog"
            >
              <span aria-hidden="true">&times;</span>
            </button>

            <section className="add-to-cart-dialog__item">
              <h2 id="add-to-cart-title">
                Added to cart
              </h2>
              <div className="add-to-cart-dialog__item-details">
                <div className="add-to-cart-dialog__image">
                  <Image
                    src={bag.imageSrc}
                    alt={bag.imageAlt}
                    width={260}
                    height={195}
                    sizes="(max-width: 767px) 42vw, 260px"
                  />
                </div>
                <div>
                  <h3>{bag.name}</h3>
                  <p>{formatPrice(bag.salePrice)}</p>
                  <p>Quantity: {quantity}</p>
                </div>
              </div>
            </section>

            <section className="add-to-cart-dialog__summary" aria-label="Cart summary">
              <h2>
                Your cart has {itemCount} {itemCount === 1 ? "item" : "items"}
              </h2>
              <p>
                Cart subtotal: <strong>{formatPrice(subtotal)}</strong>
              </p>
              <div className="add-to-cart-dialog__actions">
                <button type="button" className="btn btn-outline-primary-2" onClick={closeDialog}>
                  Continue shopping
                </button>
                <Link href="/newcart" className="btn btn-primary">
                  View cart
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
