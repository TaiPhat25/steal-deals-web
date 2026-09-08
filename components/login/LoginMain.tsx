"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SubmitEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApiClientError } from "@/lib/api/client";
import { verifyEmail } from "@/lib/api/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import OtpInput from "@/components/auth/OtpInput";
import ResendOtpButton from "@/components/auth/ResendOtpButton";
import {
  AUTH_TAB_CHANGE_EVENT,
  type AuthTab,
  type AuthTabChangeDetail,
} from "@/components/login/auth-navigation";

type LoginMainProps = {
  initialTab?: AuthTab;
};

type LoginField = "email" | "password";
type RegisterField =
  | "firstName"
  | "lastName"
  | "email"
  | "password"
  | "confirmPassword"
  | "phone"
  | "policy";

type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARACTERS_PATTERN = /^\+?[0-9\s().-]+$/;

function isValidPhoneNumber(value: string) {
  const digitCount = value.replace(/\D/g, "").length;
  return (
    PHONE_CHARACTERS_PATTERN.test(value) &&
    digitCount >= 9 &&
    digitCount <= 15
  );
}

function getRequestErrorMessage(
  error: unknown,
  service: "sign-in" | "registration",
) {
  if (!(error instanceof ApiClientError)) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  if (error.status >= 500) {
    return `The ${service} service is temporarily unavailable. Please try again later.`;
  }

  return error.message;
}

export default function LoginMain({ initialTab = "signin" }: LoginMainProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const isSignIn = activeTab === "signin";
  const router = useRouter();
  const { login, register, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginFieldErrors, setLoginFieldErrors] = useState<
    FieldErrors<LoginField>
  >({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerFieldErrors, setRegisterFieldErrors] = useState<
    FieldErrors<RegisterField>
  >({});
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationOtp, setVerificationOtp] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const pendingTabRef = useRef<AuthTab | null>(null);
  const tabFrameRef = useRef<number | null>(null);

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
      if (tab === "signin" || tab === "register") {
        queueTabChange(tab);
      }
    };

    window.addEventListener(AUTH_TAB_CHANGE_EVENT, handleAuthTabChange);
    return () =>
      window.removeEventListener(AUTH_TAB_CHANGE_EVENT, handleAuthTabChange);
  }, [queueTabChange]);

  const clearLoginFieldError = (field: LoginField) => {
    setLoginError(null);
    setLoginFieldErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors;
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const clearRegisterFieldError = (field: RegisterField) => {
    setRegisterError(null);
    setRegisterFieldErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors;
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleLoginSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    const normalizedEmail = email.trim().toLowerCase();
    const nextFieldErrors: FieldErrors<LoginField> = {};

    if (!normalizedEmail) {
      nextFieldErrors.email = "Email address is required.";
    } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextFieldErrors.password = "Password is required.";
    }

    setLoginFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    try {
      const response = await login({ email: normalizedEmail, password });
      const isSeller = response.user?.roles.some(
        (role) => role.toLowerCase() === "seller",
      );
      router.replace(isSeller ? "/seller" : "/");
    } catch (error) {
      setLoginError(
        error instanceof ApiClientError && error.status === 401
          ? "Incorrect email or password."
          : getRequestErrorMessage(error, "sign-in"),
      );
    }
  };

  const handleRegisterSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterError(null);
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedEmail = registerEmail.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const nextFieldErrors: FieldErrors<RegisterField> = {};

    if (!normalizedFirstName) {
      nextFieldErrors.firstName = "First name is required.";
    }

    if (!normalizedLastName) {
      nextFieldErrors.lastName = "Last name is required.";
    }

    if (!normalizedEmail) {
      nextFieldErrors.email = "Email address is required.";
    } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }

    if (!registerPassword) {
      nextFieldErrors.password = "Password is required.";
    } else if (registerPassword.length < 8) {
      nextFieldErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      nextFieldErrors.confirmPassword = "Confirm your password.";
    } else if (registerPassword !== confirmPassword) {
      nextFieldErrors.confirmPassword = "Passwords do not match.";
    }

    if (!normalizedPhone) {
      nextFieldErrors.phone = "Phone number is required.";
    } else if (!isValidPhoneNumber(normalizedPhone)) {
      nextFieldErrors.phone =
        "Enter a valid phone number containing 9 to 15 digits.";
    }

    if (!hasAcceptedPolicy) {
      nextFieldErrors.policy = "You must agree to the privacy policy.";
    }

    setRegisterFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    try {
      const registrationResponse = await register({
        email: normalizedEmail,
        password: registerPassword,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        phone: normalizedPhone,
      });

      if (!registrationResponse.requiresEmailVerification) {
        router.replace("/login");
        return;
      }

      setVerificationEmail(normalizedEmail);
      setVerificationOtp("");
      setVerificationError(null);
      setShowVerificationModal(true);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        setRegisterFieldErrors((currentErrors) => ({
          ...currentErrors,
          email: "An account with this email address already exists.",
        }));
        return;
      }

      setRegisterError(getRequestErrorMessage(error, "registration"));
    }
  };

  const handleVerifyEmail = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setVerificationError(null);

    const normalizedOtp = verificationOtp.replace(/\D/g, "");
    if (!/^\d{6}$/.test(normalizedOtp)) {
      setVerificationError("Please enter the 6-digit verification code.");
      return;
    }

    setIsVerifying(true);

    try {
      await verifyEmail({ email: verificationEmail, otp: normalizedOtp });
      setShowVerificationModal(false);
      window.location.assign("/login");
    } catch (error) {
      setVerificationError(
        error instanceof ApiClientError && error.status === 400
          ? "The verification code is incorrect or expired."
          : error instanceof ApiClientError
            ? error.message
            : "Unable to verify your email. Please try again.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEnterLater = () => {
    setShowVerificationModal(false);
    window.location.assign("/login");
  };

  const handleTabChange = (tab: AuthTab) => {
    queueTabChange(tab);
  };

  return (
    <main className="main">
      <nav aria-label="breadcrumb" className="breadcrumb-nav border-0 mb-0">
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

      <div className="login-page auth-page">
        <div className="container">
          <div className="form-box">
            <div className="form-tab">
              <ul className="nav nav-pills nav-fill" role="tablist">
                <li className="nav-item">
                  <button
                    className={`nav-link${isSignIn ? " active" : ""}`}
                    id="signin-tab-2"
                    type="button"
                    onClick={() => handleTabChange("signin")}
                    role="tab"
                    aria-controls="signin-2"
                    aria-selected={isSignIn}
                  >
                    Sign In
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link${isSignIn ? "" : " active"}`}
                    id="register-tab-2"
                    type="button"
                    onClick={() => handleTabChange("register")}
                    role="tab"
                    aria-controls="register-2"
                    aria-selected={!isSignIn}
                  >
                    Register
                  </button>
                </li>
              </ul>
              <div className="tab-content">
                <div
                  className={`tab-pane${isSignIn ? " show active" : ""}`}
                  id="signin-2"
                  role="tabpanel"
                  aria-labelledby="signin-tab-2"
                >
                  <form onSubmit={handleLoginSubmit} noValidate>
                    <div className="form-group">
                      <label htmlFor="singin-email-2">Email address *</label>
                      <input
                        type="email"
                        className={`form-control${loginFieldErrors.email ? " auth-input-error" : ""}`}
                        id="singin-email-2"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          clearLoginFieldError("email");
                        }}
                        aria-invalid={Boolean(loginFieldErrors.email)}
                        aria-describedby={
                          loginFieldErrors.email
                            ? "signin-email-error"
                            : undefined
                        }
                        required
                      />
                      {loginFieldErrors.email && (
                        <small
                          id="signin-email-error"
                          className="auth-field-error"
                          role="alert"
                        >
                          {loginFieldErrors.email}
                        </small>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="singin-password-2">Password *</label>
                      <div className="auth-password-field">
                        <input
                          type={showSignInPassword ? "text" : "password"}
                          className={`form-control${loginFieldErrors.password ? " auth-input-error" : ""}`}
                          id="singin-password-2"
                          name="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(event) => {
                            setPassword(event.target.value);
                            clearLoginFieldError("password");
                          }}
                          aria-invalid={Boolean(loginFieldErrors.password)}
                          aria-describedby={
                            loginFieldErrors.password
                              ? "signin-password-error"
                              : undefined
                          }
                          required
                        />
                        <button
                          type="button"
                          className="auth-password-toggle"
                          onClick={() =>
                            setShowSignInPassword((isVisible) => !isVisible)
                          }
                          aria-label={
                            showSignInPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          aria-pressed={showSignInPassword}
                          title={
                            showSignInPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          <i
                            className={`la ${showSignInPassword ? "la-eye-slash" : "la-eye"}`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                      {loginFieldErrors.password && (
                        <small
                          id="signin-password-error"
                          className="auth-field-error"
                          role="alert"
                        >
                          {loginFieldErrors.password}
                        </small>
                      )}
                    </div>

                    {loginError && (
                      <div
                        className="alert alert-danger"
                        role="alert"
                        aria-live="polite"
                      >
                        {loginError}
                      </div>
                    )}

                    <div className="form-footer">
                      <button
                        type="submit"
                        className="btn btn-outline-primary-2"
                        disabled={isLoading}
                      >
                        <span>{isLoading ? "SIGNING IN..." : "SIGN IN"}</span>
                        <i className="icon-long-arrow-right"></i>
                      </button>

                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="signin-remember-2"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="signin-remember-2"
                        >
                          Remember Me
                        </label>
                      </div>

                      <a href="#" className="forgot-link">
                        Forgot Your Password?
                      </a>
                    </div>
                  </form>
                  {/* <div className="form-choice">
      								    	<p className="text-center">or sign in with</p>
      								    	<div className="row">
      								    		<div className="col-sm-6">
      								    			<a href="#" className="btn btn-login btn-g">
      								    				<i className="icon-google"></i>
      								    				Login With Google
      								    			</a>
      								    		</div>
      								    		<div className="col-sm-6">
      								    			<a href="#" className="btn btn-login btn-f">
      								    				<i className="icon-facebook-f"></i>
      								    				Login With Facebook
      								    			</a>
      								    		</div>
      								    	</div>
                                    </div> */}
                </div>
                <div
                  className={`tab-pane${isSignIn ? "" : " show active"}`}
                  id="register-2"
                  role="tabpanel"
                  aria-labelledby="register-tab-2"
                >
                  <form onSubmit={handleRegisterSubmit} noValidate>
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label htmlFor="register-first-name-2">
                            First name *
                          </label>
                          <input
                            type="text"
                            className={`form-control${registerFieldErrors.firstName ? " auth-input-error" : ""}`}
                            id="register-first-name-2"
                            name="firstName"
                            autoComplete="given-name"
                            value={firstName}
                            onChange={(event) => {
                              setFirstName(event.target.value);
                              clearRegisterFieldError("firstName");
                            }}
                            aria-invalid={Boolean(
                              registerFieldErrors.firstName,
                            )}
                            aria-describedby={
                              registerFieldErrors.firstName
                                ? "register-first-name-error"
                                : undefined
                            }
                            required
                          />
                          {registerFieldErrors.firstName && (
                            <small
                              id="register-first-name-error"
                              className="auth-field-error"
                              role="alert"
                            >
                              {registerFieldErrors.firstName}
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label htmlFor="register-last-name-2">
                            Last name *
                          </label>
                          <input
                            type="text"
                            className={`form-control${registerFieldErrors.lastName ? " auth-input-error" : ""}`}
                            id="register-last-name-2"
                            name="lastName"
                            autoComplete="family-name"
                            value={lastName}
                            onChange={(event) => {
                              setLastName(event.target.value);
                              clearRegisterFieldError("lastName");
                            }}
                            aria-invalid={Boolean(
                              registerFieldErrors.lastName,
                            )}
                            aria-describedby={
                              registerFieldErrors.lastName
                                ? "register-last-name-error"
                                : undefined
                            }
                            required
                          />
                          {registerFieldErrors.lastName && (
                            <small
                              id="register-last-name-error"
                              className="auth-field-error"
                              role="alert"
                            >
                              {registerFieldErrors.lastName}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="register-email-2">
                        Your email address *
                      </label>
                      <input
                        type="email"
                        className={`form-control${registerFieldErrors.email ? " auth-input-error" : ""}`}
                        id="register-email-2"
                        name="email"
                        autoComplete="email"
                        value={registerEmail}
                        onChange={(event) => {
                          setRegisterEmail(event.target.value);
                          clearRegisterFieldError("email");
                        }}
                        aria-invalid={Boolean(registerFieldErrors.email)}
                        aria-describedby={
                          registerFieldErrors.email
                            ? "register-email-error"
                            : undefined
                        }
                        required
                      />
                      {registerFieldErrors.email && (
                        <small
                          id="register-email-error"
                          className="auth-field-error"
                          role="alert"
                        >
                          {registerFieldErrors.email}
                        </small>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="register-password-2">Password *</label>
                      <div className="auth-password-field">
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          className={`form-control${registerFieldErrors.password ? " auth-input-error" : ""}`}
                          id="register-password-2"
                          name="password"
                          autoComplete="new-password"
                          value={registerPassword}
                          onChange={(event) => {
                            setRegisterPassword(event.target.value);
                            clearRegisterFieldError("password");
                            clearRegisterFieldError("confirmPassword");
                          }}
                          aria-invalid={Boolean(
                            registerFieldErrors.password,
                          )}
                          aria-describedby={`register-password-requirements${registerFieldErrors.password ? " register-password-error" : ""}`}
                          minLength={8}
                          required
                        />
                        <button
                          type="button"
                          className="auth-password-toggle"
                          onClick={() =>
                            setShowRegisterPassword((isVisible) => !isVisible)
                          }
                          aria-label={
                            showRegisterPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          aria-pressed={showRegisterPassword}
                          title={
                            showRegisterPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          <i
                            className={`la ${showRegisterPassword ? "la-eye-slash" : "la-eye"}`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                      <small
                        id="register-password-requirements"
                        className="auth-field-hint"
                      >
                        Use at least 8 characters.
                      </small>
                      {registerFieldErrors.password && (
                        <small
                          id="register-password-error"
                          className="auth-field-error"
                          role="alert"
                        >
                          {registerFieldErrors.password}
                        </small>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="register-confirm-password-2">
                        Confirm password *
                      </label>
                      <div className="auth-password-field">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className={`form-control${registerFieldErrors.confirmPassword ? " auth-input-error" : ""}`}
                          id="register-confirm-password-2"
                          name="confirmPassword"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(event) => {
                            setConfirmPassword(event.target.value);
                            clearRegisterFieldError("confirmPassword");
                          }}
                          aria-invalid={Boolean(
                            registerFieldErrors.confirmPassword,
                          )}
                          aria-describedby={
                            registerFieldErrors.confirmPassword
                              ? "register-confirm-password-error"
                              : undefined
                          }
                          minLength={8}
                          required
                        />
                        <button
                          type="button"
                          className="auth-password-toggle"
                          onClick={() =>
                            setShowConfirmPassword((isVisible) => !isVisible)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          aria-pressed={showConfirmPassword}
                          title={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          <i
                            className={`la ${showConfirmPassword ? "la-eye-slash" : "la-eye"}`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                      {registerFieldErrors.confirmPassword && (
                        <small
                          id="register-confirm-password-error"
                          className="auth-field-error"
                          role="alert"
                        >
                          {registerFieldErrors.confirmPassword}
                        </small>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="register-phone-2">Phone number *</label>
                      <input
                        type="tel"
                        className={`form-control${registerFieldErrors.phone ? " auth-input-error" : ""}`}
                        id="register-phone-2"
                        name="phone"
                        autoComplete="tel"
                        value={phone}
                        onChange={(event) => {
                          setPhone(event.target.value);
                          clearRegisterFieldError("phone");
                        }}
                        aria-invalid={Boolean(registerFieldErrors.phone)}
                        aria-describedby={
                          registerFieldErrors.phone
                            ? "register-phone-error"
                            : undefined
                        }
                        required
                      />
                      {registerFieldErrors.phone && (
                        <small
                          id="register-phone-error"
                          className="auth-field-error"
                          role="alert"
                        >
                          {registerFieldErrors.phone}
                        </small>
                      )}
                    </div>

                    {registerError && (
                      <div
                        className="alert alert-danger"
                        role="alert"
                        aria-live="polite"
                      >
                        {registerError}
                      </div>
                    )}

                    <div className="form-footer">
                      <button
                        type="submit"
                        className="btn btn-outline-primary-2"
                        disabled={isLoading}
                      >
                        <span>{isLoading ? "REGISTERING..." : "REGISTER"}</span>
                        <i className="icon-long-arrow-right"></i>
                      </button>

                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="register-policy-2"
                          checked={hasAcceptedPolicy}
                          onChange={(event) => {
                            setHasAcceptedPolicy(event.target.checked);
                            clearRegisterFieldError("policy");
                          }}
                          aria-invalid={Boolean(registerFieldErrors.policy)}
                          aria-describedby={
                            registerFieldErrors.policy
                              ? "register-policy-error"
                              : undefined
                          }
                          required
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="register-policy-2"
                        >
                          I agree to the <a href="#">privacy policy</a> *
                        </label>
                        {registerFieldErrors.policy && (
                          <small
                            id="register-policy-error"
                            className="auth-field-error"
                            role="alert"
                          >
                            {registerFieldErrors.policy}
                          </small>
                        )}
                      </div>
                    </div>
                  </form>
                  {/* <div className="form-choice">
      								    	<p className="text-center">or sign in with</p>
      								    	<div className="row">
      								    		<div className="col-sm-6">
      								    			<a href="#" className="btn btn-login btn-g">
      								    				<i className="icon-google"></i>
      								    				Login With Google
      								    			</a>
      								    		</div>
      								    		<div className="col-sm-6">
      								    			<a href="#" className="btn btn-login  btn-f">
      								    				<i className="icon-facebook-f"></i>
      								    				Login With Facebook
      								    			</a>
      								    		</div>
      								    	</div>
                                    </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showVerificationModal && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal fade show"
            role="dialog"
            aria-modal="true"
            aria-labelledby="verify-email-title"
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="form-box">
                    <div className="form-tab">
                      <h2 id="verify-email-title" className="text-center mb-2">
                        Verify Your Email
                      </h2>
                      <p className="text-center mb-3">
                        Enter the OTP sent to your email address.
                      </p>

                      <form onSubmit={handleVerifyEmail}>
                        <div className="form-group">
                          <label htmlFor="verification-email">
                            Email address *
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            id="verification-email"
                            value={verificationEmail}
                            autoComplete="email"
                            readOnly
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="verification-otp">
                            Verification code *
                          </label>
                          <OtpInput
                            value={verificationOtp}
                            onChange={setVerificationOtp}
                            disabled={isVerifying}
                            idPrefix="verification-otp"
                          />
                        </div>

                        {verificationError && (
                          <div
                            className="alert alert-danger"
                            role="alert"
                            aria-live="polite"
                          >
                            {verificationError}
                          </div>
                        )}

                        <div className="verification-form-footer form-footer d-flex flex-row align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <button
                              type="submit"
                              className="btn btn-outline-primary-2"
                              disabled={isVerifying || isLoading}
                            >
                              <span>
                                {isVerifying ? "VERIFYING..." : "ENTER"}
                              </span>
                              <i className="icon-long-arrow-right"></i>
                            </button>
                            <ResendOtpButton
                              email={verificationEmail}
                              initialCooldownSeconds={30}
                              disabled={isVerifying}
                              onResent={() => {
                                setVerificationOtp("");
                                setVerificationError(null);
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn-link"
                            onClick={handleEnterLater}
                            disabled={isVerifying || isLoading}
                          >
                            Enter later
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
