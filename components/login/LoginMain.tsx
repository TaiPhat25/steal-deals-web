"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import EmailVerificationDialog from "@/components/login/EmailVerificationDialog";
import RegisterForm from "@/components/login/RegisterForm";
import SignInForm from "@/components/login/SignInForm";
import {
  AUTH_TAB_CHANGE_EVENT,
  type AuthTab,
  type AuthTabChangeDetail,
} from "@/components/login/auth-navigation";

type LoginMainProps = {
  initialTab?: AuthTab;
};

export default function LoginMain({ initialTab = "signin" }: LoginMainProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(
    null,
  );
  const isSignIn = activeTab === "signin";
  const pendingTabRef = useRef<AuthTab | null>(null);
  const tabFrameRef = useRef<number | null>(null);
  const signInTabRef = useRef<HTMLButtonElement>(null);
  const registerTabRef = useRef<HTMLButtonElement>(null);
  const signInPanelRef = useRef<HTMLDivElement>(null);
  const registerPanelRef = useRef<HTMLDivElement>(null);
  const shouldFocusPanelRef = useRef(false);

  const queueTabChange = useCallback((tab: AuthTab) => {
    pendingTabRef.current = tab;
    if (tabFrameRef.current !== null) return;

    tabFrameRef.current = window.requestAnimationFrame(() => {
      const nextTab = pendingTabRef.current;
      pendingTabRef.current = null;
      tabFrameRef.current = null;

      if (nextTab) {
        setActiveTab((currentTab) =>
          currentTab === nextTab ? currentTab : nextTab,
        );
      }
    });
  }, []);

  const focusPanelFirstField = useCallback((tab: AuthTab) => {
    window.requestAnimationFrame(() => {
      const panel =
        tab === "signin" ? signInPanelRef.current : registerPanelRef.current;
      panel
        ?.querySelector<HTMLInputElement>("input:not([disabled])")
        ?.focus();
    });
  }, []);

  useEffect(() => {
    focusPanelFirstField(initialTab);
  }, [focusPanelFirstField, initialTab]);

  useEffect(
    () => () => {
      if (tabFrameRef.current !== null) {
        window.cancelAnimationFrame(tabFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const nextPath = activeTab === "signin" ? "/login" : "/register";
    if (window.location.pathname === nextPath) return;

    const timeoutId = window.setTimeout(() => {
      window.history.replaceState(window.history.state, "", nextPath);
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab]);

  useEffect(() => {
    const handleAuthTabChange = (event: Event) => {
      const { tab } = (event as CustomEvent<AuthTabChangeDetail>).detail;
      if (tab !== "signin" && tab !== "register") return;

      if (tab === activeTab) {
        focusPanelFirstField(tab);
        return;
      }

      shouldFocusPanelRef.current = true;
      queueTabChange(tab);
    };

    window.addEventListener(AUTH_TAB_CHANGE_EVENT, handleAuthTabChange);
    return () =>
      window.removeEventListener(AUTH_TAB_CHANGE_EVENT, handleAuthTabChange);
  }, [activeTab, focusPanelFirstField, queueTabChange]);

  useEffect(() => {
    if (!shouldFocusPanelRef.current) return;
    shouldFocusPanelRef.current = false;
    focusPanelFirstField(activeTab);
  }, [activeTab, focusPanelFirstField]);

  const handleTabChange = (tab: AuthTab) => {
    if (tab === activeTab) {
      focusPanelFirstField(tab);
      return;
    }

    shouldFocusPanelRef.current = true;
    queueTabChange(tab);
  };

  const handleTabKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentTab: AuthTab,
  ) => {
    let nextTab: AuthTab | null = null;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      nextTab = currentTab === "signin" ? "register" : "signin";
    } else if (event.key === "Home") {
      nextTab = "signin";
    } else if (event.key === "End") {
      nextTab = "register";
    }

    if (!nextTab) return;

    event.preventDefault();
    shouldFocusPanelRef.current = false;
    queueTabChange(nextTab);
    const nextTabElement =
      nextTab === "signin" ? signInTabRef.current : registerTabRef.current;
    nextTabElement?.focus();
  };

  const handleSignInRequested = () => {
    shouldFocusPanelRef.current = true;
    queueTabChange("signin");
  };

  const handleVerificationExit = useCallback(() => {
    setVerificationEmail(null);
    window.location.assign("/login");
  }, []);

  return (
    <main className="main">
      <nav
        aria-label="breadcrumb"
        aria-hidden={verificationEmail ? true : undefined}
        className="breadcrumb-nav border-0 mb-0"
      >
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {isSignIn ? "Sign In" : "Register"}
            </li>
          </ol>
        </div>
      </nav>

      <div
        className="login-page auth-page"
        aria-hidden={verificationEmail ? true : undefined}
      >
        <div className="container">
          <div className="form-box">
            <div className="form-tab">
              <ul
                className="nav nav-pills nav-fill"
                role="tablist"
                aria-label="Account access"
                aria-orientation="horizontal"
              >
                <li className="nav-item">
                  <button
                    ref={signInTabRef}
                    className={`nav-link${isSignIn ? " active" : ""}`}
                    id="signin-tab"
                    type="button"
                    onClick={() => handleTabChange("signin")}
                    onKeyDown={(event) =>
                      handleTabKeyDown(event, "signin")
                    }
                    role="tab"
                    aria-controls="signin-panel"
                    aria-selected={isSignIn}
                    tabIndex={isSignIn ? 0 : -1}
                  >
                    Sign In
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    ref={registerTabRef}
                    className={`nav-link${isSignIn ? "" : " active"}`}
                    id="register-tab"
                    type="button"
                    onClick={() => handleTabChange("register")}
                    onKeyDown={(event) =>
                      handleTabKeyDown(event, "register")
                    }
                    role="tab"
                    aria-controls="register-panel"
                    aria-selected={!isSignIn}
                    tabIndex={isSignIn ? -1 : 0}
                  >
                    Register
                  </button>
                </li>
              </ul>

              <div className="tab-content">
                <div
                  ref={signInPanelRef}
                  className={`tab-pane${isSignIn ? " show active" : ""}`}
                  id="signin-panel"
                  role="tabpanel"
                  aria-labelledby="signin-tab"
                >
                  <SignInForm />
                </div>

                <div
                  ref={registerPanelRef}
                  className={`tab-pane${isSignIn ? "" : " show active"}`}
                  id="register-panel"
                  role="tabpanel"
                  aria-labelledby="register-tab"
                >
                  <RegisterForm
                    onVerificationRequired={setVerificationEmail}
                    onSignInRequested={handleSignInRequested}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {verificationEmail && (
        <EmailVerificationDialog
          email={verificationEmail}
          onExit={handleVerificationExit}
        />
      )}
    </main>
  );
}
