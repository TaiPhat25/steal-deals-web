import Link from "next/link";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqGroup = {
  title: string;
  description: string;
  items: FaqItem[];
};

const faqGroups: FaqGroup[] = [
  {
    title: "Rescuing food",
    description: "Everything you need to know before reserving a surprise bag.",
    items: [
      { question: "What is a surprise bag?", answer: "A surprise bag contains good surplus food from a local store. The exact contents vary by day, but the store always provides the bag details, price, and pickup window before you reserve it." },
      { question: "Why are the bags discounted?", answer: "Stores use StealDeals to recover value from food that may otherwise go unsold. The discount gives you a better price while helping reduce avoidable food waste." },
      { question: "Can I choose the exact items inside?", answer: "No. Surprise bags are based on the store's available surplus, so the contents are intentionally flexible. You can review the store, category, pickup window, and availability before ordering." },
    ],
  },
  {
    title: "Pickup and orders",
    description: "How to reserve, collect, and get help with your order.",
    items: [
      { question: "How does pickup work?", answer: "Choose a bag, complete checkout, and bring your order confirmation to the store during the displayed pickup window. The store will prepare your reserved bag for collection." },
      { question: "What happens if I arrive late?", answer: "Pickup availability depends on the store and the food's freshness. Contact the store as soon as possible if you expect to miss the window so they can advise you on the next step." },
      { question: "Can I cancel or change my order?", answer: "Cancellation and change options depend on the order status and store policy. Check your order details first, then contact support if you need help with a specific pickup." },
    ],
  },
  {
    title: "Payments and account",
    description: "Answers about signing in, payment, and account access.",
    items: [
      { question: "Which payment methods are supported?", answer: "Available payment methods are shown during checkout. The final options may depend on the payment service and the order configuration." },
      { question: "Do I need an account to order?", answer: "You need to sign in before checkout so your order and pickup information can be associated with your account." },
      { question: "How do I verify my email?", answer: "After registration, enter the one-time code sent to your email. You can also start email verification later from your Profile page." },
    ],
  },
];

export default function FaqMain() {
  return (
    <main className="main info-page faq-page">
      <section className="info-page__hero info-page__hero--faq">
        <div className="container">
          <p className="info-page__eyebrow">Need a hand?</p>
          <h1>Frequently asked questions</h1>
          <p>Find clear answers about surprise bags, pickup, orders, and your StealDeals account.</p>
        </div>
      </section>

      <nav aria-label="Breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item active" aria-current="page">FAQ</li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <div className="faq-page__intro">
            <p className="info-page__eyebrow">Food rescue made simple</p>
            <h2>What can we help you with?</h2>
            <p>Browse the topics below or contact our team when you need help with a specific order.</p>
          </div>

          <div className="faq-page__groups">
            {faqGroups.map((group) => (
              <section className="faq-page__group" key={group.title} aria-labelledby={`${group.title}-title`}>
                <div className="faq-page__group-heading">
                  <h2 id={`${group.title}-title`}>{group.title}</h2>
                  <p>{group.description}</p>
                </div>
                <div className="faq-page__list">
                  {group.items.map((item, index) => (
                    <details className="faq-page__item" key={item.question} open={index === 0}>
                      <summary>{item.question}</summary>
                      <p>{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="info-page__cta" aria-labelledby="faq-cta-title">
            <div>
              <p className="info-page__eyebrow">Still need help?</p>
              <h2 id="faq-cta-title">Talk to the StealDeals team</h2>
              <p>We can help you understand a pickup, account, or order question.</p>
            </div>
            <Link href="/contact" className="btn btn-primary">
              Contact us
              <i className="icon-long-arrow-right" aria-hidden="true"></i>
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
