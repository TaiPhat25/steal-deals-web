export default function IntroSection() {
  return (
    <div
      className="intro-section bg-image"
      style={{ backgroundImage: "url(/assets/images/demos/demo-28/background.jpg)" }}
    >
      <div className="container">
        <div
          className="owl-carousel inner-carousel owl-simple rows cols-1"
          data-toggle="owl"
          data-owl-options='{"nav": false, "dots": true, "loop": true}'
        >
          <div
            className="intro-slide"
            style={{
              backgroundImage: "url(/assets/images/demos/demo-28/intro-slider/1.jpg)",
              backgroundColor: "#2a323e",
            }}
          >
            <div className="intro-content intro-content-left">
              <h6 className="font-weight-normal text-primary my-2 mt-0">
                Clearout Sale
              </h6>
              <h3 className="intro-title font-weight-bold text-white mb-0">
                Only Organic<br />
                Large Box
              </h3>
              <h3 className="intro-desc mb-2 font-weight-light text-secondary">
                Sale 30% off
              </h3>
              <a href="#" className="btn btn-primary text-uppercase">
                Shop now
              </a>
            </div>
          </div>
          <div
            className="intro-slide"
            style={{
              backgroundImage: "url(/assets/images/demos/demo-28/intro-slider/2.jpg)",
              backgroundColor: "#dd6584",
            }}
          >
            {/* <div className="intro-content intro-content-right">
              <h6 className="font-weight-normal text-white my-2 mt-0">
                100% Recyclable Packaging
              </h6>
              <h3 className="intro-title font-weight-bold text-white mb-0">
                Good For You<br />
                And The Planet
              </h3>
              <h3 className="intro-desc mb-2 font-weight-light text-secondary">
                Fast Shipping
              </h3>
              <a href="#" className="btn btn-primary text-uppercase">
                Shop now
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
