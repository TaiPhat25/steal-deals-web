import Link from "next/link";

export default function StealDealsBannerGroupTwo() {
  return (
    <section className="banner-group-2 mb-4" aria-label="StealDeals guides">
      <div className="container">
        <div className="row row-sm">
          <div className="col-md-6">
            <div className="banner bg-image d-flex align-items-center" style={{ backgroundImage: "url(/assets/images/demos/demo-28/banners/5.jpg)" }}>
              <div className="banner-content">
                <h4 className="banner-subtitle mb-1 mt-0 text-light font-weight-normal">Simple pickup</h4>
                <h3 className="banner-title font-weight-bold">Choose a nearby bag<br />and collect it today</h3>
                <Link href="/category?sort=distance" className="banner-link text-decoration-none">
                  Find nearby bags<i className="icon-angle-right"></i>
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="banner bg-image d-flex align-items-center" style={{ backgroundImage: "url(/assets/images/demos/demo-28/banners/6.jpg)" }}>
              <div className="banner-content">
                <h4 className="banner-subtitle mb-1 mt-0 text-light font-weight-normal">Support local stores</h4>
                <h3 className="banner-title font-weight-bold">Discover new sellers<br />joining StealDeals</h3>
                <Link href="/category?sort=new-stores" className="banner-link text-decoration-none">
                  Meet new stores<i className="icon-angle-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
