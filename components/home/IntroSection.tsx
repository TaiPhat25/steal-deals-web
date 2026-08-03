"use client";

import { useEffect } from "react";
import Link from "next/link";

type CarouselElement = {
  hasClass: (className: string) => boolean;
  owlCarousel: (options: Record<string, unknown>) => void;
};

type JQueryLike = ((selector: string) => CarouselElement) & {
  fn?: {
    owlCarousel?: unknown;
  };
};

export default function IntroSection() {
  useEffect(() => {
    let retryTimer: number | undefined;
    let attempts = 0;

    const initializeCarousel = () => {
      const jquery = (window as Window & { jQuery?: JQueryLike }).jQuery;

      if (jquery?.fn?.owlCarousel) {
        const carousel = jquery(".inner-carousel");

        if (!carousel.hasClass("owl-loaded")) {
          carousel.owlCarousel({
            items: 1,
            loop: true,
            margin: 0,
            nav: false,
            dots: true,
            smartSpeed: 400,
          });
        }

        return;
      }

      if (attempts < 20) {
        attempts += 1;
        retryTimer = window.setTimeout(initializeCarousel, 100);
      }
    };

    initializeCarousel();

    return () => {
      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
      }
    };
  }, []);

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
                Rescue surplus food
              </h6>
              <h3 className="intro-title font-weight-bold text-white mb-0">
                Good food
                <br />
                at a better price
              </h3>
              <h3 className="intro-desc mb-2 font-weight-light text-secondary">
                Surprise bags from local stores
              </h3>
              <Link href="/category?sort=near-expiry" className="btn btn-primary text-uppercase">
                Browse surprise bags
              </Link>
            </div>
          </div>
          <div
            className="intro-slide"
            style={{
              backgroundImage: "url(/assets/images/demos/demo-28/intro-slider/2.jpg)",
              backgroundColor: "#dd6584",
            }}
          >
            <div className="intro-content intro-content-right">
              <h6 className="font-weight-normal text-white my-2 mt-0">
                Make every meal count
              </h6>
              <h3 className="intro-title font-weight-bold text-white mb-0">
                Save food.
                <br />
                Support local stores.
              </h3>
              <h3 className="intro-desc mb-2 font-weight-light text-secondary">
                Pick up quality food before the day ends
              </h3>
              <Link href="/category?sort=distance" className="btn btn-primary text-uppercase">
                Find bags near you
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
