import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPasswordMain from "./ForgotPasswordMain";
import { ApiClientError } from "@/lib/api/client";

const mocks = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
}));

vi.mock("@/lib/api/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/auth")>();

  return {
    ...actual,
    requestPasswordReset: mocks.requestPasswordReset,
    resetPassword: mocks.resetPassword,
  };
});

function renderForgotPasswordMain() {
  render(<ForgotPasswordMain />);
}

describe("ForgotPasswordMain", () => {
  beforeEach(() => {
    mocks.requestPasswordReset.mockReset();
    mocks.resetPassword.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should require an email address", async () => {
    const user = userEvent.setup();
    renderForgotPasswordMain();
    const sendResetCodeButton = screen.getByRole("button", {
      name: "SEND RESET CODE",
    });

    await user.click(sendResetCodeButton);

    expect(screen.getByText("Email address is required.")).toBeVisible();
    expect(mocks.requestPasswordReset).not.toHaveBeenCalled();
    expect(mocks.resetPassword).not.toHaveBeenCalled();
  });

  it("should reject an invalid email address", async () => {
    const user = userEvent.setup();
    renderForgotPasswordMain();
    const emailInput = screen.getByLabelText("Email address *");
    const sendResetCodeButton = screen.getByRole("button", {
      name: "SEND RESET CODE",
    });

    await user.type(emailInput, "john");
    await user.click(sendResetCodeButton);

    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
    expect(mocks.requestPasswordReset).not.toHaveBeenCalled();
    expect(mocks.resetPassword).not.toHaveBeenCalled();
  });

  it("should request a reset code with a normalized email", async () => {
    mocks.requestPasswordReset.mockResolvedValueOnce({
      message: "Reset code sent.",
    });

    const user = userEvent.setup();
    renderForgotPasswordMain();
    const emailInput = screen.getByLabelText("Email address *");
    const sendResetCodeButton = screen.getByRole("button", {
      name: "SEND RESET CODE",
    });

    await user.type(emailInput, " John@Kenworth.COM ");
    await user.click(sendResetCodeButton);

    const enterResetCodeHeading = await screen.findByRole("heading", {
      name: "Enter your reset code",
    });

    expect(mocks.requestPasswordReset).toHaveBeenCalledOnce();
    expect(mocks.requestPasswordReset).toHaveBeenCalledWith({
      email: "john@kenworth.com",
    });
    expect(mocks.resetPassword).not.toHaveBeenCalled();
    expect(enterResetCodeHeading).toBeVisible();
    expect(screen.getByText("john@kenworth.com")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Reset code sent.");
  });

  it("should show an error when requesting a reset code fails", async () => {
    mocks.requestPasswordReset.mockRejectedValueOnce(
      new ApiClientError(500, "Internal server error."),
    );

    const user = userEvent.setup();
    renderForgotPasswordMain();
    const resetPasswordHeading = screen.getByRole("heading", {
      name: "Reset your password",
    });
    const emailInput = screen.getByLabelText("Email address *");
    const sendResetCodeButton = screen.getByRole("button", {
      name: "SEND RESET CODE",
    });

    await user.type(emailInput, "john@kenworth.com");
    await user.click(sendResetCodeButton);

    expect(
      await screen.findByText(
        "The password reset service is temporarily unavailable. Please try again later.",
      ),
    ).toBeVisible();
    expect(mocks.requestPasswordReset).toHaveBeenCalledOnce();
    expect(mocks.resetPassword).not.toHaveBeenCalled();
    expect(resetPasswordHeading).toBeVisible();
  });

  it("should reject invalid reset details", async () => {
    mocks.requestPasswordReset.mockResolvedValueOnce({
      message: "Reset code sent.",
    });

    const user = userEvent.setup();
    renderForgotPasswordMain();
    const emailInput = screen.getByLabelText("Email address *");
    const sendResetCodeButton = screen.getByRole("button", {
      name: "SEND RESET CODE",
    });

    await user.type(emailInput, "john@kenworth.com");
    await user.click(sendResetCodeButton);

    const enterResetCodeHeading = await screen.findByRole("heading", {
      name: "Enter your reset code",
    });
    const otpInputs = screen.getAllByRole("textbox", {
      name: /Verification code digit/i,
    });
    const newPasswordInput = screen.getByLabelText("New password *");
    const confirmPasswordInput = screen.getByLabelText(
      "Confirm new password *",
    );
    const resetPasswordButton = screen.getByRole("button", {
      name: "RESET PASSWORD",
    });

    for (let i = 0; i < 5; i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    await user.type(newPasswordInput, "example");
    await user.type(confirmPasswordInput, "example123");
    await user.click(resetPasswordButton);

    expect(enterResetCodeHeading).toBeVisible();
    expect(screen.getByText("Enter the six-digit reset code.")).toBeVisible();
    expect(
      screen.getByText("Use at least 8 characters.", {
        selector: ".auth-field-error",
      }),
    ).toBeVisible();
    expect(screen.getByText("Passwords do not match.")).toBeVisible();
    await waitFor(() => {
      expect(otpInputs[0]).toHaveFocus();
    });
    expect(mocks.requestPasswordReset).toHaveBeenCalledOnce();
    expect(mocks.resetPassword).not.toHaveBeenCalled();
  });

  it("should reset the password and show the success stage", async () => {
    mocks.requestPasswordReset.mockResolvedValueOnce({
      message: "Reset code sent.",
    });
    mocks.resetPassword.mockResolvedValueOnce({
      message: "Password reset successfully.",
    });

    const user = userEvent.setup();
    renderForgotPasswordMain();
    const emailInput = screen.getByLabelText("Email address *");
    const sendResetCodeButton = screen.getByRole("button", {
      name: "SEND RESET CODE",
    });

    await user.type(emailInput, "john@kenworth.com");
    await user.click(sendResetCodeButton);

    const otpInputs = await screen.findAllByRole("textbox", {
      name: /Verification code digit/i,
    });
    const newPasswordInput = screen.getByLabelText("New password *");
    const confirmPasswordInput = screen.getByLabelText(
      "Confirm new password *",
    );
    const resetPasswordButton = screen.getByRole("button", {
      name: "RESET PASSWORD",
    });

    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    await user.type(newPasswordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(resetPasswordButton);

    expect(mocks.resetPassword).toHaveBeenCalledOnce();
    expect(mocks.resetPassword).toHaveBeenCalledWith({
      email: "john@kenworth.com",
      otp: "123456",
      newPassword: "password123",
    });
    expect(
      await screen.findByRole("heading", { name: "Password updated" }),
    ).toBeVisible();
  });

  it("should show the invalid-or-expired message after a 400 response", async () => {
    mocks.requestPasswordReset.mockResolvedValueOnce({
      message: "Reset code sent.",
    });
    mocks.resetPassword.mockRejectedValueOnce(
      new ApiClientError(400, "Invalid or expired code."),
    );

    const user = userEvent.setup();
    renderForgotPasswordMain();
    const emailInput = screen.getByLabelText("Email address *");
    const sendResetCodeButton = screen.getByRole("button", {
      name: "SEND RESET CODE",
    });

    await user.type(emailInput, "john@kenworth.com");
    await user.click(sendResetCodeButton);

    const otpInputs = await screen.findAllByRole("textbox", {
      name: /Verification code digit/i,
    });
    const newPasswordInput = screen.getByLabelText("New password *");
    const confirmPasswordInput = screen.getByLabelText(
      "Confirm new password *",
    );
    const resetPasswordButton = screen.getByRole("button", {
      name: "RESET PASSWORD",
    });

    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    await user.type(newPasswordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(resetPasswordButton);

    expect(mocks.resetPassword).toHaveBeenCalledOnce();
    expect(
      await screen.findByText(
        "The reset code is invalid or expired. Request a new code and try again.",
      ),
    ).toBeVisible();
    await waitFor(() => {
      expect(otpInputs[0]).toHaveFocus();
    });
  });

  it("should disable reset controls while the request is pending", async () => {
    mocks.requestPasswordReset.mockResolvedValueOnce({
      message: "Reset code sent.",
    });
    mocks.resetPassword.mockImplementationOnce(
      () => new Promise<void>(() => {}),
    );

    const user = userEvent.setup();
    renderForgotPasswordMain();
    const emailInput = screen.getByLabelText("Email address *");
    const sendResetCodeButton = screen.getByRole("button", {
      name: "SEND RESET CODE",
    });

    await user.type(emailInput, "john@kenworth.com");
    await user.click(sendResetCodeButton);

    const otpInputs = await screen.findAllByRole("textbox", {
      name: /Verification code digit/i,
    });
    const newPasswordInput = screen.getByLabelText("New password *");
    const confirmPasswordInput = screen.getByLabelText(
      "Confirm new password *",
    );
    const resetPasswordButton = screen.getByRole("button", {
      name: "RESET PASSWORD",
    });
    const useDifferentEmailButton = screen.getByRole("button", {
      name: "Use a different email",
    });

    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    await user.type(newPasswordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(resetPasswordButton);

    const resettingButton = screen.getByRole("button", {
      name: "RESETTING...",
    });

    expect(resettingButton).toBeDisabled();
    otpInputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
    expect(newPasswordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();
    expect(useDifferentEmailButton).toBeDisabled();
    expect(mocks.resetPassword).toHaveBeenCalledOnce();
  });

  it("should resend the reset code after the cooldown expires", async () => {
    vi.useFakeTimers();
    mocks.requestPasswordReset
      .mockResolvedValueOnce({
        message: "Reset code sent.",
      })
      .mockResolvedValueOnce({
        message: "A new reset code was sent.",
      });

    renderForgotPasswordMain();
    const emailInput = screen.getByLabelText("Email address *");
    const sendResetCodeButton = screen.getByRole("button", {
      name: "SEND RESET CODE",
    });

    fireEvent.change(emailInput, { target: { value: "john@kenworth.com" } });
    await act(async () => {
      fireEvent.click(sendResetCodeButton);
      await Promise.resolve();
    });

    const sendAgainButton = screen.getByRole("button", {
      name: "Send again in 60s",
    });

    expect(sendAgainButton).toBeDisabled();

    for (let s = 0; s < 60; s++) {
      act(() => {
        vi.advanceTimersByTime(1_000);
      });
    }

    const resendButton = screen.getByRole("button", {
      name: "Send another code",
    });

    expect(resendButton).toBeEnabled();

    await act(async () => {
      fireEvent.click(resendButton);
      await Promise.resolve();
    });

    expect(mocks.requestPasswordReset).toHaveBeenCalledTimes(2);
    expect(mocks.requestPasswordReset).toHaveBeenNthCalledWith(2, {
      email: "john@kenworth.com",
    });
    expect(screen.getByText("A new reset code was sent.")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Send again in 60s" }),
    ).toBeDisabled();
  });

  it("should return to the email stage when Use a different email is clicked", async () => {
    mocks.requestPasswordReset.mockResolvedValueOnce({
      message: "Reset code sent.",
    });

    const user = userEvent.setup();
    renderForgotPasswordMain();
    const emailInput = screen.getByLabelText("Email address *");
    const sendResetCodeButton = screen.getByRole("button", {
      name: "SEND RESET CODE",
    });

    await user.type(emailInput, "john@kenworth.com");
    await user.click(sendResetCodeButton);

    const enterResetCodeHeading = await screen.findByRole("heading", {
      name: "Enter your reset code",
    });
    const useDifferentEmailButton = screen.getByRole("button", {
      name: "Use a different email",
    });

    await user.click(useDifferentEmailButton);

    const resetPasswordHeading = screen.getByRole("heading", {
      name: "Reset your password",
    });
    const returnedEmailInput = screen.getByLabelText("Email address *");

    expect(resetPasswordHeading).toBeVisible();
    expect(returnedEmailInput).toHaveValue("john@kenworth.com");
    await waitFor(() => {
      expect(returnedEmailInput).toHaveFocus();
    });
    expect(enterResetCodeHeading).not.toBeInTheDocument();
    expect(screen.queryByText("Reset code sent.")).not.toBeInTheDocument();
    expect(mocks.resetPassword).not.toHaveBeenCalled();
  });
});
