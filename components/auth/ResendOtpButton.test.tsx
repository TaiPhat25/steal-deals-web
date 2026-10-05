import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ResendOtpButton from "./ResendOtpButton";
import userEvent from "@testing-library/user-event";
import { ApiClientError } from "@/lib/api/client";

const mocks = vi.hoisted(() => ({
  resendVerificationOtp: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  resendVerificationOtp: mocks.resendVerificationOtp,
}));

describe("ResendOtpButton", () => {
  beforeEach(() => {
    mocks.resendVerificationOtp.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render an enabled Resend OTP button when there is no cooldown", () => {
    const onResent = vi.fn();
    render(<ResendOtpButton email="ready@example.com" onResent={onResent} />);
    const resendButton = screen.getByRole("button", { name: "Resend OTP" });

    expect(resendButton).toBeVisible();
    expect(resendButton).toBeEnabled();
    expect(mocks.resendVerificationOtp).not.toHaveBeenCalled();
    expect(onResent).not.toHaveBeenCalled();
  });

  it("should display the initial cooldown and disable the button", () => {
    const onResent = vi.fn();
    render(
      <ResendOtpButton
        email="cooldown@example.com"
        initialCooldownSeconds={10}
        onResent={onResent}
      />,
    );
    const resendButton = screen.getByRole("button", {
      name: "Resend OTP (10)",
    });

    expect(resendButton).toBeVisible();
    expect(resendButton).toBeDisabled();
    expect(mocks.resendVerificationOtp).not.toHaveBeenCalled();
    expect(onResent).not.toHaveBeenCalled();
  });

  it("should decrease the cooldown every second and enable the button at zero", () => {
    vi.useFakeTimers();
    const onResent = vi.fn();
    render(
      <ResendOtpButton
        email="countdown@example.com"
        initialCooldownSeconds={3}
        onResent={onResent}
      />,
    );
    const resendButton = screen.getByRole("button", {
      name: "Resend OTP (3)",
    });

    expect(resendButton).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(resendButton).toHaveTextContent("Resend OTP (2)");
    expect(resendButton).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(resendButton).toHaveTextContent("Resend OTP (1)");
    expect(resendButton).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(resendButton).toHaveTextContent(/^Resend OTP$/);
    expect(resendButton).toBeEnabled();
  });

  it("should call the resend API with the provided email", async () => {
    const user = userEvent.setup();
    const onResent = vi.fn();
    render(<ResendOtpButton email="callapi@example.com" onResent={onResent} />);
    const resendButton = screen.getByRole("button", { name: "Resend OTP" });

    await user.click(resendButton);

    expect(mocks.resendVerificationOtp).toHaveBeenCalledOnce();
    expect(mocks.resendVerificationOtp).toHaveBeenCalledWith({
      email: "callapi@example.com",
    });
  });

  it("should display a loading state and prevent duplicate requests while resending", async () => {
    const user = userEvent.setup();
    const onResent = vi.fn();
    let resolveRequest!: () => void;
    const pendingRequest = new Promise<void>((resolve) => {
      resolveRequest = resolve;
    });

    mocks.resendVerificationOtp.mockReturnValueOnce(pendingRequest);

    render(<ResendOtpButton email="loading@example.com" onResent={onResent} />);
    const resendButton = screen.getByRole("button", { name: "Resend OTP" });

    await user.click(resendButton);

    expect(resendButton).toHaveTextContent("Resending OTP...");
    expect(resendButton).toBeDisabled();
    expect(mocks.resendVerificationOtp).toHaveBeenCalledOnce();

    await user.click(resendButton);

    expect(mocks.resendVerificationOtp).toHaveBeenCalledOnce();

    resolveRequest();

    await waitFor(() => {
      expect(onResent).toHaveBeenCalledOnce();
    });
  });

  it("should call onResent and start a new cooldown after a successful resend", async () => {
    const user = userEvent.setup();
    const onResent = vi.fn();

    mocks.resendVerificationOtp.mockResolvedValueOnce(undefined);

    render(<ResendOtpButton email="success@example.com" onResent={onResent} />);
    const resendButton = screen.getByRole("button", { name: "Resend OTP" });

    await user.click(resendButton);

    await waitFor(() => {
      expect(onResent).toHaveBeenCalledOnce();
      expect(resendButton).toHaveTextContent(/^Resend OTP \(30\)$/);
      expect(resendButton).toBeDisabled();
    });
    expect(mocks.resendVerificationOtp).toHaveBeenCalledOnce();
  });

  it("should display the API error message when resending fails", async () => {
    mocks.resendVerificationOtp.mockRejectedValueOnce(
      new ApiClientError(
        429,
        "Too many resend attempts. Please try again later.",
      ),
    );

    const user = userEvent.setup();
    const onResent = vi.fn();
    render(<ResendOtpButton email="error@example.com" onResent={onResent} />);
    const resendButton = screen.getByRole("button", { name: "Resend OTP" });

    await user.click(resendButton);

    const errorMessage = await screen.findByRole("alert");

    expect(errorMessage).toHaveTextContent(
      "Too many resend attempts. Please try again later.",
    );
    expect(mocks.resendVerificationOtp).toHaveBeenCalledOnce();
    expect(onResent).not.toHaveBeenCalled();
  });

  it("should display the fallback error message for an unexpected failure", async () => {
    mocks.resendVerificationOtp.mockRejectedValueOnce(
      new Error("Network failure"),
    );

    const user = userEvent.setup();
    const onResent = vi.fn();
    render(
      <ResendOtpButton email="unexpected@example.com" onResent={onResent} />,
    );
    const resendButton = screen.getByRole("button", { name: "Resend OTP" });

    await user.click(resendButton);

    const errorMessage = await screen.findByRole("alert");
    expect(errorMessage).toHaveTextContent(
      "Unable to resend the verification code.",
    );
    expect(mocks.resendVerificationOtp).toHaveBeenCalledOnce();
    expect(onResent).not.toHaveBeenCalled();
  });

  it("should prevent resending when the component is disabled", async () => {
    const user = userEvent.setup();
    const onResent = vi.fn();
    render(
      <ResendOtpButton
        email="prevent@example.com"
        disabled
        onResent={onResent}
      />,
    );
    const resendButton = screen.getByRole("button", { name: "Resend OTP" });

    await user.click(resendButton);

    expect(resendButton).toBeDisabled();
    expect(mocks.resendVerificationOtp).not.toHaveBeenCalled();
    expect(onResent).not.toHaveBeenCalled();
  });

  it("should prevent resending when the email is empty", async () => {
    const user = userEvent.setup();
    const onResent = vi.fn();
    render(<ResendOtpButton email="" onResent={onResent} />);
    const resendButton = screen.getByRole("button", { name: "Resend OTP" });

    await user.click(resendButton);

    expect(mocks.resendVerificationOtp).not.toHaveBeenCalled();
    expect(onResent).not.toHaveBeenCalled();
  });
});
