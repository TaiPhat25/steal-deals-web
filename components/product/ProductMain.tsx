import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  isActive: boolean;
};

type StoreProfile = {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  avatarUrl: string | null;
  phone: string | null;
  bankAccount: string | null;
  ratingScore: number;
  licenseUrl: string | null;
  isVerify: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

type StoreReview = {
  id: string;
  orderId: string;
  buyerId: string;
  storeId: string;
  bagId: string;
  ratingScore: number;
  comment: string | null;
  storeReply: string | null;
  isReported: boolean;
  createdAt: string;
};

type SurpriseBagDetail = {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  originalPrice: number;
  salePrice: number;
  quantityTotal: number;
  quantityRemaining: number;
  pickupStartTime: string;
  pickupEndTime: string;
  expiryDate: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  store: StoreProfile;
  categories: Category[];
  storeReviews: StoreReview[];
  imageSrc: string;
  gallery: string[];
};

const categories = {
  bakery: {
    id: "10000000-0000-0000-0000-000000000001",
    name: "Bakery",
    slug: "bakery",
    iconUrl: null,
    isActive: true,
  },
  produce: {
    id: "10000000-0000-0000-0000-000000000002",
    name: "Produce",
    slug: "produce",
    iconUrl: null,
    isActive: true,
  },
  seafood: {
    id: "10000000-0000-0000-0000-000000000003",
    name: "Seafood",
    slug: "seafood",
    iconUrl: null,
    isActive: true,
  },
} satisfies Record<string, Category>;

const stores = {
  morningOven: {
    id: "8f3522c1-7d86-4b25-b8fe-5cbf8a101001",
    ownerId: "45a26c2e-19f0-4c73-88d4-3fb5b8d21001",
    name: "Morning Oven Bakery",
    description: "Fresh bread and pastries rescued at the end of each day.",
    address: "12 Nguyen Trai Street, District 1, Ho Chi Minh City",
    latitude: 10.7715,
    longitude: 106.701,
    avatarUrl: "/assets/images/demos/demo-28/banners/banner-1.jpg",
    phone: "+84 28 3822 1001",
    bankAccount: null,
    ratingScore: 4.8,
    licenseUrl: null,
    isVerify: true,
    isActive: true,
    createdAt: "2026-07-02T08:30:00.000Z",
    updatedAt: null,
  },
  greenBasket: {
    id: "8f3522c1-7d86-4b25-b8fe-5cbf8a101002",
    ownerId: "45a26c2e-19f0-4c73-88d4-3fb5b8d21002",
    name: "Green Basket Market",
    description: "Seasonal fruits and vegetables available for local pickup.",
    address: "24 Le Loi Street, District 3, Ho Chi Minh City",
    latitude: 10.7791,
    longitude: 106.6922,
    avatarUrl: "/assets/images/demos/demo-28/banners/banner-3.jpg",
    phone: "+84 28 3822 1002",
    bankAccount: null,
    ratingScore: 4.7,
    licenseUrl: null,
    isVerify: true,
    isActive: true,
    createdAt: "2026-07-04T09:15:00.000Z",
    updatedAt: null,
  },
  harborFresh: {
    id: "8f3522c1-7d86-4b25-b8fe-5cbf8a101003",
    ownerId: "45a26c2e-19f0-4c73-88d4-3fb5b8d21003",
    name: "Harbor Fresh Foods",
    description: "Quality meals and seafood boxes prepared for same-day pickup.",
    address: "8 Ton Duc Thang Street, District 1, Ho Chi Minh City",
    latitude: 10.7828,
    longitude: 106.7067,
    avatarUrl: "/assets/images/demos/demo-28/banners/5.jpg",
    phone: "+84 28 3822 1003",
    bankAccount: null,
    ratingScore: 4.6,
    licenseUrl: null,
    isVerify: true,
    isActive: true,
    createdAt: "2026-07-08T07:45:00.000Z",
    updatedAt: null,
  },
} satisfies Record<string, StoreProfile>;

const surpriseBags: SurpriseBagDetail[] = [
  {
    id: "137b2d0d-0c73-4fe2-9e23-100000000001",
    storeId: stores.morningOven.id,
    name: "Bakery Breakfast Surprise Bag",
    description: "A mixed selection of breads and pastries left at closing. Contents vary by day.",
    originalPrice: 95000,
    salePrice: 45000,
    quantityTotal: 8,
    quantityRemaining: 4,
    pickupStartTime: "2026-08-03T17:00:00+07:00",
    pickupEndTime: "2026-08-03T19:00:00+07:00",
    expiryDate: "2026-08-03T23:59:00+07:00",
    status: "Active",
    createdAt: "2026-07-29T09:00:00.000Z",
    updatedAt: null,
    store: stores.morningOven,
    categories: [categories.bakery],
    storeReviews: [
      {
        id: "7cc92a4d-7d12-4833-a246-4c76e8f21001",
        orderId: "40000000-0000-0000-0000-000000001001",
        buyerId: "50000000-0000-0000-0000-000000001001",
        storeId: stores.morningOven.id,
        bagId: "137b2d0d-0c73-4fe2-9e23-100000000001",
        ratingScore: 5,
        comment: "The bakery bag had a generous mix and pickup was quick.",
        storeReply: null,
        isReported: false,
        createdAt: "2026-07-30T10:00:00.000Z",
      },
    ],
    imageSrc: "/assets/images/demos/demo-28/flash/1.jpg",
    gallery: [
      "/assets/images/demos/demo-28/flash/1.jpg",
      "/assets/images/demos/demo-28/flash/7.jpg",
      "/assets/images/demos/demo-28/banners/banner-1.jpg",
    ],
  },
  {
    id: "137b2d0d-0c73-4fe2-9e23-100000000003",
    storeId: stores.greenBasket.id,
    name: "Market Fresh Vegetable Bag",
    description: "Seasonal vegetables packed from daily surplus and ready for same-day pickup.",
    originalPrice: 120000,
    salePrice: 59000,
    quantityTotal: 8,
    quantityRemaining: 6,
    pickupStartTime: "2026-08-03T18:00:00+07:00",
    pickupEndTime: "2026-08-03T20:00:00+07:00",
    expiryDate: "2026-08-04T08:00:00+07:00",
    status: "Active",
    createdAt: "2026-07-30T08:20:00.000Z",
    updatedAt: null,
    store: stores.greenBasket,
    categories: [categories.produce],
    storeReviews: [
      {
        id: "7cc92a4d-7d12-4833-a246-4c76e8f21002",
        orderId: "40000000-0000-0000-0000-000000001002",
        buyerId: "50000000-0000-0000-0000-000000001002",
        storeId: stores.greenBasket.id,
        bagId: "137b2d0d-0c73-4fe2-9e23-100000000003",
        ratingScore: 5,
        comment: "Fresh vegetables with clear pickup instructions.",
        storeReply: null,
        isReported: false,
        createdAt: "2026-07-28T16:00:00.000Z",
      },
    ],
    imageSrc: "/assets/images/demos/demo-28/flash/2.jpg",
    gallery: [
      "/assets/images/demos/demo-28/flash/2.jpg",
      "/assets/images/demos/demo-28/flash/10.jpg",
      "/assets/images/demos/demo-28/banners/banner-3.jpg",
    ],
  },
  {
    id: "137b2d0d-0c73-4fe2-9e23-100000000004",
    storeId: stores.harborFresh.id,
    name: "Seafood Family Surprise Bag",
    description: "A same-day seafood dinner box selected by the store. Best collected during the pickup window.",
    originalPrice: 360000,
    salePrice: 189000,
    quantityTotal: 4,
    quantityRemaining: 2,
    pickupStartTime: "2026-08-03T16:30:00+07:00",
    pickupEndTime: "2026-08-03T18:30:00+07:00",
    expiryDate: "2026-08-03T22:00:00+07:00",
    status: "Active",
    createdAt: "2026-07-31T09:30:00.000Z",
    updatedAt: null,
    store: stores.harborFresh,
    categories: [categories.seafood],
    storeReviews: [
      {
        id: "7cc92a4d-7d12-4833-a246-4c76e8f21003",
        orderId: "40000000-0000-0000-0000-000000001003",
        buyerId: "50000000-0000-0000-0000-000000001003",
        storeId: stores.harborFresh.id,
        bagId: "137b2d0d-0c73-4fe2-9e23-100000000004",
        ratingScore: 4,
        comment: "Great value for seafood. The pickup window was accurate.",
        storeReply: null,
        isReported: false,
        createdAt: "2026-07-29T13:30:00.000Z",
      },
    ],
    imageSrc: "/assets/images/demos/demo-28/flash/3.jpg",
    gallery: [
      "/assets/images/demos/demo-28/flash/3.jpg",
      "/assets/images/demos/demo-28/flash/8.jpg",
      "/assets/images/demos/demo-28/banners/5.jpg",
    ],
  },
];

const routeAliases: Record<string, string> = {
  "bakery-breakfast-box": "137b2d0d-0c73-4fe2-9e23-100000000001",
  "fresh-produce-box": "137b2d0d-0c73-4fe2-9e23-100000000003",
  "seafood-family-box": "137b2d0d-0c73-4fe2-9e23-100000000004",
};

function formatPrice(value: number) {
  return `${value.toLocaleString("en-US")} VND`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getDiscountPercent(product: SurpriseBagDetail) {
  if (!product.originalPrice) return 0;
  return Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100);
}

function getRatingPercent(score: number) {
  return `${Math.min(Math.max(score, 0), 5) * 20}%`;
}

function getAverageRating(reviews: StoreReview[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, review) => sum + review.ratingScore, 0) / reviews.length;
}

function findProduct(bagId?: string) {
  if (!bagId) return surpriseBags[0];
  const normalized = decodeURIComponent(bagId).trim().toLowerCase();
  const productId = routeAliases[normalized] ?? normalized;

  return surpriseBags.find((product) => product.id.toLowerCase() === productId) ?? surpriseBags[0];
}

export default function ProductMain({ bagId }: { bagId?: string }) {
  const product = findProduct(bagId);
  const averageRating = getAverageRating(product.storeReviews);
  const discountPercent = getDiscountPercent(product);
  const isAvailable = product.status === "Active" && product.quantityRemaining > 0;
  const relatedProducts = surpriseBags.filter((item) => item.id !== product.id);

  return (
    <main className="main product-detail-page">
      <nav aria-label="breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container d-flex align-items-center">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/products">Surprise Bags</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {product.name}
            </li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <div className="product-details-top">
            <div className="row">
              <div className="col-md-6">
                <div className="product-gallery product-gallery-vertical">
                  <div className="row">
                    <figure className="product-main-image product-detail-page__main-image">
                      <img id="product-zoom" src={product.imageSrc} alt={product.name} />
                      <span className="product-detail-page__discount-badge">Save {discountPercent}%</span>
                    </figure>

                    <div id="product-zoom-gallery" className="product-image-gallery">
                      {product.gallery.map((image, index) => (
                        <a
                          key={image}
                          className={`product-gallery-item${index === 0 ? " active" : ""}`}
                          href={image}
                        >
                          <img src={image} alt={`${product.name} preview ${index + 1}`} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="product-details">
                  <p className="product-detail-page__eyebrow">Surprise bag</p>
                  <h1 className="product-title">{product.name}</h1>

                  <div className="ratings-container">
                    <div className="ratings">
                      <div className="ratings-val" style={{ width: getRatingPercent(averageRating) }}></div>
                    </div>
                    <a className="ratings-text" href="#product-review-link" id="review-link">
                      ( {product.storeReviews.length} Reviews )
                    </a>
                  </div>

                  <div className="product-price product-detail-page__price">
                    <span>{formatPrice(product.salePrice)}</span>
                    <del>{formatPrice(product.originalPrice)}</del>
                  </div>

                  <div className="product-content">
                    <p>{product.description}</p>
                  </div>

                  <dl className="product-detail-page__summary">
                    <div>
                      <dt>Store</dt>
                      <dd>
                        <Link href={`/stores/${encodeURIComponent(product.store.id)}`}>{product.store.name}</Link>
                      </dd>
                    </div>
                    <div>
                      <dt>Pickup</dt>
                      <dd>
                        {formatDateTime(product.pickupStartTime)} - {formatDateTime(product.pickupEndTime)}
                      </dd>
                    </div>
                    <div>
                      <dt>Expiry</dt>
                      <dd>{formatDateTime(product.expiryDate)}</dd>
                    </div>
                    <div>
                      <dt>Available</dt>
                      <dd>
                        {product.quantityRemaining} of {product.quantityTotal} bags left
                      </dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{product.status}</dd>
                    </div>
                  </dl>

                  <div className="details-filter-row details-row-size">
                    <label>Categories:</label>
                    <div className="product-detail-page__categories">
                      {product.categories.map((category) => (
                        <Link href={`/products?category=${encodeURIComponent(category.name)}`} key={category.id}>
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="details-filter-row details-row-size">
                    <label htmlFor="qty">Qty:</label>
                    <div className="product-details-quantity">
                      <input
                        type="number"
                        id="qty"
                        className="form-control"
                        defaultValue="1"
                        min="1"
                        max={product.quantityRemaining}
                        step="1"
                        data-decimals="0"
                        disabled={!isAvailable}
                      />
                    </div>
                  </div>

                  <div className="product-details-action">
                    <Link
                      href={isAvailable ? `/cart?bag=${encodeURIComponent(product.id)}` : "#"}
                      className={`btn-product btn-cart${!isAvailable ? " disabled" : ""}`}
                    >
                      <span>{isAvailable ? "add to cart" : "sold out"}</span>
                    </Link>
                    <div className="details-action-wrapper">
                      <Link href={`/wishlist?bag=${encodeURIComponent(product.id)}`} className="btn-product btn-wishlist">
                        <span>Add to Wishlist</span>
                      </Link>
                    </div>
                  </div>

                  <div className="product-details-footer">
                    <div className="product-cat">
                      <span>Store:</span>{" "}
                      <Link href={`/stores/${encodeURIComponent(product.store.id)}`}>{product.store.name}</Link>
                    </div>
                    <div className="product-cat">
                      <span>Created:</span> {formatDate(product.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="product-details-tab">
            <ul className="nav nav-pills justify-content-center" role="tablist">
              <li className="nav-item">
                <a
                  className="nav-link active"
                  id="product-desc-link"
                  data-toggle="tab"
                  href="#product-desc-tab"
                  role="tab"
                  aria-controls="product-desc-tab"
                  aria-selected="true"
                >
                  Description
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  id="product-info-link"
                  data-toggle="tab"
                  href="#product-info-tab"
                  role="tab"
                  aria-controls="product-info-tab"
                  aria-selected="false"
                >
                  Pickup information
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  id="product-review-link"
                  data-toggle="tab"
                  href="#product-review-tab"
                  role="tab"
                  aria-controls="product-review-tab"
                  aria-selected="false"
                >
                  Reviews ({product.storeReviews.length})
                </a>
              </li>
            </ul>

            <div className="tab-content">
              <div className="tab-pane fade show active" id="product-desc-tab" role="tabpanel" aria-labelledby="product-desc-link">
                <div className="product-desc-content">
                  <h3>Bag Information</h3>
                  <p>{product.description}</p>
                  <ul>
                    <li>Discount: {discountPercent}% off the original value.</li>
                    <li>Quantity: {product.quantityRemaining} bags remaining.</li>
                    <li>Categories: {product.categories.map((category) => category.name).join(", ")}.</li>
                  </ul>
                </div>
              </div>

              <div className="tab-pane fade" id="product-info-tab" role="tabpanel" aria-labelledby="product-info-link">
                <div className="product-desc-content">
                  <h3>Pickup Details</h3>
                  <p>
                    Please collect this surprise bag at {product.store.name} during the pickup window.
                  </p>
                  <dl className="product-detail-page__tab-details">
                    <div>
                      <dt>Pickup start</dt>
                      <dd>{formatDateTime(product.pickupStartTime)}</dd>
                    </div>
                    <div>
                      <dt>Pickup end</dt>
                      <dd>{formatDateTime(product.pickupEndTime)}</dd>
                    </div>
                    <div>
                      <dt>Expiry date</dt>
                      <dd>{formatDateTime(product.expiryDate)}</dd>
                    </div>
                    <div>
                      <dt>Store address</dt>
                      <dd>{product.store.address}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="tab-pane fade" id="product-review-tab" role="tabpanel" aria-labelledby="product-review-link">
                <div className="reviews">
                  <h3>Reviews ({product.storeReviews.length})</h3>
                  {product.storeReviews.length ? (
                    product.storeReviews.map((review) => (
                      <div className="review" key={review.id}>
                        <div className="row no-gutters">
                          <div className="col-auto">
                            <h4>Buyer {review.buyerId.slice(0, 8)}</h4>
                            <div className="ratings-container">
                              <div className="ratings">
                                <div className="ratings-val" style={{ width: getRatingPercent(review.ratingScore) }}></div>
                              </div>
                            </div>
                            <span className="review-date">{formatDate(review.createdAt)}</span>
                          </div>
                          <div className="col">
                            <h4>{review.ratingScore}/5 rating</h4>
                            <div className="review-content">
                              <p>{review.comment ?? "No comment provided."}</p>
                              {review.storeReply ? <p>Store reply: {review.storeReply}</p> : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No reviews yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {relatedProducts.length ? (
            <>
              <h2 className="title text-center mb-4">More Surprise Bags</h2>
              <div className="product-detail-page__related">
                {relatedProducts.map((item) => (
                  <article className="product-detail-page__related-item" key={item.id}>
                    <Link href={`/product?bag=${encodeURIComponent(item.id)}`}>
                      <img src={item.imageSrc} alt={item.name} />
                    </Link>
                    <div>
                      <p>{item.categories[0]?.name}</p>
                      <h3>
                        <Link href={`/product?bag=${encodeURIComponent(item.id)}`}>{item.name}</Link>
                      </h3>
                      <strong>{formatPrice(item.salePrice)}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
