"use client";

import { useState, type SubmitEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import PasswordField from "@/components/login/PasswordField";
import PrivacyPolicyDialog from "@/components/login/PrivacyPolicyDialog";
import {
  focusFirstInvalidControl,
  getRequestErrorMessage,
  isValidEmail,
  isValidPhoneNumber,
  type FieldErrors,
} from "@/components/login/auth-form-utils";
import { ApiClientError } from "@/lib/api/client";
import { BRAND_NAME } from "@/lib/brand";

type RegisterField =
  | "firstName"
  | "lastName"
  | "email"
  | "password"
  | "confirmPassword"
  | "phone"
  | "policy";

type RegisterFormProps = {
  onVerificationRequired: (email: string) => void;
  onSignInRequested: () => void;
};

export default function RegisterForm({
  onVerificationRequired,
  onSignInRequested,
}: RegisterFormProps) {
  const { register, isLoading } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<RegisterField>
  >({});

  const clearFieldError = (field: RegisterField) => {
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

    const registrationForm = event.currentTarget;
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedEmail = email.trim().toLowerCase();
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
    } else if (!isValidEmail(normalizedEmail)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextFieldErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextFieldErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      nextFieldErrors.confirmPassword = "Confirm your password.";
    } else if (password !== confirmPassword) {
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

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      focusFirstInvalidControl(registrationForm);
      return;
    }

    try {
      const response = await register({
        email: normalizedEmail,
        password,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        phone: normalizedPhone,
      });

      if (!response.requiresEmailVerification) {
        onSignInRequested();
        return;
      }

      onVerificationRequired(normalizedEmail);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          email: "An account with this email address already exists.",
        }));
        window.requestAnimationFrame(() => {
          registrationForm
            .querySelector<HTMLInputElement>("#register-email")
            ?.focus();
        });
        return;
      }

      setFormError(getRequestErrorMessage(error, "registration"));
    }
  };

  return (
    <>
      <div className="auth-form-heading">
        <h1 id="register-heading" tabIndex={-1}>
          Create your account
        </h1>
        <p>Join {BRAND_NAME} and discover surprise bags near you.</p>
      </div>

      <form
        className="auth-form"
        aria-labelledby="register-heading"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
              <label htmlFor="register-first-name">First name *</label>
              <input
                type="text"
                className={`form-control${fieldErrors.firstName ? " auth-input-error" : ""}`}
                id="register-first-name"
                name="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => {
                  setFirstName(event.target.value);
                  clearFieldError("firstName");
                }}
                aria-invalid={Boolean(fieldErrors.firstName)}
                aria-describedby={
                  fieldErrors.firstName
                    ? "register-first-name-error"
                    : undefined
                }
                required
              />
              {fieldErrors.firstName && (
                <small
                  id="register-first-name-error"
                  className="auth-field-error"
                  role="alert"
                >
                  {fieldErrors.firstName}
                </small>
              )}
            </div>
          </div>

          <div className="col-sm-6">
            <div className="form-group">
              <label htmlFor="register-last-name">Last name *</label>
              <input
                type="text"
                className={`form-control${fieldErrors.lastName ? " auth-input-error" : ""}`}
                id="register-last-name"
                name="lastName"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => {
                  setLastName(event.target.value);
                  clearFieldError("lastName");
                }}
                aria-invalid={Boolean(fieldErrors.lastName)}
                aria-describedby={
                  fieldErrors.lastName
                    ? "register-last-name-error"
                    : undefined
                }
                required
              />
              {fieldErrors.lastName && (
                <small
                  id="register-last-name-error"
                  className="auth-field-error"
                  role="alert"
                >
                  {fieldErrors.lastName}
                </small>
              )}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="register-email">Your email address *</label>
          <input
            type="email"
            className={`form-control${fieldErrors.email ? " auth-input-error" : ""}`}
            id="register-email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "register-email-error" : undefined
            }
            required
          />
          {fieldErrors.email && (
            <small
              id="register-email-error"
              className="auth-field-error"
              role="alert"
            >
              {fieldErrors.email}
            </small>
          )}
        </div>

        <PasswordField
          id="register-password"
          label="Password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(nextPassword) => {
            setPassword(nextPassword);
            clearFieldError("password");
            clearFieldError("confirmPassword");
          }}
          error={fieldErrors.password}
          hint="Use at least 8 characters."
          minLength={8}
        />

        <PasswordField
          id="register-confirm-password"
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(nextPassword) => {
            setConfirmPassword(nextPassword);
            clearFieldError("confirmPassword");
          }}
          error={fieldErrors.confirmPassword}
          minLength={8}
        />

        <div className="form-group">
          <label htmlFor="register-phone">Phone number *</label>
          <input
            type="tel"
            className={`form-control${fieldErrors.phone ? " auth-input-error" : ""}`}
            id="register-phone"
            name="phone"
            autoComplete="tel"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              clearFieldError("phone");
            }}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={
              fieldErrors.phone ? "register-phone-error" : undefined
            }
            required
          />
          {fieldErrors.phone && (
            <small
              id="register-phone-error"
              className="auth-field-error"
              role="alert"
            >
              {fieldErrors.phone}
            </small>
          )}
        </div>

        {formError && (
          <div className="alert alert-danger" role="alert" aria-live="polite">
            {formError}
          </div>
        )}

        <div className="form-footer auth-form-footer auth-register-footer">
          <button
            type="submit"
            className="btn btn-outline-primary-2 auth-submit-button"
            disabled={isLoading}
          >
            <span>{isLoading ? "REGISTERING..." : "REGISTER"}</span>
            <i className="icon-long-arrow-right" aria-hidden="true" />
          </button>

          <div className="custom-control custom-checkbox auth-policy-control">
            <input
              type="checkbox"
              className="custom-control-input"
              id="register-policy"
              checked={hasAcceptedPolicy}
              onChange={(event) => {
                setHasAcceptedPolicy(event.target.checked);
                clearFieldError("policy");
              }}
              aria-invalid={Boolean(fieldErrors.policy)}
              aria-describedby={
                fieldErrors.policy ? "register-policy-error" : undefined
              }
              aria-label="I agree to the Privacy Policy"
              required
            />
            <label className="custom-control-label" htmlFor="register-policy">
              I agree to the
            </label>
            <button
              type="button"
              className="auth-policy-link"
              onClick={() => setIsPolicyOpen(true)}
            >
              Privacy Policy
            </button>
            <span className="auth-required-mark" aria-hidden="true">
              *
            </span>
            {fieldErrors.policy && (
              <small
                id="register-policy-error"
                className="auth-field-error"
                role="alert"
              >
                {fieldErrors.policy}
              </small>
            )}
          </div>
        </div>
      </form>

      {isPolicyOpen && (
        <PrivacyPolicyDialog onClose={() => setIsPolicyOpen(false)} />
      )}
    </>
  );
}
