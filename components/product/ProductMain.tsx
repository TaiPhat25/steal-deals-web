import Link from "next/link";

const galleryImages = [
  {
    image: "/assets/images/products/single/1.jpg",
    zoom: "/assets/images/products/single/1-big.jpg",
    thumb: "/assets/images/products/single/1-small.jpg",
    alt: "product side",
  },
  {
    image: "/assets/images/products/single/2.jpg",
    zoom: "/assets/images/products/single/2-big.jpg",
    thumb: "/assets/images/products/single/2-small.jpg",
    alt: "product cross",
  },
  {
    image: "/assets/images/products/single/3.jpg",
    zoom: "/assets/images/products/single/3-big.jpg",
    thumb: "/assets/images/products/single/3-small.jpg",
    alt: "product with model",
  },
  {
    image: "/assets/images/products/single/4.jpg",
    zoom: "/assets/images/products/single/4-big.jpg",
    thumb: "/assets/images/products/single/4-small.jpg",
    alt: "product back",
  },
];

const relatedProducts = [
  {
    label: "New",
    labelClass: "label-new",
    image: "/assets/images/products/product-4.jpg",
    category: "Women",
    title: "Brown paperbag waist pencil skirt",
    price: "$60.00",
    rating: "20%",
    reviews: "( 2 Reviews )",
    thumbs: [
      "/assets/images/products/product-4-thumb.jpg",
      "/assets/images/products/product-4-2-thumb.jpg",
      "/assets/images/products/product-4-3-thumb.jpg",
    ],
  },
  {
    label: "Out of Stock",
    labelClass: "label-out",
    image: "/assets/images/products/product-6.jpg",
    category: "Jackets",
    title: "Khaki utility boiler jumpsuit",
    price: "$120.00",
    priceClass: "out-price",
    rating: "80%",
    reviews: "( 6 Reviews )",
  },
  {
    label: "Top",
    labelClass: "label-top",
    image: "/assets/images/products/product-11.jpg",
    category: "Shoes",
    title: "Light brown studded Wide fit wedges",
    price: "$110.00",
    rating: "80%",
    reviews: "( 1 Reviews )",
    thumbs: [
      "/assets/images/products/product-11-thumb.jpg",
      "/assets/images/products/product-11-2-thumb.jpg",
      "/assets/images/products/product-11-3-thumb.jpg",
    ],
  },
  {
    image: "/assets/images/products/product-10.jpg",
    category: "Jumpers",
    title: "Yellow button front tea top",
    price: "$56.00",
    rating: "0%",
    reviews: "( 0 Reviews )",
  },
  {
    image: "/assets/images/products/product-7.jpg",
    category: "Jeans",
    title: "Blue utility pinafore denim dress",
    price: "$76.00",
    rating: "20%",
    reviews: "( 2 Reviews )",
  },
];

export default function ProductMain() {
  return (
    <main className="main">
      <nav aria-label="breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container d-flex align-items-center">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <a href="#">Products</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Default
            </li>
          </ol>

          <nav className="product-pager ml-auto" aria-label="Product">
            <a className="product-pager-link product-pager-prev" href="#" aria-label="Previous" tabIndex={-1}>
              <i className="icon-angle-left"></i>
              <span>Prev</span>
            </a>
            <a className="product-pager-link product-pager-next" href="#" aria-label="Next" tabIndex={-1}>
              <span>Next</span>
              <i className="icon-angle-right"></i>
            </a>
          </nav>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <div className="product-details-top">
            <div className="row">
              <div className="col-md-6">
                <div className="product-gallery product-gallery-vertical">
                  <div className="row">
                    <figure className="product-main-image">
                      <img
                        id="product-zoom"
                        src={galleryImages[0].image}
                        data-zoom-image={galleryImages[0].zoom}
                        alt="product image"
                      />
                      <a href="#" id="btn-product-gallery" className="btn-product-gallery">
                        <i className="icon-arrows"></i>
                      </a>
                    </figure>

                    <div id="product-zoom-gallery" className="product-image-gallery">
                      {galleryImages.map((item, index) => (
                        <a
                          key={item.image}
                          className={`product-gallery-item${index === 0 ? " active" : ""}`}
                          href="#"
                          data-image={item.image}
                          data-zoom-image={item.zoom}
                        >
                          <img src={item.thumb} alt={item.alt} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="product-details">
                  <h1 className="product-title">Dark yellow lace cut out swing dress</h1>

                  <div className="ratings-container">
                    <div className="ratings">
                      <div className="ratings-val" style={{ width: "80%" }}></div>
                    </div>
                    <a className="ratings-text" href="#product-review-link" id="review-link">
                      ( 2 Reviews )
                    </a>
                  </div>

                  <div className="product-price">$84.00</div>

                  <div className="product-content">
                    <p>
                      Sed egestas, ante et vulputate volutpat, eros pede semper est, vitae luctus metus
                      libero eu augue. Morbi purus libero, faucibus adipiscing. Sed lectus.
                    </p>
                  </div>

                  <div className="details-filter-row details-row-size">
                    <label>Color:</label>
                    <div className="product-nav product-nav-thumbs">
                      <a href="#" className="active">
                        <img src="/assets/images/products/single/1-thumb.jpg" alt="product desc" />
                      </a>
                      <a href="#">
                        <img src="/assets/images/products/single/2-thumb.jpg" alt="product desc" />
                      </a>
                    </div>
                  </div>

                  <div className="details-filter-row details-row-size">
                    <label htmlFor="size">Size:</label>
                    <div className="select-custom">
                      <select name="size" id="size" className="form-control" defaultValue="#">
                        <option value="#">Select a size</option>
                        <option value="s">Small</option>
                        <option value="m">Medium</option>
                        <option value="l">Large</option>
                        <option value="xl">Extra Large</option>
                      </select>
                    </div>
                    <a href="#" className="size-guide">
                      <i className="icon-th-list"></i>size guide
                    </a>
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
                        max="10"
                        step="1"
                        data-decimals="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="product-details-action">
                    <a href="#" className="btn-product btn-cart">
                      <span>add to cart</span>
                    </a>
                    <div className="details-action-wrapper">
                      <a href="#" className="btn-product btn-wishlist" title="Wishlist">
                        <span>Add to Wishlist</span>
                      </a>
                      <a href="#" className="btn-product btn-compare" title="Compare">
                        <span>Add to Compare</span>
                      </a>
                    </div>
                  </div>

                  <div className="product-details-footer">
                    <div className="product-cat">
                      <span>Category:</span> <a href="#">Women</a>, <a href="#">Dresses</a>,{" "}
                      <a href="#">Yellow</a>
                    </div>

                    <div className="social-icons social-icons-sm">
                      <span className="social-label">Share:</span>
                      <a href="#" className="social-icon" title="Facebook" target="_blank">
                        <i className="icon-facebook-f"></i>
                      </a>
                      <a href="#" className="social-icon" title="Twitter" target="_blank">
                        <i className="icon-twitter"></i>
                      </a>
                      <a href="#" className="social-icon" title="Instagram" target="_blank">
                        <i className="icon-instagram"></i>
                      </a>
                      <a href="#" className="social-icon" title="Pinterest" target="_blank">
                        <i className="icon-pinterest"></i>
                      </a>
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
                  Additional information
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  id="product-shipping-link"
                  data-toggle="tab"
                  href="#product-shipping-tab"
                  role="tab"
                  aria-controls="product-shipping-tab"
                  aria-selected="false"
                >
                  Shipping &amp; Returns
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
                  Reviews (2)
                </a>
              </li>
            </ul>

            <div className="tab-content">
              <div className="tab-pane fade show active" id="product-desc-tab" role="tabpanel" aria-labelledby="product-desc-link">
                <div className="product-desc-content">
                  <h3>Product Information</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque
                    volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna viverra
                    non, semper suscipit, posuere a, pede. Donec nec justo eget felis facilisis
                    fermentum.
                  </p>
                  <ul>
                    <li>Nunc nec porttitor turpis. In eu risus enim. In vitae mollis elit.</li>
                    <li>Vivamus finibus vel mauris ut vehicula.</li>
                    <li>Nullam a magna porttitor, dictum risus nec, faucibus sapien.</li>
                  </ul>
                  <p>
                    Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis.
                    Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula
                    vulputate sem tristique cursus.
                  </p>
                </div>
              </div>

              <div className="tab-pane fade" id="product-info-tab" role="tabpanel" aria-labelledby="product-info-link">
                <div className="product-desc-content">
                  <h3>Information</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque
                    volutpat mattis eros. Nullam malesuada erat ut turpis.
                  </p>
                  <h3>Fabric &amp; care</h3>
                  <ul>
                    <li>Faux suede fabric</li>
                    <li>Gold tone metal hoop handles.</li>
                    <li>RI branding</li>
                    <li>Snake print trim interior</li>
                    <li>Adjustable cross body strap</li>
                    <li>Height: 31cm; Width: 32cm; Depth: 12cm; Handle Drop: 61cm</li>
                  </ul>
                  <h3>Size</h3>
                  <p>one size</p>
                </div>
              </div>

              <div className="tab-pane fade" id="product-shipping-tab" role="tabpanel" aria-labelledby="product-shipping-link">
                <div className="product-desc-content">
                  <h3>Delivery &amp; returns</h3>
                  <p>
                    We deliver to over 100 countries around the world. For full details of the
                    delivery options we offer, please view our <a href="#">Delivery information</a>
                    <br />
                    We hope you&apos;ll love every purchase, but if you ever need to return an item you
                    can do so within a month of receipt. For full details of how to make a return,
                    please view our <a href="#">Returns information</a>
                  </p>
                </div>
              </div>

              <div className="tab-pane fade" id="product-review-tab" role="tabpanel" aria-labelledby="product-review-link">
                <div className="reviews">
                  <h3>Reviews (2)</h3>
                  <div className="review">
                    <div className="row no-gutters">
                      <div className="col-auto">
                        <h4>
                          <a href="#">Samanta J.</a>
                        </h4>
                        <div className="ratings-container">
                          <div className="ratings">
                            <div className="ratings-val" style={{ width: "80%" }}></div>
                          </div>
                        </div>
                        <span className="review-date">6 days ago</span>
                      </div>
                      <div className="col">
                        <h4>Good, perfect size</h4>
                        <div className="review-content">
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ducimus cum
                            dolores assumenda asperiores facilis porro reprehenderit animi culpa.
                          </p>
                        </div>
                        <div className="review-action">
                          <a href="#">
                            <i className="icon-thumbs-up"></i>Helpful (2)
                          </a>
                          <a href="#">
                            <i className="icon-thumbs-down"></i>Unhelpful (0)
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="review">
                    <div className="row no-gutters">
                      <div className="col-auto">
                        <h4>
                          <a href="#">John Doe</a>
                        </h4>
                        <div className="ratings-container">
                          <div className="ratings">
                            <div className="ratings-val" style={{ width: "100%" }}></div>
                          </div>
                        </div>
                        <span className="review-date">5 days ago</span>
                      </div>
                      <div className="col">
                        <h4>Very good</h4>
                        <div className="review-content">
                          <p>
                            Sed, molestias, tempore? Ex dolor esse iure hic veniam laborum blanditiis
                            laudantium iste amet. Cum non voluptate eos enim.
                          </p>
                        </div>
                        <div className="review-action">
                          <a href="#">
                            <i className="icon-thumbs-up"></i>Helpful (0)
                          </a>
                          <a href="#">
                            <i className="icon-thumbs-down"></i>Unhelpful (0)
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="title text-center mb-4">You May Also Like</h2>

          <div
            className="owl-carousel owl-simple carousel-equal-height carousel-with-shadow"
            data-toggle="owl"
            data-owl-options='{"nav":false,"dots":true,"margin":20,"loop":false,"responsive":{"0":{"items":1},"480":{"items":2},"768":{"items":3},"992":{"items":4},"1200":{"items":4,"nav":true,"dots":false}}}'
          >
            {relatedProducts.map((product) => (
              <div className="product product-7 text-center" key={product.title}>
                <figure className="product-media">
                  {product.label ? (
                    <span className={`product-label ${product.labelClass}`}>{product.label}</span>
                  ) : null}
                  <a href="/product">
                    <img src={product.image} alt="Product image" className="product-image" />
                  </a>

                  <div className="product-action-vertical">
                    <a href="#" className="btn-product-icon btn-wishlist btn-expandable">
                      <span>add to wishlist</span>
                    </a>
                    <a href="#" className="btn-product-icon btn-quickview" title="Quick view">
                      <span>Quick view</span>
                    </a>
                    <a href="#" className="btn-product-icon btn-compare" title="Compare">
                      <span>Compare</span>
                    </a>
                  </div>

                  <div className="product-action">
                    <a href="#" className="btn-product btn-cart">
                      <span>add to cart</span>
                    </a>
                  </div>
                </figure>

                <div className="product-body">
                  <div className="product-cat">
                    <a href="#">{product.category}</a>
                  </div>
                  <h3 className="product-title">
                    <a href="/product">{product.title}</a>
                  </h3>
                  <div className="product-price">
                    {product.priceClass ? (
                      <span className={product.priceClass}>{product.price}</span>
                    ) : (
                      product.price
                    )}
                  </div>
                  <div className="ratings-container">
                    <div className="ratings">
                      <div className="ratings-val" style={{ width: product.rating }}></div>
                    </div>
                    <span className="ratings-text">{product.reviews}</span>
                  </div>

                  {product.thumbs ? (
                    <div className="product-nav product-nav-thumbs">
                      {product.thumbs.map((thumb, index) => (
                        <a href="#" className={index === 0 ? "active" : ""} key={thumb}>
                          <img src={thumb} alt="product desc" />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
