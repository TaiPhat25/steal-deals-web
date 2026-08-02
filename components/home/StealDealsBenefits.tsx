export default function StealDealsBenefits() {
  const benefits = [
    { icon: "icon-leaf", title: "Rescue good food", description: "Give surplus food a second chance instead of letting it go to waste." },
    { icon: "icon-tag", title: "Affordable surprise bags", description: "Discover quality food at lower prices from local businesses." },
    { icon: "icon-map-marker", title: "Simple local pickup", description: "Find nearby bags and collect them during the store pickup window." },
    { icon: "icon-check", title: "Discover local stores", description: "Support food businesses and find new places in your community." },
  ];

  return (
    <section className="icon-boxes-group" aria-label="Why use StealDeals">
      <div className="container">
        <div className="row">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="col-lg-3 col-md-6">
              <div className="icon-box d-flex align-items-center align-items-md-start mt-3 flex-column flex-md-row text-center text-md-left">
                <figure className="m-0"><i aria-hidden="true" className={`icon ${benefit.icon} text-dark d-inline-flex`}></i></figure>
                <div className="icon-box-content">
                  <div className="icon-title letter-spacing-normal text-dark">{benefit.title}</div>
                  <p className="text-light font-weight-normal">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
