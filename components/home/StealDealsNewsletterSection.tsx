import Link from "next/link";

export default function StealDealsNewsletterSection() {
  return (
    <section className="bg-lighter py-5" aria-labelledby="newsletter-title">
      <div className="container">
        <div className="newsletter-section bg-image d-flex align-items-center justify-content-center pt-2 pb-2 px-3" style={{ backgroundImage: "url(/assets/images/demos/demo-28/banners/4.jpg)" }}>
          <div className="banner-content position-relative pt-0">
            <h3 className="newsletter-title font-weight-bold text-center mb-1">Stay close to local food rescue</h3>
            <h2 id="newsletter-title" className="newsletter-text font-weight-bold text-center my-4 mt-0">Discover new bags and stores on StealDeals</h2>
            <p className="text-light font-weight-normal text-center mb-2">Create an account to keep exploring affordable food and help reduce waste in your community.</p>
            <div className="text-center">
              <Link href="/register" className="btn btn-primary letter-spacing-normal text-uppercase">Join StealDeals</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
