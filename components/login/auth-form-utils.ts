import { ApiClientError } from "@/lib/api/client";

export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARACTERS_PATTERN = /^\+?[0-9\s().-]+$/;

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value);
}

export function isValidPhoneNumber(value: string) {
  const digitCount = value.replace(/\D/g, "").length;
  return (
    PHONE_CHARACTERS_PATTERN.test(value) &&
    digitCount >= 9 &&
    digitCount <= 15
  );
}

export function getRequestErrorMessage(
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

export function focusFirstInvalidControl(form: HTMLFormElement) {
  window.requestAnimationFrame(() => {
    form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  });
}
