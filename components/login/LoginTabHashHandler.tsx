"use client";

import { useEffect } from "react";

type LoginTab = "signin" | "register";

function activateTab(tab: LoginTab) {
  const tabId = tab === "signin" ? "signin-2" : "register-2";
  const tabLink = document.getElementById(`${tab === "signin" ? "signin" : "register"}-tab-2`);
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

type LoginTabHashHandlerProps = {
  initialTab: LoginTab;
};

export default function LoginTabHashHandler({ initialTab }: LoginTabHashHandlerProps) {
  useEffect(() => {
    const signinLink = document.getElementById("signin-tab-2");
    const registerLink = document.getElementById("register-tab-2");

    const setRoute = (tab: LoginTab, replace = false) => {
      const path = tab === "signin" ? "/login" : "/register";
      activateTab(tab);

      if (window.location.pathname !== path || window.location.hash) {
        const updateUrl = replace ? window.history.replaceState : window.history.pushState;
        updateUrl.call(window.history, null, "", path);
      }
    };

    const handleSigninClick = (event: Event) => {
      event.preventDefault();
      setRoute("signin");
    };

    const handleRegisterClick = (event: Event) => {
      event.preventDefault();
      setRoute("register");
    };

    const tabFromLocation = window.location.hash === "#register-2"
      ? "register"
      : window.location.hash === "#signin-2"
        ? "signin"
        : initialTab;

    setRoute(tabFromLocation, true);
    signinLink?.addEventListener("click", handleSigninClick);
    registerLink?.addEventListener("click", handleRegisterClick);

    return () => {
      signinLink?.removeEventListener("click", handleSigninClick);
      registerLink?.removeEventListener("click", handleRegisterClick);
    };
  }, [initialTab]);

  return null;
}
