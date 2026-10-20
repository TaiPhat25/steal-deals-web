"use client";

import { Children, useLayoutEffect, useMemo, useRef } from "react";

type DragScrollRowProps = {
  className?: string;
  children: React.ReactNode;
  visibleItems?: number;
  fitItems?: boolean;
  snap?: boolean;
  role?: string;
  "aria-label"?: string;
  tabIndex?: number;
};

export default function DragScrollRow({
  className,
  children,
  visibleItems,
  fitItems = false,
  snap = false,
  role,
  "aria-label": ariaLabel,
  tabIndex,
}: DragScrollRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const childNodes = useMemo(() => Children.toArray(children), [children]);
  const cloneCount = childNodes.length > 1
    ? Math.min(visibleItems ?? 1, childNodes.length)
    : 0;
  const loopedChildNodes = useMemo(() => {
    if (cloneCount === 0) return childNodes;

    return [
      ...childNodes.slice(-cloneCount).map((child, index) => (
        <div
          key={`loop-start-${index}`}
          className="drag-scroll-row__clone"
          aria-hidden="true"
          inert
        >
          {child}
        </div>
      )),
      ...childNodes,
      ...childNodes.slice(0, cloneCount).map((child, index) => (
        <div
          key={`loop-end-${index}`}
          className="drag-scroll-row__clone"
          aria-hidden="true"
          inert
        >
          {child}
        </div>
      )),
    ];
  }, [childNodes, cloneCount]);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const dragThreshold = 6;
    let isDragging = false;
    let shouldSuppressClick = false;
    let startX = 0;
    let startScrollLeft = 0;
    let loopStart = 0;
    let loopWidth = 0;
    let itemStep = 0;
    let scrollEndTimer: number | undefined;
    let animationFrame: number | undefined;
    let isSnapping = false;

    const normalizeLoopPosition = () => {
      if (!loopWidth) return 0;

      if (row.scrollLeft < loopStart - 0.5) {
        row.scrollLeft += loopWidth;
        return loopWidth;
      } else if (row.scrollLeft >= loopStart + loopWidth - 0.5) {
        row.scrollLeft -= loopWidth;
        return -loopWidth;
      }

      return 0;
    };

    const stopSnapAnimation = () => {
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = undefined;
      }
      isSnapping = false;
      row.classList.remove("is-snapping");
    };

    const snapToNearestItem = () => {
      if (!snap || !itemStep || isSnapping) return;

      normalizeLoopPosition();
      const itemIndex = Math.round((row.scrollLeft - loopStart) / itemStep);
      const startScroll = row.scrollLeft;
      const targetScroll = loopStart + itemIndex * itemStep;

      if (Math.abs(targetScroll - startScroll) < 0.5) return;

      isSnapping = true;
      row.classList.add("is-snapping");
      const startedAt = performance.now();
      const duration = 250;
      const animate = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        row.scrollLeft = startScroll + (targetScroll - startScroll) * easedProgress;

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(animate);
        } else {
          animationFrame = undefined;
          isSnapping = false;
          row.classList.remove("is-snapping");
        }
      };

      animationFrame = window.requestAnimationFrame(animate);
    };

    const scheduleScrollSnap = () => {
      if (!snap || isDragging || isSnapping) return;

      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(snapToNearestItem, 100);
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
        const padding = fitItems
          ? Number.parseFloat(rowStyles.paddingLeft) + Number.parseFloat(rowStyles.paddingRight)
          : 0;
        const itemWidth =
          (row.clientWidth - padding - gap * (itemCount - 1)) / itemCount;
        row.style.setProperty("--drag-item-width", `${Math.max(itemWidth, 0)}px`);

        itemStep = Math.max(itemWidth, 0) + gap;
        loopStart = itemStep * cloneCount;
        loopWidth = itemStep * childNodes.length;
        row.scrollLeft = loopStart;
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if ((event.target as HTMLElement).closest("button, input, select, textarea")) return;

      if (snap) {
        window.clearTimeout(scrollEndTimer);
        stopSnapAnimation();
      }
      isDragging = true;
      shouldSuppressClick = false;
      startX = event.clientX;
      startScrollLeft = row.scrollLeft;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return;

      if (event.pointerType === "mouse" && (event.buttons & 1) === 0) {
        isDragging = false;
        row.classList.remove("is-dragging");
        return;
      }

      const distance = event.clientX - startX;
      if (!shouldSuppressClick && Math.abs(distance) < dragThreshold) return;

      event.preventDefault();
      shouldSuppressClick = true;
      row.classList.add("is-dragging");
      if (!row.hasPointerCapture(event.pointerId)) {
        row.setPointerCapture(event.pointerId);
      }
      row.scrollLeft = startScrollLeft - distance;
      const loopOffset = normalizeLoopPosition();
      if (loopOffset) startScrollLeft += loopOffset;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      row.classList.remove("is-dragging");
      if (row.hasPointerCapture(event.pointerId)) {
        row.releasePointerCapture(event.pointerId);
      }
      normalizeLoopPosition();
      snapToNearestItem();
    };

    const onLostPointerCapture = () => {
      isDragging = false;
      row.classList.remove("is-dragging");
      normalizeLoopPosition();
      snapToNearestItem();
    };

    const onNativeDragStart = (event: DragEvent) => {
      event.preventDefault();
    };

    const onClick = (event: MouseEvent) => {
      if (!shouldSuppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      shouldSuppressClick = false;
    };

    const onScroll = () => {
      if (!isDragging) normalizeLoopPosition();
      scheduleScrollSnap();
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
    row.addEventListener("lostpointercapture", onLostPointerCapture);
    row.addEventListener("dragstart", onNativeDragStart, true);
    row.addEventListener("click", onClick, true);
    row.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.clearTimeout(scrollEndTimer);
      stopSnapAnimation();
      row.removeEventListener("pointerdown", onPointerDown);
      row.removeEventListener("pointermove", onPointerMove);
      row.removeEventListener("pointerup", onPointerUp);
      row.removeEventListener("pointercancel", onPointerUp);
      row.removeEventListener("lostpointercapture", onLostPointerCapture);
      row.removeEventListener("dragstart", onNativeDragStart, true);
      row.removeEventListener("click", onClick, true);
      row.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      resizeObserver.disconnect();
    };
  }, [childNodes.length, cloneCount, fitItems, snap, visibleItems]);

  if (childNodes.length === 0) return null;

  return (
    <div
      ref={rowRef}
      className={[className, snap ? "is-snap-enabled" : ""].filter(Boolean).join(" ")}
      role={role}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
    >
      <div className="drag-scroll-row__track">{loopedChildNodes}</div>
    </div>
  );
}
