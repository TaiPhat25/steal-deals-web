import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmailVerificationDialog from "./EmailVerificationDialog";
import { ApiClientError } from "@/lib/api/client";

const mocks = vi.hoisted(() => ({
  verifyEmail: vi.fn(),
}));

vi.mock("@/lib/api/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/auth")>();

  return {
    ...actual,
    verifyEmail: mocks.verifyEmail,
  };
});

function renderEmailVerificationDialog(email = "john@kenworth.com") {
  const onExit = vi.fn();
  render(<EmailVerificationDialog email={email} onExit={onExit} />);

  return { onExit };
}

describe("EmailVerificationDialog", () => {
  beforeEach(() => {
    mocks.verifyEmail.mockReset();
  });

  it("should render the supplied email as read-only", () => {
    renderEmailVerificationDialog();
    const emailInput = screen.getByLabelText("Email address *");

    expect(emailInput).toBeVisible();
    expect(emailInput).toHaveValue("john@kenworth.com");
    expect(emailInput).toHaveAttribute("readonly");
  });

  it("should render six verification-code inputs", () => {
    renderEmailVerificationDialog();
    const otpInputs = screen.getAllByRole("textbox", {
      name: /Verification code digit/i,
    });

    expect(otpInputs).toHaveLength(6);
    otpInputs.forEach((input, index) => {
      expect(input).toBeVisible();
      expect(input).toHaveAccessibleName(
        `Verification code digit ${index + 1}`,
      );
      expect(input).toHaveAttribute("maxlength", "1");
      expect(input).toHaveAttribute("inputmode", "numeric");
    });
  });

  it("should reject an incomplete verification code", async () => {
    const user = userEvent.setup();
    renderEmailVerificationDialog();
    const otpInputs = screen.getAllByRole("textbox", {
      name: /Verification code digit/i,
    });
    const enterButton = screen.getByRole("button", { name: "ENTER" });

    for (let i = 0; i < 5; i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    await user.click(enterButton);

    expect(
      screen.getByText("Please enter the 6-digit verification code."),
    ).toBeVisible();
    expect(mocks.verifyEmail).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(otpInputs[0]).toHaveFocus();
    });
  });

  it("should verify a valid code and close the dialog", async () => {
    mocks.verifyEmail.mockResolvedValueOnce(undefined);

    const user = userEvent.setup();
    const { onExit } = renderEmailVerificationDialog();
    const otpInputs = screen.getAllByRole("textbox", {
      name: /Verification code digit/i,
    });
    const enterButton = screen.getByRole("button", { name: "ENTER" });

    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    await user.click(enterButton);

    expect(mocks.verifyEmail).toHaveBeenCalledOnce();
    expect(mocks.verifyEmail).toHaveBeenCalledWith({
      email: "john@kenworth.com",
      otp: "123456",
    });
    await waitFor(() => {
      expect(onExit).toHaveBeenCalledOnce();
    });
  });

  it("should show the incorrect-or-expired message after a 400 response", async () => {
    mocks.verifyEmail.mockRejectedValueOnce(
      new ApiClientError(400, "Invalid verification code."),
    );

    const user = userEvent.setup();
    const { onExit } = renderEmailVerificationDialog();
    const otpInputs = screen.getAllByRole("textbox", {
      name: /Verification code digit/i,
    });
    const enterButton = screen.getByRole("button", { name: "ENTER" });

    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    await user.click(enterButton);

    expect(
      screen.getByText("The verification code is incorrect or expired."),
    ).toBeVisible();
    await waitFor(() => {
      expect(otpInputs[0]).toHaveFocus();
    });
    expect(onExit).not.toHaveBeenCalled();
  });

  it("should show the API message for another API error", async () => {
    mocks.verifyEmail.mockRejectedValueOnce(
      new ApiClientError(500, "Verification service is unavailable."),
    );

    const user = userEvent.setup();
    const { onExit } = renderEmailVerificationDialog();
    const otpInputs = screen.getAllByRole("textbox", {
      name: /Verification code digit/i,
    });
    const enterButton = screen.getByRole("button", { name: "ENTER" });

    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    await user.click(enterButton);

    expect(
      await screen.findByText("Verification service is unavailable."),
    ).toBeVisible();
    expect(onExit).not.toHaveBeenCalled();
  });

  it("should show the fallback message for an unexpected error", async () => {
    mocks.verifyEmail.mockRejectedValueOnce(new Error("Something went wrong."));

    const user = userEvent.setup();
    const { onExit } = renderEmailVerificationDialog();
    const otpInputs = screen.getAllByRole("textbox", {
      name: /Verification code digit/i,
    });
    const enterButton = screen.getByRole("button", { name: "ENTER" });

    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    await user.click(enterButton);

    expect(
      screen.getByText("Unable to verify your email. Please try again."),
    ).toBeVisible();
    expect(onExit).not.toHaveBeenCalled();
  });

  it("should disable dialog controls while verification is pending", async () => {
    mocks.verifyEmail.mockImplementationOnce(() => new Promise<void>(() => {}));

    const user = userEvent.setup();
    const { onExit } = renderEmailVerificationDialog();
    const otpInputs = screen.getAllByRole("textbox", {
      name: /Verification code digit/i,
    });
    const enterButton = screen.getByRole("button", { name: "ENTER" });
    const enterLaterButton = screen.getByRole("button", {
      name: "Enter later",
    });

    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    await user.click(enterButton);

    const verifyingButton = screen.getByRole("button", {
      name: "VERIFYING...",
    });

    expect(verifyingButton).toBeDisabled();
    otpInputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
    expect(enterLaterButton).toBeDisabled();
    expect(mocks.verifyEmail).toHaveBeenCalledOnce();
    expect(onExit).not.toHaveBeenCalled();
  });

  it("should exit without verification when Enter later is clicked", async () => {
    const user = userEvent.setup();
    const { onExit } = renderEmailVerificationDialog();

    const enterLaterButton = screen.getByRole("button", {
      name: "Enter later",
    });

    await user.click(enterLaterButton);

    expect(mocks.verifyEmail).not.toHaveBeenCalled();
    expect(onExit).toHaveBeenCalledOnce();
  });

  it("should prevent Escape from closing the dialog while verification is pending", async () => {
    mocks.verifyEmail.mockImplementationOnce(() => new Promise<void>(() => {}));

    const user = userEvent.setup();
    const { onExit } = renderEmailVerificationDialog();
    const otpInputs = screen.getAllByRole("textbox", {
      name: /Verification code digit/i,
    });
    const enterButton = screen.getByRole("button", { name: "ENTER" });

    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    await user.click(enterButton);

    const verifyingButton = screen.getByRole("button", {
      name: "VERIFYING...",
    });

    expect(verifyingButton).toBeDisabled();
    expect(mocks.verifyEmail).toHaveBeenCalledOnce();

    await user.keyboard("{Escape}");

    expect(onExit).not.toHaveBeenCalled();
  });
});
