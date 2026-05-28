export default function NewsletterSection() {
  return (
    <div className="container">
      <div
        className="newsletter-section bg-image d-flex align-items-center justify-content-center mb-1 pt-2 pb-2 px-3"
        style={{ backgroundImage: "url(/assets/images/demos/demo-28/banners/4.jpg)" }}
      >
        <div className="banner-content position-relative pt-0">
          <h3 className="newsletter-title font-weight-bold text-center mb-1">
            New Customer Discount
          </h3>
          <h2 className="newsletter-text font-weight-bold text-center my-4 mt-0">
            <span className="text-primary">20% Off </span>Your First Order at Molla
          </h2>
          <p className="text-light font-weight-normal text-center mb-2">
            New customers: <b className="text-dark">Save 20%</b> when you sign up for
            exclusive emails, recipes, expert tips &amp; more...
          </p>
          <form action="#">
            <div className="email-get d-flex justify-content-center flex-column flex-sm-row align-items-center align-items-sm-stretch">
              <input
                type="email"
                name=""
                className="form-control text-light mb-1"
                placeholder="Enter your Email Address"
              />
              <div className="input-group-append">
                <button
                  className="btn btn-primary mb-1 letter-spacing-normal text-uppercase"
                  type="submit"
                  id="newsletter-btn"
                >
                  <span>Subscribe</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
