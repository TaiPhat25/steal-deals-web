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
                <img
                  src="/assets/images/demos/demo-26/logo-footer.png"
                  className="footer-logo"
                  alt="Footer Logo"
                  width="105"
                  height="25"
                />
                <p className="font-weight-light second-primary-color text-light">
                  Praesent dapibus, neque id cursus ucibus, tortor neque egestas augue,
                  eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi,
                  tincidunt quis, accumsan porttitor, facilisis luctus, metus.
                </p>

                <div className="widget-about-info">
                  <div className="row">
                    <div className="col-sm-6 col-md-4">
                      <span className="widget-about-title text-white">
                        Got Question? Call us 24/7
                      </span>
                      <a href="tel:123456789" className="text-primary">
                        +0123 456 789
                      </a>
                    </div>
                    <div className="col-sm-6 col-md-8">
                      <span className="pl-3 widget-about-title text-white">
                        Payment Method
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
                    <a href="/about">About Molla</a>
                  </li>
                  <li>
                    <a href="#">How to shop on Molla</a>
                  </li>
                  <li>
                    <a href="faq.html">FAQ</a>
                  </li>
                  <li>
                    <a href="contact.html">Contact us</a>
                  </li>
                  <li>
                    <a href="/login#signin-2">Log in</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-sm-4 col-lg-5cols">
              <div className="widget mb-4">
                <h4 className="widget-title text-white">Customer Service</h4>

                <ul className="widget-list">
                  <li>
                    <a href="#">Payment Methods</a>
                  </li>
                  <li>
                    <a href="#">Money-back guarantee!</a>
                  </li>
                  <li>
                    <a href="#">Returns</a>
                  </li>
                  <li>
                    <a href="#">Shipping</a>
                  </li>
                  <li>
                    <a href="#">Terms and conditions</a>
                  </li>
                  <li>
                    <a href="#">Privacy Policy</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-sm-4 col-lg-5cols">
              <div className="widget mb-4">
                <h4 className="widget-title text-white">My Account</h4>

                <ul className="widget-list">
                  <li>
                    <a href="/login#signin-2">Sign In</a>
                  </li>
                  <li>
                    <a href="cart.html">View Cart</a>
                  </li>
                  <li>
                    <a href="#">My Wishlist</a>
                  </li>
                  <li>
                    <a href="#">Track My Order</a>
                  </li>
                  <li>
                    <a href="#">Help</a>
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
            Copyright © 2020 Molla Store. All Rights Reserved.
          </p>
          <ul className="footer-menu justify-content-center">
            <li>
              <a href="#">Terms Of Use</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
          </ul>

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
          </div>
        </div>
      </div>
    </footer>
  );
}
