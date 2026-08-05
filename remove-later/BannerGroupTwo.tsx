export default function BannerGroupTwo() {
  return (
    <div className="banner-group-2 mb-4">
      <div className="container">
        <div className="row row-sm">
          <div className="col-md-6">
            <div
              className="banner bg-image d-flex align-items-center"
              style={{ backgroundImage: "url(/assets/images/demos/demo-28/banners/5.jpg)" }}
            >
              <div className="banner-content">
                <h4 className="banner-subtitle mb-1 mt-0 text-light font-weight-normal">
                  Fresh Fruit
                </h4>
                <h3 className="banner-title font-weight-bold">
                  Organic Fresh Drinks<br />
                  Get <span className="text-primary">25% Off</span> on Your Order
                </h3>
                <a href="#" className="banner-link text-decoration-none">
                  Shop Now<i className="icon-angle-right"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div
              className="banner bg-image d-flex align-items-center"
              style={{ backgroundImage: "url(/assets/images/demos/demo-28/banners/6.jpg)" }}
            >
              <div className="banner-content">
                <h4 className="banner-subtitle mb-1 mt-0 text-light font-weight-normal">
                  Fresh Fruit
                </h4>
                <h3 className="banner-title font-weight-bold">
                  All Natural Large Box<br />
                  From <span className="text-primary">$29.99</span>
                </h3>
                <a href="#" className="banner-link text-decoration-none">
                  Shop Now<i className="icon-angle-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
