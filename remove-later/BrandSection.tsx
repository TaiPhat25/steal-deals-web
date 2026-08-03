export default function BrandSection() {
  return (
    <div className="brand-section mt-7 mb-6">
      <div className="container py-2 pt-0">
        <div
          className="owl-carousel owl-simple rows cols-2 cols-xs-3 cols-md-4 cols-lg-6"
          data-toggle="owl"
          data-owl-options='{"nav": false, "loop": false, "dots": false, "margin": 0, "responsive": {"0": {"items": 2}, "480": {"items": 3}, "768": {"items": 4}, "992": {"items": 6}}}'
        >
          <a href="#" className="brand">
            <img src="/assets/images/demos/demo-28/logos/1.png" alt="Brand 1" />
          </a>
          <a href="#" className="brand">
            <img src="/assets/images/demos/demo-28/logos/2.png" alt="Brand 2" />
          </a>
          <a href="#" className="brand">
            <img src="/assets/images/demos/demo-28/logos/3.png" alt="Brand 3" />
          </a>
          <a href="#" className="brand">
            <img src="/assets/images/demos/demo-28/logos/4.png" alt="Brand 4" />
          </a>
          <a href="#" className="brand">
            <img src="/assets/images/demos/demo-28/logos/5.png" alt="Brand 5" />
          </a>
          <a href="#" className="brand">
            <img src="/assets/images/demos/demo-28/logos/6.png" alt="Brand 6" />
          </a>
        </div>
      </div>
    </div>
  );
}
