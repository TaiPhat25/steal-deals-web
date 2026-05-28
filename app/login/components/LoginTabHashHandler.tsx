"use client";

import { useEffect } from "react";

function activateTab(tabId: "signin-2" | "register-2") {
  const tabLink = document.querySelector<HTMLAnchorElement>(`a[href="#${tabId}"]`);
  const tabPane = document.getElementById(tabId);
  if (!tabLink || !tabPane) return;

  document
    .querySelectorAll<HTMLAnchorElement>("#signin-tab-2, #register-tab-2")
    .forEach((link) => {
      const isActive = link === tabLink;
      link.classList.toggle("active", isActive);
      link.setAttribute("aria-selected", isActive ? "true" : "false");
    });

  document.querySelectorAll<HTMLElement>("#signin-2, #register-2").forEach((pane) => {
    const isActive = pane === tabPane;
    pane.classList.toggle("show", isActive);
    pane.classList.toggle("active", isActive);
  });
}

export default function LoginTabHashHandler() {
  useEffect(() => {
    const syncTabFromHash = () => {
      if (window.location.hash === "#signin-2") {
        activateTab("signin-2");
      } else if (window.location.hash === "#register-2") {
        activateTab("register-2");
      }
    };

    syncTabFromHash();
    window.addEventListener("hashchange", syncTabFromHash);

    return () => window.removeEventListener("hashchange", syncTabFromHash);
  }, []);

  return null;
}
