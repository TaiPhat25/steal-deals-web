"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

const OTP_LENGTH = 6;

function serializeDigits(digits: string[]) {
  return digits.map((digit) => digit || " ").join("").slice(0, OTP_LENGTH);
}

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  idPrefix: string;
};

export default function OtpInput({ value, onChange, disabled = false, idPrefix }: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => {
    const digit = value[index] ?? "";
    return digit === " " ? "" : digit;
  });

  const focusInput = (index: number, select = false) => {
    const input = inputRefs.current[index];
    input?.focus();

    if (select) {
      input?.select();
    }
  };

  const handleChange = (index: number, inputValue: string) => {
    const digit = inputValue.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    const nextValue = serializeDigits(nextDigits);

    onChange(nextValue);

    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1, true);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (/^\d$/.test(event.key)) {
      event.preventDefault();

      const nextDigits = [...digits];
      nextDigits[index] = event.key;
      onChange(serializeDigits(nextDigits));

      if (index < OTP_LENGTH - 1) {
        window.requestAnimationFrame(() => focusInput(index + 1, true));
      }

      return;
    }

    if (event.key === "Backspace") {
      if (!digits[index] && index > 0) {
        event.preventDefault();
        focusInput(index - 1, true);
      }

      return;
    }

    if (event.key === "Delete") {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      onChange(serializeDigits(nextDigits));
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1, true);
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1, true);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (!pastedDigits) return;

    const startIndex = inputRefs.current.findIndex((input) => input === document.activeElement);
    const targetIndex = startIndex < 0 ? 0 : startIndex;
    const nextDigits = [...digits];

    pastedDigits.split("").forEach((digit, offset) => {
      if (targetIndex + offset < OTP_LENGTH) {
        nextDigits[targetIndex + offset] = digit;
      }
    });

    onChange(serializeDigits(nextDigits));
    focusInput(Math.min(targetIndex + pastedDigits.length, OTP_LENGTH - 1), true);
  };

  return (
    <div className="otp-inputs" role="group" aria-label="Verification code">
      {Array.from({ length: OTP_LENGTH }, (_, index) => (
        <input
          key={`${idPrefix}-${index}`}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          className="form-control otp-input"
          id={`${idPrefix}-${index + 1}`}
          value={digits[index] === " " ? "" : digits[index] ?? ""}
          onChange={(event) => handleChange(index, event.target.value)}
          onFocus={(event) => event.currentTarget.select()}
          onClick={(event) => event.currentTarget.select()}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          aria-label={`Verification code digit ${index + 1}`}
          disabled={disabled}
          autoComplete={index === 0 ? "one-time-code" : "off"}
        />
      ))}
    </div>
  );
}
