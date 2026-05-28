"use client";

import { useEffect } from "react";

type InteractiveHandlersProps = {
  enableScrollTop?: boolean;
};

export default function InteractiveHandlers({ enableScrollTop = true }: InteractiveHandlersProps) {
  useEffect(() => {
    const body = document.body;
    const searchToggle = document.querySelector<HTMLAnchorElement>(".search-toggle");
    const searchWrapper = document.querySelector<HTMLElement>(".header-search-wrapper");
    const mobileTogglers = document.querySelectorAll<HTMLButtonElement>(".mobile-menu-toggler");
    const mobileClose = document.querySelectorAll<HTMLElement>(
      ".mobile-menu-overlay, .mobile-menu-close"
    );
    const scrollTopButton = document.getElementById("scroll-top");

    const onSearchToggle = (event: Event) => {
      event.preventDefault();
      if (!searchWrapper || !searchToggle) return;
      searchWrapper.classList.toggle("show");
      searchToggle.classList.toggle("active");
      const input = searchWrapper.querySelector<HTMLInputElement>("input");
      input?.focus();
    };

    const onBodyClick = (event: MouseEvent) => {
      if (!searchWrapper || !searchToggle) return;
      if (!searchWrapper.classList.contains("show")) return;
      if (searchWrapper.contains(event.target as Node)) return;
      if (searchToggle.contains(event.target as Node)) return;
      searchWrapper.classList.remove("show");
      searchToggle.classList.remove("active");
      body.classList.remove("is-search-active");
    };

    const onMobileToggle = (event: Event) => {
      event.preventDefault();
      body.classList.toggle("mmenu-active");
      mobileTogglers.forEach((button) => button.classList.toggle("active"));
    };

    const onMobileClose = (event: Event) => {
      event.preventDefault();
      body.classList.remove("mmenu-active");
      mobileTogglers.forEach((button) => button.classList.remove("active"));
    };

    const onScroll = () => {
      if (!scrollTopButton || !enableScrollTop) return;
      if (window.scrollY > 400) {
        scrollTopButton.classList.add("show");
      } else {
        scrollTopButton.classList.remove("show");
      }
    };

    const onScrollTop = (event: Event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    searchToggle?.addEventListener("click", onSearchToggle);
    document.addEventListener("click", onBodyClick);
    mobileTogglers.forEach((button) => button.addEventListener("click", onMobileToggle));
    mobileClose.forEach((element) => element.addEventListener("click", onMobileClose));

    if (scrollTopButton && enableScrollTop) {
      window.addEventListener("scroll", onScroll);
      scrollTopButton.addEventListener("click", onScrollTop);
      onScroll();
    }

    return () => {
      searchToggle?.removeEventListener("click", onSearchToggle);
      document.removeEventListener("click", onBodyClick);
      mobileTogglers.forEach((button) => button.removeEventListener("click", onMobileToggle));
      mobileClose.forEach((element) => element.removeEventListener("click", onMobileClose));
      if (scrollTopButton && enableScrollTop) {
        window.removeEventListener("scroll", onScroll);
        scrollTopButton.removeEventListener("click", onScrollTop);
      }
    };
  }, [enableScrollTop]);

  return null;
}
