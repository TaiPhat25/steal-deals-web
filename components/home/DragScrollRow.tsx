"use client";

import { Children, useEffect, useMemo, useRef } from "react";

type DragScrollRowProps = {
  className?: string;
  children: React.ReactNode;
  visibleItems?: number;
};

export default function DragScrollRow({ className, children, visibleItems }: DragScrollRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const childNodes = useMemo(() => Children.toArray(children), [children]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const dragThreshold = 6;
    let isDragging = false;
    let shouldSuppressClick = false;
    let startX = 0;
    let startScrollLeft = 0;
    let singleTrackWidth = 0;

    const syncLoopPosition = () => {
      if (!singleTrackWidth) return;

      if (row.scrollLeft < singleTrackWidth * 0.5) {
        row.scrollLeft += singleTrackWidth;
      } else if (row.scrollLeft > singleTrackWidth * 1.5) {
        row.scrollLeft -= singleTrackWidth;
      }
    };

    const measureTrack = () => {
      const rowStyles = window.getComputedStyle(row);
      const cssVisibleItems = Number.parseFloat(
        rowStyles.getPropertyValue("--drag-visible-items")
      );
      const itemCount = cssVisibleItems || visibleItems;

      if (itemCount) {
        const track = row.querySelector<HTMLElement>(".drag-scroll-row__track");
        const trackStyles = track ? window.getComputedStyle(track) : null;
        const gap = trackStyles ? Number.parseFloat(trackStyles.columnGap) || 0 : 0;
        const itemWidth = (row.clientWidth - gap * (itemCount - 1)) / itemCount;
        row.style.setProperty("--drag-item-width", `${Math.max(itemWidth, 0)}px`);
      }

      singleTrackWidth = row.scrollWidth / 3;
      if (singleTrackWidth) {
        row.scrollLeft = singleTrackWidth;
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      isDragging = true;
      shouldSuppressClick = false;
      startX = event.clientX;
      startScrollLeft = row.scrollLeft;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const distance = event.clientX - startX;
      if (!shouldSuppressClick && Math.abs(distance) < dragThreshold) return;

      shouldSuppressClick = true;
      row.classList.add("is-dragging");
      if (!row.hasPointerCapture(event.pointerId)) {
        row.setPointerCapture(event.pointerId);
      }
      row.scrollLeft = startScrollLeft - distance;
      syncLoopPosition();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      row.classList.remove("is-dragging");
      if (row.hasPointerCapture(event.pointerId)) {
        row.releasePointerCapture(event.pointerId);
      }
      syncLoopPosition();
    };

    const onClick = (event: MouseEvent) => {
      if (!shouldSuppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      shouldSuppressClick = false;
    };

    measureTrack();
    const resizeObserver = new ResizeObserver(() => {
      measureTrack();
    });
    resizeObserver.observe(row);

    row.addEventListener("pointerdown", onPointerDown);
    row.addEventListener("pointermove", onPointerMove);
    row.addEventListener("pointerup", onPointerUp);
    row.addEventListener("pointercancel", onPointerUp);
    row.addEventListener("click", onClick, true);

    return () => {
      row.removeEventListener("pointerdown", onPointerDown);
      row.removeEventListener("pointermove", onPointerMove);
      row.removeEventListener("pointerup", onPointerUp);
      row.removeEventListener("pointercancel", onPointerUp);
      row.removeEventListener("click", onClick, true);
      resizeObserver.disconnect();
    };
  }, [visibleItems]);

  return (
    <div ref={rowRef} className={className}>
      <div className="drag-scroll-row__track">
        {childNodes}
        {childNodes}
        {childNodes}
      </div>
    </div>
  );
}
