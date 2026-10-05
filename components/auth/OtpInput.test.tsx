import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import OtpInput from "./OtpInput";

describe("OtpInput", () => {
  it("should render six OTP inputs and display the provided value", () => {
    const onChange = vi.fn();
    render(
      <OtpInput
        value="123456"
        onChange={onChange}
        idPrefix="verification-code"
      />,
    );
    const inputs = screen.getAllByRole("textbox", {
      name: /verification code digit/i,
    });

    expect(inputs).toHaveLength(6);
    expect(inputs.map((input) => (input as HTMLInputElement).value)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
    ]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("should call onChange when a numeric digit is entered", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <OtpInput value="" onChange={onChange} idPrefix="verification-code" />,
    );
    const firstInput = screen.getByRole("textbox", {
      name: "Verification code digit 1",
    });

    await user.click(firstInput);
    await user.keyboard("7");

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("7     ");
  });

  it("should reject non-numeric input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <OtpInput value="" onChange={onChange} idPrefix="verification-code" />,
    );
    const firstInput = screen.getByRole("textbox", {
      name: "Verification code digit 1",
    });

    await user.click(firstInput);
    await user.keyboard("a");

    expect(firstInput).toHaveValue("");
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("      ");
  });

  it("should replace an existing digit with the newly entered digit", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <OtpInput
        value="1     "
        onChange={onChange}
        idPrefix="verification-code"
      />,
    );
    const firstInput = screen.getByRole("textbox", {
      name: "Verification code digit 1",
    });

    expect(firstInput).toHaveValue("1");

    await user.click(firstInput);
    await user.keyboard("2");

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("2     ");
  });

  it("should move focus to the next input after entering a digit", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <OtpInput value="" onChange={onChange} idPrefix="verification-code" />,
    );
    const firstInput = screen.getByRole("textbox", {
      name: "Verification code digit 1",
    });
    const secondInput = screen.getByRole("textbox", {
      name: "Verification code digit 2",
    });

    await user.click(firstInput);
    await user.keyboard("1");

    await waitFor(() => {
      expect(secondInput).toHaveFocus();
    });
  });

  it("should move focus to the previous input when Backspace is pressed on an empty input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <OtpInput
        value="1     "
        onChange={onChange}
        idPrefix="verification-code"
      />,
    );
    const firstInput = screen.getByRole("textbox", {
      name: "Verification code digit 1",
    });
    const secondInput = screen.getByRole("textbox", {
      name: "Verification code digit 2",
    });

    await user.click(secondInput);
    await user.keyboard("{Backspace}");

    await waitFor(() => {
      expect(firstInput).toHaveFocus();
    });
  });

  it("should clear the current digit when Delete is pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <OtpInput
        value="1     "
        onChange={onChange}
        idPrefix="verification-code"
      />,
    );
    const firstInput = screen.getByRole("textbox", {
      name: "Verification code digit 1",
    });

    await user.click(firstInput);
    await user.keyboard("{Delete}");

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("      ");
  });

  it("should navigate between inputs using ArrowLeft, ArrowRight, Home and End", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <OtpInput
        value="      "
        onChange={onChange}
        idPrefix="verification-code"
      />,
    );
    const firstInput = screen.getByRole("textbox", {
      name: "Verification code digit 1",
    });
    const secondInput = screen.getByRole("textbox", {
      name: "Verification code digit 2",
    });
    const thirdInput = screen.getByRole("textbox", {
      name: "Verification code digit 3",
    });
    const sixthInput = screen.getByRole("textbox", {
      name: "Verification code digit 6",
    });

    await user.click(thirdInput);
    await user.keyboard("{ArrowLeft}");

    expect(secondInput).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(thirdInput).toHaveFocus();

    await user.keyboard("{End}");

    expect(sixthInput).toHaveFocus();

    await user.keyboard("{Home}");

    expect(firstInput).toHaveFocus();
  });

  it("should paste only numeric characters and limit the result to six digits", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <OtpInput value="" onChange={onChange} idPrefix="verification-code" />,
    );
    const firstInput = screen.getByRole("textbox", {
      name: "Verification code digit 1",
    });

    await user.click(firstInput);
    await user.paste("1a2b3c4d5e6f7");

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("123456");
  });

  it("should apply disabled, invalid and accessibility attributes correctly", () => {
    const onChange = vi.fn();
    render(
      <>
        <h2 id="otp-label">Enter verification code</h2>
        <p id="otp-description">Enter the six-digit code from your email.</p>
        <OtpInput
          value=""
          onChange={onChange}
          idPrefix="verification-code"
          disabled
          invalid
          ariaLabelledBy="otp-label"
          ariaDescribedBy="otp-description"
        />
      </>,
    );

    const group = screen.getByRole("group", {
      name: "Enter verification code",
    });
    const inputs = screen.getAllByRole("textbox", {
      name: /verification code digit/i,
    });

    expect(group).toHaveAttribute("aria-labelledby", "otp-label");
    expect(group).toHaveAttribute("aria-describedby", "otp-description");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });
});
