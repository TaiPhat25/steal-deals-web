import Link from "next/link";

type Product = {
  id: number;
  image: string;
  category: string;
  title: string;
  price: string;
  rating: number;
  reviews: number;
  label?: {
    text: string;
    className: string;
  };
  outOfStock?: boolean;
  thumbnails?: string[];
};

const products: Product[] = [
  {
    id: 1,
    image: "/assets/images/products/product-4.jpg",
    category: "Women",
    title: "Brown paperbag waist pencil skirt",
    price: "$60.00",
    rating: 20,
    reviews: 2,
    label: { text: "New", className: "label-new" },
    thumbnails: [
      "/assets/images/products/product-4-thumb.jpg",
      "/assets/images/products/product-4-2-thumb.jpg",
      "/assets/images/products/product-4-3-thumb.jpg",
    ],
  },
  {
    id: 2,
    image: "/assets/images/products/product-5.jpg",
    category: "Dresses",
    title: "Dark yellow lace cut out swing dress",
    price: "$84.00",
    rating: 0,
    reviews: 0,
    thumbnails: [
      "/assets/images/products/product-5-thumb.jpg",
      "/assets/images/products/product-5-2-thumb.jpg",
    ],
  },
  {
    id: 3,
    image: "/assets/images/products/product-6.jpg",
    category: "Jackets",
    title: "Khaki utility boiler jumpsuit",
    price: "$120.00",
    rating: 80,
    reviews: 6,
    label: { text: "Out of Stock", className: "label-out" },
    outOfStock: true,
  },
  {
    id: 4,
    image: "/assets/images/products/product-7.jpg",
    category: "Jeans",
    title: "Blue utility pinafore denim dress",
    price: "$76.00",
    rating: 20,
    reviews: 2,
  },
  {
    id: 5,
    image: "/assets/images/products/product-8.jpg",
    category: "Shoes",
    title: "Beige knitted elastic runner shoes",
    price: "$84.00",
    rating: 0,
    reviews: 0,
    label: { text: "New", className: "label-new" },
    thumbnails: [
      "/assets/images/products/product-8-thumb.jpg",
      "/assets/images/products/product-8-2-thumb.jpg",
    ],
  },
  {
    id: 6,
    image: "/assets/images/products/product-9.jpg",
    category: "Bags",
    title: "Orange saddle lock front chain cross body bag",
    price: "$84.00",
    rating: 60,
    reviews: 1,
    thumbnails: [
      "/assets/images/products/product-9-thumb.jpg",
      "/assets/images/products/product-9-2-thumb.jpg",
      "/assets/images/products/product-9-3-thumb.jpg",
    ],
  },
  {
    id: 7,
    image: "/assets/images/products/product-11.jpg",
    category: "Shoes",
    title: "Light brown studded Wide fit wedges",
    price: "$110.00",
    rating: 80,
    reviews: 1,
    label: { text: "Top", className: "label-top" },
    thumbnails: [
      "/assets/images/products/product-11-thumb.jpg",
      "/assets/images/products/product-11-2-thumb.jpg",
      "/assets/images/products/product-11-3-thumb.jpg",
    ],
  },
  {
    id: 8,
    image: "/assets/images/products/product-10.jpg",
    category: "Jumpers",
    title: "Yellow button front tea top",
    price: "$56.00",
    rating: 0,
    reviews: 0,
  },
  {
    id: 9,
    image: "/assets/images/products/product-12.jpg",
    category: "Bags",
    title: "Black soft RI weekend travel bag",
    price: "$68.00",
    rating: 0,
    reviews: 0,
  },
  {
    id: 10,
    image: "/assets/images/products/product-13.jpg",
    category: "Bags",
    title: "Beige metal hoop tote bag",
    price: "$76.00",
    rating: 40,
    reviews: 1,
    thumbnails: [
      "/assets/images/products/product-13-thumb.jpg",
      "/assets/images/products/product-13-2-thumb.jpg",
    ],
  },
  {
    id: 11,
    image: "/assets/images/products/product-14.jpg",
    category: "Dresses",
    title: "Brown zebra print dungaree dress",
    price: "$80.00",
    rating: 0,
    reviews: 0,
    thumbnails: [
      "/assets/images/products/product-14-thumb.jpg",
      "/assets/images/products/product-14-2-thumb.jpg",
      "/assets/images/products/product-14-3-thumb.jpg",
    ],
  },
  {
    id: 12,
    image: "/assets/images/products/product-15.jpg",
    category: "Bags",
    title: "Beige ring handle circle cross body bag",
    price: "$56.00",
    rating: 0,
    reviews: 0,
  },
];

const categoryFilters = [
  ["Dresses", 3],
  ["T-shirts", 0],
  ["Bags", 4],
  ["Jackets", 2],
  ["Shoes", 2],
  ["Jumpers", 1],
  ["Jeans", 1],
  ["Sportwear", 0],
] as const;

const sizeFilters = ["XS", "S", "M", "L", "XL", "XXL"];
const brandFilters = ["Next", "River Island", "Geox", "New Balance", "UGG", "F&F", "Nike"];
const colorFilters = [
  "#b87145",
  "#f0c04a",
  "#333333",
  "#cc3333",
  "#3399cc",
  "#669933",
  "#f2719c",
  "#ebebeb",
];

function GridIcon({ columns }: { columns: number }) {
  const width = columns === 1 ? 16 : columns * 4 + (columns - 1) * 2;

  return (
    <svg width={width} height="10" aria-hidden="true">
      {Array.from({ length: columns }, (_, index) => (
        <g key={index}>
          <rect x={index * 6} y="0" width="4" height="4" />
          <rect x={index * 6} y="6" width="4" height="4" />
        </g>
      ))}
    </svg>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="col-6 col-md-4 col-lg-4 col-xl-3">
      <div className="product product-7 text-center">
        <figure className="product-media">
          {product.label ? (
            <span className={`product-label ${product.label.className}`}>
              {product.label.text}
            </span>
          ) : null}

          <Link href="/product">
            <img src={product.image} alt={product.title} className="product-image" />
          </Link>

          <div className="product-action-vertical">
            <button
              type="button"
              className="btn-product-icon btn-wishlist btn-expandable"
              aria-label={`Add ${product.title} to wishlist`}
            >
              <span>Add to wishlist</span>
            </button>
            <Link
              href="/product"
              className="btn-product-icon btn-quickview"
              aria-label={`Quick view ${product.title}`}
            >
              <span>Quick view</span>
            </Link>
            <button
              type="button"
              className="btn-product-icon btn-compare"
              aria-label={`Compare ${product.title}`}
            >
              <span>Compare</span>
            </button>
          </div>

          <div className="product-action">
            <button
              type="button"
              className="btn-product btn-cart"
              disabled={product.outOfStock}
            >
              <span>{product.outOfStock ? "Out of stock" : "Add to cart"}</span>
            </button>
          </div>
        </figure>

        <div className="product-body">
          <div className="product-cat">
            <Link href="/category">{product.category}</Link>
          </div>
          <h3 className="product-title">
            <Link href="/product">{product.title}</Link>
          </h3>
          <div className="product-price">
            {product.outOfStock ? <span className="out-price">{product.price}</span> : product.price}
          </div>
          <div className="ratings-container">
            <div className="ratings">
              <div className="ratings-val" style={{ width: `${product.rating}%` }} />
            </div>
            <span className="ratings-text">
              ( {product.reviews} {product.reviews === 1 ? "Review" : "Reviews"} )
            </span>
          </div>

          {product.thumbnails ? (
            <div className="product-nav product-nav-thumbs">
              {product.thumbnails.map((thumbnail, index) => (
                <button
                  type="button"
                  className={index === 0 ? "active" : undefined}
                  key={thumbnail}
                  aria-label={`View ${product.title} option ${index + 1}`}
                >
                  <img src={thumbnail} alt="" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FilterWidget({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="widget widget-collapsible">
      <h3 className="widget-title">
        <button
          type="button"
          className="category-widget-toggle"
          data-toggle="collapse"
          data-target={`#${id}`}
          aria-expanded="true"
          aria-controls={id}
        >
          {title}
        </button>
      </h3>
      <div className="collapse show" id={id}>
        <div className="widget-body">{children}</div>
      </div>
    </div>
  );
}

export default function CategoryMain() {
  return (
    <main className="main category-page">
      <div
        className="page-header text-center"
        style={{ backgroundImage: "url('/assets/images/page-header-bg.jpg')" }}
      >
        <div className="container">
          <h1 className="page-title">
            Grid 4 Columns<span>Shop</span>
          </h1>
        </div>
      </div>

      <nav aria-label="breadcrumb" className="breadcrumb-nav mb-2">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/category">Shop</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Grid 4 Columns
            </li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <div className="row">
            <div className="col-lg-9">
              <div className="toolbox">
                <div className="toolbox-left">
                  <div className="toolbox-info">
                    Showing <span>{products.length} of 56</span> Products
                  </div>
                </div>

                <div className="toolbox-right">
                  <div className="toolbox-sort">
                    <label htmlFor="sortby">Sort by:</label>
                    <div className="select-custom">
                      <select
                        name="sortby"
                        id="sortby"
                        className="form-control"
                        defaultValue="popularity"
                      >
                        <option value="popularity">Most Popular</option>
                        <option value="rating">Most Rated</option>
                        <option value="date">Date</option>
                      </select>
                    </div>
                  </div>
                  <div className="toolbox-layout" aria-label="Product layout">
                    {[1, 2, 3, 4].map((columns) => (
                      <button
                        type="button"
                        className={`btn-layout${columns === 4 ? " active" : ""}`}
                        aria-label={`${columns === 1 ? "List" : `${columns} column`} layout`}
                        aria-pressed={columns === 4}
                        disabled={columns !== 4}
                        key={columns}
                      >
                        <GridIcon columns={columns} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="products mb-3">
                <div className="row justify-content-center">
                  {products.map((product) => (
                    <ProductCard product={product} key={product.id} />
                  ))}
                </div>
              </div>

              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                  <li className="page-item disabled">
                    <span className="page-link page-link-prev" aria-disabled="true">
                      <span aria-hidden="true">
                        <i className="icon-long-arrow-left" />
                      </span>
                      Prev
                    </span>
                  </li>
                  <li className="page-item active" aria-current="page">
                    <span className="page-link">1</span>
                  </li>
                  <li className="page-item">
                    <button type="button" className="page-link">
                      2
                    </button>
                  </li>
                  <li className="page-item-total">of 6</li>
                  <li className="page-item">
                    <button type="button" className="page-link page-link-next">
                      Next
                      <span aria-hidden="true">
                        <i className="icon-long-arrow-right" />
                      </span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            <aside className="col-lg-3 order-lg-first">
              <div className="sidebar sidebar-shop">
                <div className="widget widget-clean">
                  <label>Filters:</label>
                  <button type="reset" className="sidebar-filter-clear">
                    Clear All
                  </button>
                </div>

                <FilterWidget id="category-filter" title="Category">
                  <div className="filter-items filter-items-count">
                    {categoryFilters.map(([category, count], index) => (
                      <div className="filter-item" key={category}>
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`category-${index + 1}`}
                          />
                          <label
                            className="custom-control-label"
                            htmlFor={`category-${index + 1}`}
                          >
                            {category}
                          </label>
                        </div>
                        <span className="item-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </FilterWidget>

                <FilterWidget id="size-filter" title="Size">
                  <div className="filter-items">
                    {sizeFilters.map((size, index) => (
                      <div className="filter-item" key={size}>
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`size-${index + 1}`}
                            defaultChecked={size === "M" || size === "L"}
                          />
                          <label
                            className="custom-control-label"
                            htmlFor={`size-${index + 1}`}
                          >
                            {size}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </FilterWidget>

                <FilterWidget id="colour-filter" title="Colour">
                  <div className="filter-colors">
                    {colorFilters.map((color, index) => (
                      <button
                        type="button"
                        className={index === 3 ? "selected" : undefined}
                        style={{ backgroundColor: color }}
                        aria-label={`Select colour ${index + 1}`}
                        key={color}
                      />
                    ))}
                  </div>
                </FilterWidget>

                <FilterWidget id="brand-filter" title="Brand">
                  <div className="filter-items">
                    {brandFilters.map((brand, index) => (
                      <div className="filter-item" key={brand}>
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`brand-${index + 1}`}
                          />
                          <label
                            className="custom-control-label"
                            htmlFor={`brand-${index + 1}`}
                          >
                            {brand}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </FilterWidget>

                <FilterWidget id="price-filter" title="Price">
                  <div className="filter-price">
                    <div className="filter-price-text">
                      Price Range: <span>$0 - $100</span>
                    </div>
                    <label className="sr-only" htmlFor="price-range">
                      Maximum price
                    </label>
                    <input
                      type="range"
                      id="price-range"
                      className="category-price-range"
                      min="0"
                      max="100"
                      defaultValue="100"
                    />
                  </div>
                </FilterWidget>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
