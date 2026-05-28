export default function BannerGroupOne() {
  return (
    <div className="banner-group-1 mt-1 mb-1">
      <div className="container">
        <div
          className="owl-carousel owl-simple rows cols-1 cols-sm-2 cols-lg-3"
          data-toggle="owl"
          data-owl-options='{"nav": false, "dots": true, "margin": 10, "loop": false, "responsive": {"0": {"items": 1}, "576": {"items": 2}, "992": {"items": 3}}}'
        >
          <div className="banner mb-0">
            <a href="#">
              <img
                src="/assets/images/demos/demo-28/banners/banner-1.jpg"
                width="460"
                height="210"
                alt="Fresh fruit banner"
              />
            </a>
            <div className="banner-content p-3">
              <h5 className="banner-subtitle font-weight-normal text-light mb-1">
                Fresh Fruit
              </h5>
              <h3 className="banner-title font-weight-bold">
                Organic Fresh Fruits<br />
                Get 25% Off
              </h3>
              <a href="#" className="banner-link text-decoration-none">
                Shop Now<i className="icon-angle-right"></i>
              </a>
            </div>
          </div>
          <div className="banner mb-0">
            <a href="#">
              <img
                src="/assets/images/demos/demo-28/banners/banner-2.jpg"
                width="460"
                height="210"
                alt="Super food banner"
              />
            </a>
            <div className="banner-content p-3">
              <h5 className="banner-subtitle font-weight-normal text-light mb-1">
                Our Standards
              </h5>
              <h3 className="banner-title font-weight-bold">
                Super Food Bundle<br />
                From $45.99
              </h3>
              <a href="#" className="banner-link text-decoration-none">
                Shop Now<i className="icon-angle-right"></i>
              </a>
            </div>
          </div>
          <div className="banner mb-0">
            <a href="#">
              <img
                src="/assets/images/demos/demo-28/banners/banner-3.jpg"
                width="460"
                height="210"
                alt="Detox banner"
              />
            </a>
            <div className="banner-content p-3">
              <h5 className="banner-subtitle font-weight-normal text-light mb-1">
                Diet Products
              </h5>
              <h3 className="banner-title font-weight-bold">
                Save Now<br />
                Detox &amp; Diuretics
              </h3>
              <a href="#" className="banner-link text-decoration-none">
                Shop Now<i className="icon-angle-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
