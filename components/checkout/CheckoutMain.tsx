"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getProfile } from "@/lib/api/account";
import { surpriseBags, type ListingBag } from "@/components/products/product-listing-data";
import type { UserAddress } from "@/lib/api/store-types";

type DeliveryType = "Pickup" | "Delivery";

type CheckoutLine = {
  bag: ListingBag;
  quantity: number;
};

type CheckoutStoreGroup = {
  storeId: string;
  storeName: string;
  lines: CheckoutLine[];
};

const defaultCheckoutSlugs = [
  "bakery-breakfast-box",
  "bakery-mix-bag",
  "fresh-produce-box",
];

function formatPrice(value: number) {
  return `${value.toLocaleString("en-US")} VND`;
}

function formatAddress(address: UserAddress) {
  return [address.address, address.district, address.city].filter(Boolean).join(", ");
}

function createInitialLines() {
  return defaultCheckoutSlugs.reduce<CheckoutLine[]>((lines, slug) => {
    const bag = surpriseBags.find((item) => item.slug === slug);
    if (bag) lines.push({ bag, quantity: 1 });
    return lines;
  }, []);
}

export default function CheckoutMain() {
  const { accessToken, currentUser } = useAuth();
  const [lines, setLines] = useState(createInitialLines);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    phone: "",
  });
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("Pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("new");
  const [paymentMethod, setPaymentMethod] = useState("CashOnPickup");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    let active = true;

    void getProfile(accessToken)
      .then((profile) => {
        if (!active) return;

        setCustomerInfo((current) => ({
          ...current,
          fullName: profile.fullName ?? current.fullName,
          email: profile.email ?? current.email,
          phone: profile.phone ?? current.phone,
        }));

        setSavedAddresses(profile.userAddresses);
        const defaultAddress = profile.userAddresses.find((address) => address.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setDeliveryAddress(formatAddress(defaultAddress));
        }
      })
      .catch(() => {
        // The current-user response still provides the essential checkout fields.
      });

    return () => {
      active = false;
    };
  }, [accessToken]);

  const groups = useMemo<CheckoutStoreGroup[]>(() => {
    const grouped = new Map<string, CheckoutStoreGroup>();

    lines.forEach((line) => {
      const storeId = line.bag.storeSlug ?? line.bag.storeName;
      const group = grouped.get(storeId) ?? {
        storeId,
        storeName: line.bag.storeName,
        lines: [],
      };

      group.lines.push(line);
      grouped.set(storeId, group);
    });

    return [...grouped.values()];
  }, [lines]);

  const subtotal = lines.reduce((total, line) => total + line.bag.salePrice * line.quantity, 0);
  const deliveryFee = deliveryType === "Delivery" ? groups.length * 25000 : 0;
  const total = Math.max(0, subtotal + deliveryFee - voucherDiscount);
  const itemCount = lines.reduce((count, line) => count + line.quantity, 0);

  function updateQuantity(slug: string, quantity: number) {
    setLines((current) =>
      current.map((line) => {
        if (line.bag.slug !== slug) return line;

        return {
          ...line,
          quantity: Math.min(line.bag.remainingQuantity, Math.max(1, Math.floor(quantity) || 1)),
        };
      }),
    );
  }

  function applyVoucher() {
    setVoucherDiscount(voucherCode.trim().toUpperCase() === "STEAL10" ? 10000 : 0);
  }

  function submitOrders() {
    setError("");

    if (lines.length === 0) {
      setError("Your cart is empty. Add a surprise bag before placing an order.");
      return;
    }

    setSubmitting(true);
    setSubmitted(true);
    setSubmitting(false);
  }

  function handleAddressSelection(addressId: string) {
    setSelectedAddressId(addressId);

    if (addressId === "new") {
      setDeliveryAddress("");
      return;
    }

    const selectedAddress = savedAddresses.find((address) => address.id === addressId);
    setDeliveryAddress(selectedAddress ? formatAddress(selectedAddress) : "");
  }

  return (
    <main className="main checkout-page">
      <nav aria-label="Breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/cart">Cart</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Checkout</li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <header className="checkout-heading">
            <div>
              <p>One step closer to rescuing good food</p>
              <h1>Checkout</h1>
            </div>
            <span>{itemCount} {itemCount === 1 ? "bag" : "bags"} in your order</span>
          </header>

          {submitted ? (
            <section className="checkout-success" aria-live="polite">
              <span className="checkout-success__icon" aria-hidden="true">&#10003;</span>
              <p>Order details ready</p>
              <h2>Your rescue order has been placed</h2>
              <span>The store now has your saved contact details for this order.</span>
              <div className="checkout-success__actions">
                <Link href="/products" className="btn btn-primary">Continue browsing</Link>
                <Link href="/" className="btn btn-outline-primary-2">Back to home</Link>
              </div>
            </section>
          ) : (
            <form
              className="checkout-layout"
              onSubmit={(event) => {
                event.preventDefault();
                void submitOrders();
              }}
            >
              <div className="checkout-main-column">
                <section className="checkout-panel" aria-labelledby="customer-information-title">
                  <div className="checkout-panel__heading">
                    <div>
                      <p>Customer information</p>
                      <h2 id="customer-information-title">Who should we contact about this order?</h2>
                    </div>
                    <span className="checkout-panel__step">1</span>
                  </div>

                  <div className="checkout-customer-info__grid">
                    <label className="checkout-field">
                      <span>Full name *</span>
                      <input
                        type="text"
                        value={customerInfo.fullName}
                        onChange={(event) =>
                          setCustomerInfo((current) => ({ ...current, fullName: event.target.value }))
                        }
                        autoComplete="name"
                        required
                      />
                    </label>
                    <label className="checkout-field">
                      <span>Email address *</span>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(event) =>
                          setCustomerInfo((current) => ({ ...current, email: event.target.value }))
                        }
                        autoComplete="email"
                        required
                      />
                    </label>
                    <label className="checkout-field checkout-field--full">
                      <span>Phone number</span>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(event) =>
                          setCustomerInfo((current) => ({ ...current, phone: event.target.value }))
                        }
                        autoComplete="tel"
                        placeholder="Add a phone number"
                      />
                    </label>
                  </div>
                  <p className="checkout-customer-info__note">
                    These details are used for this order and can be edited before you place it.
                  </p>
                </section>

                <section className="checkout-panel" aria-labelledby="delivery-title">
                  <div className="checkout-panel__heading">
                    <div>
                      <p>Delivery details</p>
                      <h2 id="delivery-title">How would you like to receive your bags?</h2>
                    </div>
                    <span className="checkout-panel__step">2</span>
                  </div>

                  <div className="checkout-choice-grid">
                    <label className={`checkout-choice${deliveryType === "Pickup" ? " is-selected" : ""}`}>
                      <input type="radio" name="deliveryType" value="Pickup" checked={deliveryType === "Pickup"} onChange={() => setDeliveryType("Pickup")} />
                      <span><strong>Pickup at store</strong><small>Collect each bag during the store&apos;s pickup window.</small></span>
                    </label>
                    <label className={`checkout-choice${deliveryType === "Delivery" ? " is-selected" : ""}`}>
                      <input type="radio" name="deliveryType" value="Delivery" checked={deliveryType === "Delivery"} onChange={() => setDeliveryType("Delivery")} />
                      <span><strong>Delivery</strong><small>Have your rescued food delivered to one address.</small></span>
                    </label>
                  </div>

                  {deliveryType === "Delivery" ? (
                    <div className="checkout-delivery-address">
                      {savedAddresses.length > 0 && (
                        <label className="checkout-field checkout-field--full">
                          <span>Saved address</span>
                          <select value={selectedAddressId} onChange={(event) => handleAddressSelection(event.target.value)}>
                            {savedAddresses.map((address) => (
                              <option key={address.id} value={address.id}>
                                {address.label || "Address"} - {formatAddress(address)}
                              </option>
                            ))}
                            <option value="new">Enter a new address</option>
                          </select>
                        </label>
                      )}

                      {savedAddresses.length === 0 || selectedAddressId === "new" ? (
                        <label className="checkout-field checkout-field--full">
                          <span>Delivery address *</span>
                          <textarea value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="House number, street, district, city" required rows={3} />
                        </label>
                      ) : (
                        <div className="checkout-selected-address" aria-live="polite">
                          <span>Delivering to</span>
                          <strong>{deliveryAddress}</strong>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="checkout-pickup-note">
                      <span className="checkout-pickup-note__icon" aria-hidden="true">&#9906;</span>
                      <div><strong>Pickup locations are shown below</strong><p>Each store will provide its pickup instructions with the order confirmation.</p></div>
                    </div>
                  )}
                </section>

                <section className="checkout-panel" aria-labelledby="bags-title">
                  <div className="checkout-panel__heading">
                    <div><p>Your rescue bags</p><h2 id="bags-title">Review your order</h2></div>
                    <span className="checkout-panel__step">3</span>
                  </div>

                  <div className="checkout-store-list">
                    {groups.map((group) => (
                      <section className="checkout-store" key={group.storeId}>
                        <header><span>Store</span><h3>{group.storeName}</h3></header>
                        {group.lines.map((line) => (
                          <div className="checkout-line" key={line.bag.slug}>
                            <Image src={line.bag.imageSrc} width={88} height={68} sizes="88px" alt={line.bag.imageAlt} />
                            <div className="checkout-line__details">
                              <Link href={`/product?bag=${encodeURIComponent(line.bag.slug)}`}>{line.bag.name}</Link>
                              <span>{line.bag.pickupWindow}</span>
                              <strong>{formatPrice(line.bag.salePrice)}</strong>
                            </div>
                            <div className="checkout-line__quantity">
                              <button type="button" aria-label={`Decrease quantity of ${line.bag.name}`} onClick={() => updateQuantity(line.bag.slug, line.quantity - 1)} disabled={line.quantity <= 1}>-</button>
                              <input aria-label={`Quantity of ${line.bag.name}`} type="number" min="1" max={line.bag.remainingQuantity} value={line.quantity} onChange={(event) => updateQuantity(line.bag.slug, Number(event.target.value))} />
                              <button type="button" aria-label={`Increase quantity of ${line.bag.name}`} onClick={() => updateQuantity(line.bag.slug, line.quantity + 1)} disabled={line.quantity >= line.bag.remainingQuantity}>+</button>
                            </div>
                            <strong className="checkout-line__total">{formatPrice(line.bag.salePrice * line.quantity)}</strong>
                          </div>
                        ))}
                      </section>
                    ))}
                  </div>
                  <Link href="/cart" className="checkout-edit-cart">Edit cart</Link>
                </section>

                <section className="checkout-panel" aria-labelledby="payment-title">
                  <div className="checkout-panel__heading">
                    <div><p>Payment</p><h2 id="payment-title">Choose a payment method</h2></div>
                    <span className="checkout-panel__step">4</span>
                  </div>
                  <div className="checkout-payment-list">
                    <label className={`checkout-payment${paymentMethod === "CashOnPickup" ? " is-selected" : ""}`}>
                      <input type="radio" name="paymentMethod" value="CashOnPickup" checked={paymentMethod === "CashOnPickup"} onChange={(event) => setPaymentMethod(event.target.value)} />
                      <span><strong>Cash on pickup</strong><small>Pay when you collect your bags from the store.</small></span>
                    </label>
                    <label className={`checkout-payment${paymentMethod === "BankTransfer" ? " is-selected" : ""}`}>
                      <input type="radio" name="paymentMethod" value="BankTransfer" checked={paymentMethod === "BankTransfer"} onChange={(event) => setPaymentMethod(event.target.value)} />
                      <span><strong>Bank transfer</strong><small>Receive payment instructions after placing the order.</small></span>
                    </label>
                    <label className={`checkout-payment${paymentMethod === "OnlinePayment" ? " is-selected" : ""}`}>
                      <input type="radio" name="paymentMethod" value="OnlinePayment" checked={paymentMethod === "OnlinePayment"} onChange={(event) => setPaymentMethod(event.target.value)} />
                      <span><strong>Online payment</strong><small>Use an online payment gateway when it is connected.</small></span>
                    </label>
                  </div>
                </section>
              </div>

              <aside className="checkout-summary" aria-labelledby="checkout-summary-title">
                <p>Order summary</p>
                <h2 id="checkout-summary-title">Your total</h2>
                <div className="checkout-summary__stores"><span>Stores</span><strong>{groups.length}</strong></div>
                <div className="checkout-summary__row"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
                <div className="checkout-summary__row"><span>{deliveryType === "Delivery" ? "Delivery fee" : "Pickup"}</span><strong>{deliveryFee ? formatPrice(deliveryFee) : "Free"}</strong></div>
                <div className="checkout-voucher">
                  <label htmlFor="voucher-code">Voucher code</label>
                  <div><input id="voucher-code" type="text" value={voucherCode} onChange={(event) => setVoucherCode(event.target.value)} placeholder="Optional" /><button type="button" onClick={applyVoucher}>Apply</button></div>
                </div>
                <div className="checkout-summary__row"><span>Voucher discount</span><strong>{voucherDiscount ? `- ${formatPrice(voucherDiscount)}` : "-"}</strong></div>
                <div className="checkout-summary__total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <button type="submit" className="btn btn-primary checkout-submit" disabled={submitting}>{submitting ? "Placing order..." : "Place order"} <span aria-hidden="true">&#8594;</span></button>
                <p className="checkout-summary__note">By placing your order, you agree to collect the bags during the listed pickup window.</p>
              </aside>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
