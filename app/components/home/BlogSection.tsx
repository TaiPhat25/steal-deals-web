export default function BlogSection() {
  return (
    <div className="bg-lighter blog-section pt-6 pb-5">
      <div className="container">
        <div className="heading py-2 pb-0">
          <h2 className="title align-self-center letter-spacing-normal text-center text-md-left">
            From Our Blog
          </h2>
        </div>
        <div
          className="owl-carousel owl-simple shadow-carousel rows cols-1 cols-sm-2 cols-lg-3 cols-xl-4"
          data-toggle="owl"
          data-owl-options='{"nav": false, "dots": false, "items": 4, "margin": 20, "loop": false, "responsive": {"0": {"items": 1}, "576": {"items": 2}, "992": {"items": 3}, "1200": {"items": 4}}}'
        >
          <article className="entry">
            <figure className="entry-media mb-0">
              <a href="single.html">
                <img
                  src="/assets/images/demos/demo-28/blog/1.jpg"
                  alt="Aenean dignissim"
                  width="334"
                  height="200"
                />
              </a>
            </figure>

            <div className="entry-body text-left">
              <div className="entry-meta">
                <a href="#">Jan 12, 2020</a>&nbsp;/&nbsp;<a href="#">0 Comments</a>
              </div>

              <h3 className="entry-title text-dark">
                <a href="single.html">Aenean dignissim felis.</a>
              </h3>

              <div className="entry-content">
                <p className="font-weight-light text-light">
                  Morbi in sem quis dui placerat ornare. Pellentesque odio nisi, euismod in, pharetra ultricies in, diam. Sed arcu.
                </p>
                <a href="single.html" className="read-more m-0 p-0">
                  Read More
                </a>
              </div>
            </div>
          </article>

          <article className="entry">
            <figure className="entry-media mb-0">
              <a href="single.html">
                <img
                  src="/assets/images/demos/demo-28/blog/2.jpg"
                  alt="Fusce pellentesque"
                  width="334"
                  height="200"
                />
              </a>
            </figure>

            <div className="entry-body text-left">
              <div className="entry-meta">
                <a href="#">Jan 12, 2020</a>&nbsp;/&nbsp;<a href="#">2 Comments</a>
              </div>

              <h3 className="entry-title text-dark">
                <a href="single.html">Fusce pellentesque.</a>
              </h3>

              <div className="entry-content">
                <p className="font-weight-light text-light">
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Phasellus hendrerit. Pellentesque aliquet nibh nec urna.
                </p>
                <a href="single.html" className="read-more m-0 p-0">
                  Read More
                </a>
              </div>
            </div>
          </article>

          <article className="entry">
            <figure className="entry-media mb-0">
              <a href="single.html">
                <img
                  src="/assets/images/demos/demo-28/blog/3.jpg"
                  alt="Quisque a lectus"
                  width="334"
                  height="200"
                />
              </a>
            </figure>

            <div className="entry-body text-left">
              <div className="entry-meta">
                <a href="#">Jan 12, 2020</a>&nbsp;/&nbsp;<a href="#">4 Comments</a>
              </div>

              <h3 className="entry-title text-dark">
                <a href="single.html">Quisque a lectus.</a>
              </h3>

              <div className="entry-content">
                <p className="font-weight-light text-light">
                  Phasellus hendrerit. Pellentesque aliqunibh nec urna. In nisi neque, aliquet vel, dapibus id, mattis vel, nisi. Sed pretium ligula ...
                </p>
                <a href="single.html" className="read-more m-0 p-0">
                  Read More
                </a>
              </div>
            </div>
          </article>

          <article className="entry">
            <figure className="entry-media mb-0">
              <a href="single.html">
                <img
                  src="/assets/images/demos/demo-28/blog/4.jpg"
                  alt="Morbi in sem"
                  width="334"
                  height="200"
                />
              </a>
            </figure>

            <div className="entry-body text-left">
              <div className="entry-meta">
                <a href="#">Jan 12, 2020</a>&nbsp;/&nbsp;<a href="#">0 Comments</a>
              </div>

              <h3 className="entry-title text-dark">
                <a href="single.html">Morbi in sem quis duiplacerat.</a>
              </h3>

              <div className="entry-content">
                <p className="font-weight-light text-light">
                  Sed egestas, ante et vulputate volutpat, eros pede semper est, vitae luctus metus libero eu augue. Morbi purus libero ...
                </p>
                <a href="single.html" className="read-more m-0 p-0">
                  Read More
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
