import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="footer footer-2 font-weight-normal second-primary-color"
      style={{ backgroundColor: "#222" }}
    >
      <div className="footer-middle border-0">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-2-5cols">
              <div className="widget widget-about mb-4">
                {/*
                <img
                  src="/assets/images/demos/demo-26/logo-footer.png"
                  className="footer-logo"
                  alt="Footer Logo"
                  width="105"
                  height="25"
                />
                */}
                <Link
                  href="/"
                  className="footer-logo"
                  style={{
                    display: "inline-block",
                    color: "#22a642",
                    fontSize: "2.6rem",
                    fontWeight: 700,
                    lineHeight: 1,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Steal Deals
                </Link>
                <p className="font-weight-light second-primary-color text-light">
                  StealDeals connects local stores with buyers who want affordable food
                  while helping good surplus food stay in the community.
                </p>

                <div className="widget-about-info">
                  <div className="row">
                    <div className="col-sm-6 col-md-4">
                      <span className="widget-about-title text-white">
                        Pickup support
                      </span>
                      <span className="text-primary">
                        Check pickup details on each bag
                      </span>
                    </div>
                    <div className="col-sm-6 col-md-8">
                      <span className="pl-3 widget-about-title text-white">
                        Checkout options
                      </span>
                      <figure className="pl-3 mb-0 footer-payments">
                        <img
                          src="/assets/images/payments.png"
                          alt="Payment methods"
                          width="272"
                          height="20"
                        />
                      </figure>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-4 col-lg-5cols">
              <div className="widget mb-4">
                <h4 className="widget-title text-white">Information</h4>

                <ul className="widget-list">
                  <li>
                    <a href="/about">About Steal Deals</a>
                  </li>
                  <li>
                    <a href="/faq">How to rescue a bag</a>
                  </li>
                  <li>
                    <a href="/faq">FAQ</a>
                  </li>
                  <li>
                    <a href="/contact">Contact us</a>
                  </li>
                  <li>
                    <a href="/register">Join StealDeals</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-sm-4 col-lg-5cols">
              <div className="widget mb-4">
                <h4 className="widget-title text-white">Customer Service</h4>

                <ul className="widget-list">
                  <li>
                    <a href="/checkout">Payment methods</a>
                  </li>
                  <li>
                    <a href="/faq">Pickup and order help</a>
                  </li>
                  <li>
                    <a href="/faq">Food rescue guide</a>
                  </li>
                  <li>
                    <a href="/faq">Delivery information</a>
                  </li>
                  <li>
                    <a href="/about">Terms and conditions</a>
                  </li>
                  <li>
                    <a href="/about">Privacy policy</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-sm-4 col-lg-5cols">
              <div className="widget mb-4">
                <h4 className="widget-title text-white">My Account</h4>

                <ul className="widget-list">
                  <li>
                    <a href="/login">Sign In</a>
                  </li>
                  <li>
                    <a href="/cart">View Cart</a>
                  </li>
                  {/* Wishlist is intentionally disabled for near-expiry surprise bags. */}
                  {/*
                  <li>
                    <a href="/wishlist">My Wishlist</a>
                  </li>
                  */}
                  <li>
                    <a href="/checkout">Track my pickup</a>
                  </li>
                  <li>
                    <a href="/contact">Help and contact</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom font-weight-normal">
        <div className="container">
          <p className="footer-copyright font-weight-light text-light">
                Copyright (c) 2026 StealDeals. All Rights Reserved.
          </p>
          <ul className="footer-menu justify-content-center">
            <li>
              <a href="/about">About StealDeals</a>
            </li>
            <li>
              <a href="/contact">Contact us</a>
            </li>
          </ul>

          {/* Social links will be enabled when official StealDeals accounts are available.
          <div className="social-icons social-icons-color justify-content-center">
            <span className="social-label">Social Media</span>
            <a href="#" className="social-icon social-facebook" title="Facebook" target="_blank">
              <i className="icon-facebook-f"></i>
            </a>
            <a href="#" className="social-icon social-twitter" title="Twitter" target="_blank">
              <i className="icon-twitter"></i>
            </a>
            <a href="#" className="social-icon social-instagram" title="Instagram" target="_blank">
              <i className="icon-instagram"></i>
            </a>
            <a href="#" className="social-icon social-youtube" title="Youtube" target="_blank">
              <i className="icon-youtube"></i>
            </a>
            <a href="#" className="social-icon social-pinterest" title="Pinterest" target="_blank">
              <i className="icon-pinterest"></i>
            </a>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
