import CountdownTimer from "../CountdownTimer";
import DragScrollRow from "../DragScrollRow";

export default function FlashSection() {
  return (
    <div className="flash-section bg-lighter">
      <div className="container">
        <div className="heading d-flex flex-column flex-md-row">
          <h2 className="title align-self-center letter-spacing-normal text-center text-md-left">
            Today Flash Sales
          </h2>
          <div className="d-flex justify-content-center mt-1 mt-md-0">
            <h6 className="countdown-title align-self-center mb-0 font-weight-normal letter-spacing-normal">
              Ends in:
            </h6>
            <CountdownTimer
              hours={10}
              className="deal-countdown align-self-center"
              compact
            />
          </div>
        </div>
        <div className="flash-content mt-2 py-2 pb-7">
          <DragScrollRow className="drag-scroll-row drag-scroll-row--products">
            <div className="product mb-0 rounded-0 w-100">
              <figure className="product-media bg-white ">
                <a href="#">
                  <img
                    src="/assets/images/demos/demo-28/flash/1.jpg"
                    width="192"
                    height="192"
                    alt="Broccoli"
                  />
                </a>
                <a
                  href="#"
                  className="btn-product-zoom btn-quickview"
                  data-product-id="260"
                  title="Quick view"
                >
                  <span>Quick view</span>
                </a>
              </figure>
              <div className="product-body position-static bg-transparent">
                <div className="product-cat overflow-hidden my-2 mt-0 font-weight-normal">
                  <a href="#">Vegetables</a>
                </div>
                <a href="#">
                  <h3 className="product-title overflow-hidden letter-spacing-normal">
                    Broccoli (Each)
                  </h3>
                </a>
                <div className="product-price font-weight-bold align-items-center d-flex mb-0">
                  $1.59
                </div>
                <div className="product-sold position-absolute">
                  <div className="product-sold-val" style={{ width: "50%" }}></div>
                </div>
                <span className="sold-text font-weight-normal text-light position-absolute">
                  Sold: 54
                </span>
                <div className="product-footer bg-white rounded-0 d-block position-absolute">
                  <div className="ratings-container text-truncate">
                    <div className="ratings">
                      <div className="ratings-val" style={{ width: "40%" }}></div>
                      <a href="product.html" className="ratings-text font-weight-normal">
                        (5 reviews)
                      </a>
                    </div>
                  </div>
                  <div className="product-action d-flex justify-content-center flex-column align-items-center position-relative">
                    <a
                      href="#"
                      className="btn btn-product font-weight-normal text-uppercase text-truncate btn-cart btn-outline-primary-2 btn-outline-primary-2"
                    >
                      <span>Add To Cart</span>
                    </a>
                    <a href="#" className="wishlist-link-product px-3 ml-0 font-weight-normal mt-1">
                      <i className="icon-heart-o"></i>
                      <span>Add to wishlist</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="product mb-0 rounded-0 w-100">
              <figure className="product-media bg-white ">
                <a href="#">
                  <img
                    src="/assets/images/demos/demo-28/flash/2.jpg"
                    width="192"
                    height="192"
                    alt="Rye Bread"
                  />
                </a>
                <a
                  href="#"
                  className="btn-product-zoom btn-quickview"
                  data-product-id="260"
                  title="Quick view"
                >
                  <span>Quick view</span>
                </a>
              </figure>
              <div className="product-body position-static bg-transparent">
                <div className="product-cat overflow-hidden my-2 mt-0 font-weight-normal">
                  <a href="#">Bakery</a>
                </div>
                <a href="#">
                  <h3 className="product-title overflow-hidden letter-spacing-normal">
                    Rye Bread (800g)
                  </h3>
                </a>
                <div className="product-price font-weight-bold align-items-center d-flex mb-0">
                  $3.99
                </div>
                <div className="product-sold position-absolute">
                  <div className="product-sold-val" style={{ width: "55%" }}></div>
                </div>
                <span className="sold-text font-weight-normal text-light position-absolute">
                  Sold: 31
                </span>
                <div className="product-footer bg-white rounded-0 d-block position-absolute">
                  <div className="ratings-container text-truncate">
                    <div className="ratings">
                      <div className="ratings-val" style={{ width: "40%" }}></div>
                      <a href="product.html" className="ratings-text font-weight-normal">
                        (10 reviews)
                      </a>
                    </div>
                  </div>
                  <div className="product-action d-flex justify-content-center flex-column align-items-center position-relative">
                    <a
                      href="#"
                      className="btn btn-product font-weight-normal text-uppercase text-truncate btn-cart btn-outline-primary-2 btn-outline-primary-2"
                    >
                      <span>Add To Cart</span>
                    </a>
                    <a href="#" className="wishlist-link-product px-3 ml-0 font-weight-normal mt-1">
                      <i className="icon-heart-o"></i>
                      <span>Add to wishlist</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="product mb-0 rounded-0 w-100">
              <figure className="product-media bg-white ">
                <a href="#">
                  <span className="product-label label-top">Top</span>
                  <span className="product-label label-sale">Save: 30%</span>
                  <img
                    src="/assets/images/demos/demo-28/flash/3.jpg"
                    width="192"
                    height="192"
                    alt="Shrimp"
                  />
                </a>
                <a
                  href="#"
                  className="btn-product-zoom btn-quickview"
                  data-product-id="260"
                  title="Quick view"
                >
                  <span>Quick view</span>
                </a>
                <div className="product-labels"></div>
              </figure>
              <div className="product-body position-static bg-transparent">
                <div className="product-cat overflow-hidden my-2 mt-0 font-weight-normal">
                  <a href="#">Seafood</a>
                </div>
                <a href="#">
                  <h3 className="product-title overflow-hidden letter-spacing-normal">
                    Shrimp - Jumbo (5 lb)
                  </h3>
                </a>
                <div className="product-price font-weight-bold align-items-center d-flex mb-0">
                  <h4 className="new-price font-weight-bold mb-0">$35.80</h4>
                  <h4 className="old-price font-weight-normal mb-0">$42.90</h4>
                </div>
                <div className="product-sold position-absolute">
                  <div className="product-sold-val" style={{ width: "22%" }}></div>
                </div>
                <span className="sold-text font-weight-normal text-light position-absolute">
                  Sold: 10
                </span>
                <div className="product-footer bg-white rounded-0 d-block position-absolute">
                  <div className="ratings-container text-truncate">
                    <div className="ratings">
                      <div className="ratings-val" style={{ width: "20%" }}></div>
                      <a href="product.html" className="ratings-text font-weight-normal">
                        (2 reviews)
                      </a>
                    </div>
                  </div>
                  <div className="product-action d-flex justify-content-center flex-column align-items-center position-relative">
                    <a
                      href="#"
                      className="btn btn-product font-weight-normal text-uppercase text-truncate btn-cart btn-outline-primary-2 btn-outline-primary-2"
                    >
                      <span>Add To Cart</span>
                    </a>
                    <a href="#" className="wishlist-link-product px-3 ml-0 font-weight-normal mt-1">
                      <i className="icon-heart-o"></i>
                      <span>Add to wishlist</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="product mb-0 rounded-0 w-100">
              <figure className="product-media bg-white ">
                <a href="#">
                  <img
                    src="/assets/images/demos/demo-28/flash/4.jpg"
                    width="192"
                    height="192"
                    alt="Tomato"
                  />
                </a>
                <a
                  href="#"
                  className="btn-product-zoom btn-quickview"
                  data-product-id="260"
                  title="Quick view"
                >
                  <span>Quick view</span>
                </a>
              </figure>
              <div className="product-body position-static bg-transparent">
                <div className="product-cat overflow-hidden my-2 mt-0 font-weight-normal">
                  <a href="#">Vegetables</a>
                </div>
                <a href="#">
                  <h3 className="product-title overflow-hidden letter-spacing-normal">
                    Tomato (Each)
                  </h3>
                </a>
                <div className="product-price font-weight-bold align-items-center d-flex mb-0">
                  $0.59
                </div>
                <div className="product-sold position-absolute">
                  <div className="product-sold-val" style={{ width: "75%" }}></div>
                </div>
                <span className="sold-text font-weight-normal text-light position-absolute">
                  Sold: 52
                </span>
                <div className="product-footer bg-white rounded-0 d-block position-absolute">
                  <div className="ratings-container text-truncate">
                    <div className="ratings">
                      <div className="ratings-val" style={{ width: "20%" }}></div>
                      <a href="product.html" className="ratings-text font-weight-normal">
                        (2 reviews)
                      </a>
                    </div>
                  </div>
                  <div className="product-action d-flex justify-content-center flex-column align-items-center position-relative">
                    <a
                      href="#"
                      className="btn btn-product font-weight-normal text-uppercase text-truncate btn-cart btn-outline-primary-2 btn-outline-primary-2"
                    >
                      <span>Add To Cart</span>
                    </a>
                    <a href="#" className="wishlist-link-product px-3 ml-0 font-weight-normal mt-1">
                      <i className="icon-heart-o"></i>
                      <span>Add to wishlist</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="product mb-0 rounded-0 w-100">
              <figure className="product-media bg-white ">
                <a href="#">
                  <img
                    src="/assets/images/demos/demo-28/flash/5.jpg"
                    width="192"
                    height="192"
                    alt="Coconut"
                  />
                </a>
                <a
                  href="#"
                  className="btn-product-zoom btn-quickview"
                  data-product-id="260"
                  title="Quick view"
                >
                  <span>Quick view</span>
                </a>
                <div className="product-label label-sale">Save: 30%</div>
              </figure>
              <div className="product-body position-static bg-transparent">
                <div className="product-cat overflow-hidden my-2 mt-0 font-weight-normal">
                  <a href="#">Vegetables</a>
                </div>
                <a href="#">
                  <h3 className="product-title overflow-hidden letter-spacing-normal">
                    Coconut ripe and tasty (Each)
                  </h3>
                </a>
                <div className="product-price font-weight-bold align-items-center d-flex mb-0">
                  <h4 className="new-price font-weight-bold mb-0">$3.59</h4>
                  <h4 className="old-price font-weight-normal mb-0">$42.90</h4>
                </div>
                <div className="product-sold position-absolute">
                  <div className="product-sold-val" style={{ width: "55%" }}></div>
                </div>
                <span className="sold-text font-weight-normal text-light position-absolute">
                  Sold: 31
                </span>
                <div className="product-footer bg-white rounded-0 d-block position-absolute">
                  <div className="ratings-container text-truncate">
                    <div className="ratings">
                      <div className="ratings-val" style={{ width: "20%" }}></div>
                      <a href="product.html" className="ratings-text font-weight-normal">
                        (2 reviews)
                      </a>
                    </div>
                  </div>
                  <div className="product-action d-flex justify-content-center flex-column align-items-center position-relative">
                    <a
                      href="#"
                      className="btn btn-product font-weight-normal text-uppercase text-truncate btn-cart btn-outline-primary-2 btn-outline-primary-2"
                    >
                      <span>Add To Cart</span>
                    </a>
                    <a href="#" className="wishlist-link-product px-3 ml-0 font-weight-normal mt-1">
                      <i className="icon-heart-o"></i>
                      <span>Add to wishlist</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="product mb-0 rounded-0 w-100">
              <figure className="product-media bg-white ">
                <a href="#">
                  <img
                    src="/assets/images/demos/demo-28/flash/6.jpg"
                    width="192"
                    height="192"
                    alt="Almonds"
                  />
                </a>
                <a
                  href="#"
                  className="btn-product-zoom btn-quickview"
                  data-product-id="260"
                  title="Quick view"
                >
                  <span>Quick view</span>
                </a>
              </figure>
              <div className="product-body position-static bg-transparent">
                <div className="product-cat overflow-hidden my-2 mt-0 font-weight-normal">
                  <a href="#">Vegetables</a>
                </div>
                <a href="#">
                  <h3 className="product-title overflow-hidden letter-spacing-normal">
                    Almonds (240g)
                  </h3>
                </a>
                <div className="product-price font-weight-bold align-items-center d-flex mb-0">
                  $8.59
                </div>
                <div className="product-sold position-absolute">
                  <div className="product-sold-val" style={{ width: "45%" }}></div>
                </div>
                <span className="sold-text font-weight-normal text-light position-absolute">
                  Sold: 24
                </span>
                <div className="product-footer bg-white rounded-0 d-block position-absolute">
                  <div className="ratings-container text-truncate">
                    <div className="ratings">
                      <div className="ratings-val" style={{ width: "20%" }}></div>
                      <a href="product.html" className="ratings-text font-weight-normal">
                        (2 reviews)
                      </a>
                    </div>
                  </div>
                  <div className="product-action d-flex justify-content-center flex-column align-items-center position-relative">
                    <a
                      href="#"
                      className="btn btn-product font-weight-normal text-uppercase text-truncate btn-cart btn-outline-primary-2 btn-outline-primary-2"
                    >
                      <span>Add To Cart</span>
                    </a>
                    <a href="#" className="wishlist-link-product px-3 ml-0 font-weight-normal mt-1">
                      <i className="icon-heart-o"></i>
                      <span>Add to wishlist</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="product mb-0 rounded-0 w-100">
              <figure className="product-media bg-white ">
                <a href="#">
                  <img
                    src="/assets/images/demos/demo-28/flash/6.jpg"
                    width="192"
                    height="192"
                    alt="Almonds"
                  />
                </a>
                <a
                  href="#"
                  className="btn-product-zoom btn-quickview"
                  data-product-id="260"
                  title="Quick view"
                >
                  <span>Quick view</span>
                </a>
              </figure>
              <div className="product-body position-static bg-transparent">
                <div className="product-cat overflow-hidden my-2 mt-0 font-weight-normal">
                  <a href="#">Vegetables</a>
                </div>
                <a href="#">
                  <h3 className="product-title overflow-hidden letter-spacing-normal">
                    Almonds (240g)
                  </h3>
                </a>
                <div className="product-price font-weight-bold align-items-center d-flex mb-0">
                  $8.59
                </div>
                <div className="product-sold position-absolute">
                  <div className="product-sold-val" style={{ width: "45%" }}></div>
                </div>
                <span className="sold-text font-weight-normal text-light position-absolute">
                  Sold: 24
                </span>
                <div className="product-footer bg-white rounded-0 d-block position-absolute">
                  <div className="ratings-container text-truncate">
                    <div className="ratings">
                      <div className="ratings-val" style={{ width: "20%" }}></div>
                      <a href="product.html" className="ratings-text font-weight-normal">
                        (2 reviews)
                      </a>
                    </div>
                  </div>
                  <div className="product-action d-flex justify-content-center flex-column align-items-center position-relative">
                    <a
                      href="#"
                      className="btn btn-product font-weight-normal text-uppercase text-truncate btn-cart btn-outline-primary-2 btn-outline-primary-2"
                    >
                      <span>Add To Cart</span>
                    </a>
                    <a href="#" className="wishlist-link-product px-3 ml-0 font-weight-normal mt-1">
                      <i className="icon-heart-o"></i>
                      <span>Add to wishlist</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </DragScrollRow>
        </div>
      </div>
    </div>
  );
}
