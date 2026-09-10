"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import PasswordField from "@/components/login/PasswordField";
import {
  focusFirstInvalidControl,
  getRequestErrorMessage,
  isValidEmail,
  type FieldErrors,
} from "@/components/login/auth-form-utils";
import { ApiClientError } from "@/lib/api/client";

type SignInField = "email" | "password";

export default function SignInForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SignInField>>({});

  const clearFieldError = (field: SignInField) => {
    setFormError(null);
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors;
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const nextFieldErrors: FieldErrors<SignInField> = {};

    if (!normalizedEmail) {
      nextFieldErrors.email = "Email address is required.";
    } else if (!isValidEmail(normalizedEmail)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextFieldErrors.password = "Password is required.";
    }

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      focusFirstInvalidControl(event.currentTarget);
      return;
    }

    try {
      const response = await login({ email: normalizedEmail, password });
      const isSeller = response.user?.roles.some(
        (role) => role.toLowerCase() === "seller",
      );
      router.replace(isSeller ? "/seller" : "/");
    } catch (error) {
      setFormError(
        error instanceof ApiClientError && error.status === 401
          ? "Incorrect email or password."
          : getRequestErrorMessage(error, "sign-in"),
      );
    }
  };

  return (
    <>
      <div className="auth-form-heading">
        <h1 id="signin-heading" tabIndex={-1}>
          Welcome back
        </h1>
        <p>Sign in to continue rescuing food from local stores.</p>
      </div>

      <form
        className="auth-form"
        aria-labelledby="signin-heading"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="form-group">
          <label htmlFor="signin-email">Email address *</label>
          <input
            type="email"
            className={`form-control${fieldErrors.email ? " auth-input-error" : ""}`}
            id="signin-email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "signin-email-error" : undefined
            }
            required
          />
          {fieldErrors.email && (
            <small
              id="signin-email-error"
              className="auth-field-error"
              role="alert"
            >
              {fieldErrors.email}
            </small>
          )}
        </div>

        <PasswordField
          id="signin-password"
          label="Password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(nextPassword) => {
            setPassword(nextPassword);
            clearFieldError("password");
          }}
          error={fieldErrors.password}
        />

        {formError && (
          <div className="alert alert-danger" role="alert" aria-live="polite">
            {formError}
          </div>
        )}

        <div className="form-footer auth-form-footer auth-login-footer">
          <button
            type="submit"
            className="btn btn-outline-primary-2 auth-submit-button"
            disabled={isLoading}
          >
            <span>{isLoading ? "SIGNING IN..." : "SIGN IN"}</span>
            <i className="icon-long-arrow-right" aria-hidden="true" />
          </button>

          <a href="#" className="forgot-link">
            Forgot Your Password?
          </a>
        </div>
      </form>
    </>
  );
}
