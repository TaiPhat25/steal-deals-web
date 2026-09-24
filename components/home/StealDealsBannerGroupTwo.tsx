import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export default function StealDealsBannerGroupTwo() {
  return (
    <section className="banner-group-2 mb-4" aria-label={`${BRAND_NAME} guides`}>
      <div className="container">
        <div className="row row-sm">
          <div className="col-md-6">
            <div className="banner bg-image d-flex align-items-center" style={{ backgroundImage: "url(/assets/images/home/campaign-local-pickup.webp)" }}>
              <div className="banner-content">
                <h4 className="banner-subtitle mb-1 mt-0 text-light font-weight-normal">Simple pickup</h4>
                <h3 className="banner-title font-weight-bold">Choose a nearby bag<br />and collect it today</h3>
                <Link href="/products?sort=distance" className="banner-link text-decoration-none">
                  Find nearby bags<i className="icon-angle-right"></i>
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="banner bg-image d-flex align-items-center" style={{ backgroundImage: "url(/assets/images/home/campaign-variety.webp)" }}>
              <div className="banner-content">
                <h4 className="banner-subtitle mb-1 mt-0 text-light font-weight-normal">Support local stores</h4>
                <h3 className="banner-title font-weight-bold">Discover new sellers<br />joining {BRAND_NAME}</h3>
                <Link href="/products?sort=newest" className="banner-link text-decoration-none">
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
