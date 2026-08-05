import Image from "next/image";
import Link from "next/link";

const principles = [
  {
    number: "01",
    title: "Rescue good food",
    description: "We help stores offer quality surplus food to people nearby before it goes to waste.",
  },
  {
    number: "02",
    title: "Make savings accessible",
    description: "Buyers discover affordable food from local stores with clear prices and pickup times.",
  },
  {
    number: "03",
    title: "Strengthen local trade",
    description: "Every pickup gives local businesses another way to recover value and meet new customers.",
  },
];

export default function AboutMain() {
  return (
    <main className="main info-page about-page">
      <section className="info-page__hero info-page__hero--image">
        <Image
          src="/assets/images/demos/demo-28/intro-slider/1.jpg"
          alt="Fresh surplus food ready for a local pickup"
          fill
          priority
          sizes="100vw"
        />
        <div className="info-page__hero-overlay"></div>
        <div className="container info-page__hero-content">
          <p className="info-page__eyebrow">About StealDeals</p>
          <h1>Good food deserves another chance</h1>
          <p>We connect local stores with buyers who want affordable food and a more responsible way to shop.</p>
        </div>
      </section>

      <nav aria-label="Breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item active" aria-current="page">About us</li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <section className="about-page__intro container">
          <div>
            <p className="info-page__eyebrow">Our purpose</p>
            <h2>A simpler way to rescue surplus food</h2>
            <p>
              StealDeals is a food rescue marketplace for local stores and nearby buyers. Stores list
              surprise bags from their daily surplus, and buyers reserve them for pickup at a lower price.
            </p>
            <p>
              The contents may be a surprise, but the important details are clear: what category the bag
              belongs to, how much it costs, when it can be collected, and how many are available.
            </p>
            <Link href="/products" className="btn btn-primary">
              Browse surprise bags
              <i className="icon-long-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>
          <figure className="about-page__intro-image">
            <Image
              src="/assets/images/demos/demo-28/blog/1.jpg"
              alt="A shared meal made with fresh food"
              width={720}
              height={520}
              sizes="(max-width: 991px) 100vw, 50vw"
            />
          </figure>
        </section>

        <section className="about-page__principles" aria-labelledby="principles-title">
          <div className="container">
            <div className="about-page__section-heading">
              <p className="info-page__eyebrow">What guides us</p>
              <h2 id="principles-title">Better for buyers, stores, and communities</h2>
            </div>
            <div className="about-page__principle-grid">
              {principles.map((principle) => (
                <article className="about-page__principle" key={principle.number}>
                  <span>{principle.number}</span>
                  <h3>{principle.title}</h3>
                  <p>{principle.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-page__steps container" aria-labelledby="steps-title">
          <div className="about-page__steps-image">
            <Image
              src="/assets/images/demos/demo-28/blog/2.jpg"
              alt="Fresh baked food prepared for customers"
              width={720}
              height={520}
              sizes="(max-width: 991px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="info-page__eyebrow">How it works</p>
            <h2 id="steps-title">From surplus to pickup in three steps</h2>
            <ol className="about-page__step-list">
              <li><strong>Find a bag.</strong> Browse nearby stores and filter by food category, pickup time, or price.</li>
              <li><strong>Reserve your order.</strong> Choose the quantity you want and complete checkout.</li>
              <li><strong>Collect locally.</strong> Bring your order confirmation and pick up during the displayed window.</li>
            </ol>
          </div>
        </section>

        <section className="info-page__cta container" aria-labelledby="about-cta-title">
          <div>
            <p className="info-page__eyebrow">Join the movement</p>
            <h2 id="about-cta-title">Small pickups can make a real difference</h2>
            <p>Discover a nearby bag or learn how your store can take part.</p>
          </div>
          <div className="about-page__cta-actions">
            <Link href="/products" className="btn btn-primary">Find food</Link>
            <Link href="/contact" className="btn btn-outline-primary-2">Contact us</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
