"use client";

import { useState } from "react";

type PasswordFieldProps = {
  id: string;
  label: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  minLength?: number;
};

export default function PasswordField({
  id,
  label,
  name,
  autoComplete,
  value,
  onChange,
  error,
  hint,
  minLength,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const hintId = hint ? `${id}-requirements` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="form-group">
      <label htmlFor={id}>{label} *</label>
      <div className="auth-password-field">
        <input
          type={isVisible ? "text" : "password"}
          className={`form-control${error ? " auth-input-error" : ""}`}
          id={id}
          name={name}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          minLength={minLength}
          required
        />
        <button
          type="button"
          className="auth-password-toggle"
          onClick={() => setIsVisible((currentValue) => !currentValue)}
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={isVisible}
          title={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          <i
            className={`la ${isVisible ? "la-eye-slash" : "la-eye"}`}
            aria-hidden="true"
          />
        </button>
      </div>
      {hint && (
        <small id={hintId} className="auth-field-hint">
          {hint}
        </small>
      )}
      {error && (
        <small id={errorId} className="auth-field-error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
