export default function ServiceSection() {
  return (
    <div className="container">
      <div className="service-section py-2 pb-0 mt-6">
        <div
          className="owl-carousel carousel-simple"
          data-toggle="owl"
          data-owl-options='{"nav": false, "loop": false, "dots": false, "margin": 20, "responsive": {"576": {"items": 2}, "972": {"items": 3}}}'
        >
          <div className="icon-box d-flex align-items-center align-items-md-start flex-column flex-md-row text-center text-md-left py-2 pt-0 mb-7">
            <figure className="m-0">
              <img
                src="/assets/images/demos/demo-28/social-icons/icon-apple.jpg"
                alt="Apple icon"
              />
            </figure>
            <div className="icon-box-content">
              <h3 className="icon-title letter-spacing-normal mb-1">
                Always Fresh Products
              </h3>
              <p className="text-light font-weight-light">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio.
                Quisque volutpat mattis eros.
              </p>
            </div>
          </div>
          <div className="icon-box d-flex align-items-center align-items-md-start flex-column flex-md-row text-center text-md-left py-2 pt-0 mb-7">
            <figure className="m-0">
              <img
                src="/assets/images/demos/demo-28/social-icons/icon-leaf.jpg"
                alt="Leaf icon"
              />
            </figure>
            <div className="icon-box-content">
              <h3 className="icon-title letter-spacing-normal mb-1">
                Organic &amp; Gluten-Free
              </h3>
              <p className="text-light font-weight-light">
                Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis.
              </p>
            </div>
          </div>
          <div className="icon-box d-flex align-items-center align-items-md-start flex-column flex-md-row text-center text-md-left py-2 pt-0 mb-7">
            <figure className="m-0">
              <img
                src="/assets/images/demos/demo-28/social-icons/icon-medal.jpg"
                alt="Medal icon"
              />
            </figure>
            <div className="icon-box-content">
              <h3 className="icon-title letter-spacing-normal mb-1">Premium Quality</h3>
              <p className="text-light font-weight-light">
                Quisque volutpat mattis eros. Nullam malesuada eratut turpis. Suspendisse urna nibh, viverra non, semper.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
