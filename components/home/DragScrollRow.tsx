"use client";

import { Children, useEffect, useMemo, useRef } from "react";

type DragScrollRowProps = {
  className?: string;
  children: React.ReactNode;
};

export default function DragScrollRow({ className, children }: DragScrollRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const childNodes = useMemo(() => Children.toArray(children), [children]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    let isDragging = false;
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
      singleTrackWidth = row.scrollWidth / 3;
      if (singleTrackWidth) {
        row.scrollLeft = singleTrackWidth;
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      isDragging = true;
      startX = event.clientX;
      startScrollLeft = row.scrollLeft;
      row.classList.add("is-dragging");
      row.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const distance = event.clientX - startX;
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

    measureTrack();
    const resizeObserver = new ResizeObserver(() => {
      measureTrack();
    });
    resizeObserver.observe(row);

    row.addEventListener("pointerdown", onPointerDown);
    row.addEventListener("pointermove", onPointerMove);
    row.addEventListener("pointerup", onPointerUp);
    row.addEventListener("pointercancel", onPointerUp);

    return () => {
      row.removeEventListener("pointerdown", onPointerDown);
      row.removeEventListener("pointermove", onPointerMove);
      row.removeEventListener("pointerup", onPointerUp);
      row.removeEventListener("pointercancel", onPointerUp);
      resizeObserver.disconnect();
    };
  }, []);

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