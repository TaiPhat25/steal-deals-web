import Image from "next/image";

const articles = [
  {
    image: "/assets/images/home/food-rescue-packing.webp",
    imageAlt: "Surplus food being packed into a paper rescue bag",
    category: "Food rescue",
    title: "Why rescuing surplus food matters",
    summary:
      "Small pickup decisions can keep good food in the community and out of the waste stream.",
  },
  {
    image: "/assets/images/home/local-bakery-rescue.webp",
    imageAlt: "A bakery owner preparing surplus bread for pickup",
    category: "For stores",
    title: "How surprise bags help local businesses",
    summary:
      "A simple end-of-day listing can recover value while introducing new customers to a store.",
  },
  {
    image: "/assets/images/home/community-food-action.webp",
    imageAlt: "Fresh produce being sorted at an urban community garden",
    category: "Sustainability",
    title: "From food waste to climate action",
    summary:
      "Learn how reducing avoidable waste connects with wider sustainability work, including carbon initiatives.",
  },
  {
    image: "/assets/images/home/local-food-pickup.webp",
    imageAlt: "A customer collecting a food rescue bag from a local shop",
    category: "Community",
    title: "Building a culture of reuse",
    summary:
      "Food rescue works best when buyers, stores, and neighborhoods participate together.",
  },
];

export default function SustainabilityNewsSection() {
  return (
    <section className="sustainability-news-section bg-lighter pt-6 pb-5" aria-labelledby="news-title">
      <div className="container">
        <div className="heading py-2 pb-0">
          <p className="sustainability-news-section__eyebrow">Ideas for a more sustainable community</p>
          <h2 id="news-title" className="title align-self-center letter-spacing-normal text-center text-md-left">Food Rescue &amp; Sustainability</h2>
        </div>
        <div className="row">
          {articles.map((article) => (
            <article key={article.title} className="col-12 col-sm-6 col-lg-3 mb-3 mb-lg-0">
              <div className="sustainability-news-card">
                <div className="sustainability-news-card__media">
                  <Image
                    src={article.image}
                    width={334}
                    height={200}
                    sizes="(max-width: 575px) 100vw, (max-width: 991px) 50vw, 25vw"
                    alt={article.imageAlt}
                  />
                </div>
                <div className="sustainability-news-card__body">
                  <p className="sustainability-news-card__category">{article.category}</p>
                  <h3 className="sustainability-news-card__title">{article.title}</h3>
                  <p className="sustainability-news-card__summary">{article.summary}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
