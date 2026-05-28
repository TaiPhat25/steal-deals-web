export default function IconBoxesGroup() {
  return (
    <div className="icon-boxes-group">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-6">
            <div className="icon-box d-flex align-items-center align-items-md-start mt-3 flex-column flex-md-row text-center text-md-left">
              <figure className="m-0">
                <i aria-hidden="true" className="icon icon-truck text-dark d-inline-flex"></i>
              </figure>
              <div className="icon-box-content">
                <div className="icon-title letter-spacing-normal text-dark">
                  Payment &amp; Delivery
                </div>
                <p className="text-light font-weight-normal">
                  Free shipping for orders over $50
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="icon-box d-flex align-items-center align-items-md-start mt-3 flex-column flex-md-row text-center text-md-left">
              <figure className="m-0">
                <img
                  src="/assets/images/demos/demo-28/social-icons/return.jpg"
                  alt="Return"
                />
              </figure>
              <div className="icon-box-content">
                <div className="icon-title letter-spacing-normal text-dark">
                  Return &amp; Refund
                </div>
                <p className="text-light font-weight-normal">
                  Free 100% money back guarantee
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="icon-box d-flex align-items-center align-items-md-start mt-3 flex-column flex-md-row text-center text-md-left">
              <figure className="m-0">
                <img
                  src="/assets/images/demos/demo-28/social-icons/quality.jpg"
                  alt="Quality support"
                />
              </figure>
              <div className="icon-box-content">
                <div className="icon-title letter-spacing-normal text-dark">
                  Quality Support
                </div>
                <p className="text-light font-weight-normal">
                  Alway online feedback 24/7
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="icon-box d-flex align-items-center align-items-md-start mt-3 flex-column flex-md-row text-center text-md-left">
              <figure className="m-0">
                <img
                  src="/assets/images/demos/demo-28/social-icons/newsletter.jpg"
                  alt="Newsletter"
                />
              </figure>
              <div className="icon-box-content">
                <div className="icon-title letter-spacing-normal text-dark">
                  Join Our Newsletter
                </div>
                <p className="text-light font-weight-normal">
                  10% off by subscribing to our newsletter
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
