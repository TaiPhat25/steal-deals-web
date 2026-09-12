"use client";

import {
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";

const INTRO_SLIDES = [
  {
    image: "/assets/images/demos/demo-28/intro-slider/1.jpg",
    backgroundColor: "#2a323e",
    contentClassName: "intro-content-left",
    eyebrowClassName: "text-primary",
    eyebrow: "Rescue surplus food",
    title: ["Good food", "at a better price"],
    description: "Surprise bags from local stores",
    href: "/products?sort=near-expiry",
    action: "Browse surprise bags",
  },
  {
    image: "/assets/images/demos/demo-28/intro-slider/2.jpg",
    backgroundColor: "#dd6584",
    contentClassName: "intro-content-right",
    eyebrowClassName: "text-white",
    eyebrow: "Make every meal count",
    title: ["Save food.", "Support local stores."],
    description: "Pick up quality food before the day ends",
    href: "/products?sort=distance",
    action: "Find bags near you",
  },
] as const;

export default function IntroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragPointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const didDragRef = useRef(false);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isAnimating) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as HTMLElement).closest("a, button")) return;

    dragPointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    didDragRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) return;

    const distance = event.clientX - dragStartXRef.current;

    if (Math.abs(distance) >= 8) {
      didDragRef.current = true;
      setIsDragging(true);
    }

    const isDraggingPastStart = activeSlide === 0 && distance > 0;
    const isDraggingPastEnd =
      activeSlide === INTRO_SLIDES.length - 1 && distance < 0;
    const resistedDistance =
      isDraggingPastStart || isDraggingPastEnd ? distance * 0.25 : distance;
    const maximumOffset = event.currentTarget.clientWidth;

    setDragOffset(
      Math.max(-maximumOffset, Math.min(maximumOffset, resistedDistance))
    );
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) return;

    const distance = event.clientX - dragStartXRef.current;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragPointerIdRef.current = null;
    setIsDragging(false);
    setIsAnimating(true);
    setDragOffset(0);

    if (didDragRef.current && Math.abs(distance) >= 40) {
      const requestedSlide = activeSlide + (distance < 0 ? 1 : -1);

      if (requestedSlide >= 0 && requestedSlide < INTRO_SLIDES.length) {
        setActiveSlide(requestedSlide);
      }
    }
  };

  const cancelDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) return;

    dragPointerIdRef.current = null;
    didDragRef.current = false;
    setIsDragging(false);
    setIsAnimating(true);
    setDragOffset(0);
  };

  const suppressClickAfterDrag = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!didDragRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    didDragRef.current = false;
  };

  const selectSlide = (index: number) => {
    if (index === activeSlide) return;

    setIsAnimating(true);
    setDragOffset(0);
    setActiveSlide(index);
  };

  return (
    <div
      className="intro-section bg-image"
      style={{ backgroundImage: "url(/assets/images/demos/demo-28/background.jpg)" }}
    >
      <div className="container">
        <div
          className={`home-intro-carousel${isDragging ? " is-dragging" : ""}`}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured food rescue offers"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={cancelDrag}
          onClickCapture={suppressClickAfterDrag}
        >
          <div
            className={`home-intro-carousel__track${isAnimating ? " is-animating" : ""}`}
            style={{
              transform: `translate3d(calc(${-activeSlide * 100}% + ${dragOffset}px), 0, 0)`,
            }}
            onTransitionEnd={() => setIsAnimating(false)}
          >
            {INTRO_SLIDES.map((slide, index) => (
              <div
                key={slide.image}
                className="intro-slide home-intro-carousel__slide"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundColor: slide.backgroundColor,
                }}
                aria-hidden={index !== activeSlide}
              >
                <div className={`intro-content ${slide.contentClassName}`}>
                  <h6
                    className={`font-weight-normal ${slide.eyebrowClassName} my-2 mt-0`}
                  >
                    {slide.eyebrow}
                  </h6>
                  <h3 className="intro-title font-weight-bold text-white mb-0">
                    {slide.title[0]}
                    <br />
                    {slide.title[1]}
                  </h3>
                  <h3 className="intro-desc mb-2 font-weight-light text-secondary">
                    {slide.description}
                  </h3>
                  <Link
                    href={slide.href}
                    className="btn btn-primary text-uppercase"
                    tabIndex={index === activeSlide ? undefined : -1}
                  >
                    {slide.action}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="home-intro-carousel__dots" aria-label="Choose featured offer">
            {INTRO_SLIDES.map((item, index) => (
              <button
                key={item.image}
                type="button"
                className={index === activeSlide ? "active" : undefined}
                aria-label={`Show offer ${index + 1}`}
                aria-current={index === activeSlide ? "true" : undefined}
                onClick={() => selectSlide(index)}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
