import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterForm from "./RegisterForm";
import { ApiClientError } from "@/lib/api/client";

const mocks = vi.hoisted(() => ({
  register: vi.fn(),
  isLoading: false,
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    register: mocks.register,
    isLoading: mocks.isLoading,
  }),
}));

function renderRegisterForm() {
  const onVerificationRequired = vi.fn();
  const onSignInRequested = vi.fn();

  render(
    <RegisterForm
      onVerificationRequired={onVerificationRequired}
      onSignInRequested={onSignInRequested}
    />,
  );

  return {
    onVerificationRequired,
    onSignInRequested,
  };
}

describe("RegisterForm", () => {
  beforeEach(() => {
    mocks.register.mockReset();
    mocks.isLoading = false;

    mocks.register.mockResolvedValue({
      requiresEmailVerification: true,
    });
  });

  it("should show all required errors when submitted empty", async () => {
    const user = userEvent.setup();
    const { onVerificationRequired, onSignInRequested } = renderRegisterForm();
    const registerButton = screen.getByRole("button", { name: "REGISTER" });

    await user.click(registerButton);

    expect(screen.getByText("First name is required.")).toBeVisible();
    expect(screen.getByText("Last name is required.")).toBeVisible();
    expect(screen.getByText("Email address is required.")).toBeVisible();
    expect(screen.getByText("Password is required.")).toBeVisible();
    expect(screen.getByText("Confirm your password.")).toBeVisible();
    expect(screen.getByText("Phone number is required.")).toBeVisible();
    expect(
      screen.getByText("You must agree to the privacy policy."),
    ).toBeVisible();
    expect(mocks.register).not.toHaveBeenCalled();
    expect(onVerificationRequired).not.toHaveBeenCalled();
    expect(onSignInRequested).not.toHaveBeenCalled();
  });

  it("should reject an invalid email", async () => {
    const user = userEvent.setup();
    const { onVerificationRequired, onSignInRequested } = renderRegisterForm();
    const firstNameInput = screen.getByLabelText("First name *");
    const lastNameInput = screen.getByLabelText("Last name *");
    const emailInput = screen.getByLabelText("Your email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const confirmPasswordInput = screen.getByLabelText("Confirm password *");
    const phoneInput = screen.getByLabelText("Phone number *");
    const privacyCheckbox = screen.getByRole("checkbox", {
      name: "I agree to the Privacy Policy",
    });
    const registerButton = screen.getByRole("button", { name: "REGISTER" });

    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Kenworth");
    await user.type(emailInput, "john");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.type(phoneInput, "0123456789");
    await user.click(privacyCheckbox);
    await user.click(registerButton);

    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
    expect(mocks.register).not.toHaveBeenCalled();
    expect(onVerificationRequired).not.toHaveBeenCalled();
    expect(onSignInRequested).not.toHaveBeenCalled();
  });

  it("should reject a password shorter than eight characters", async () => {
    const user = userEvent.setup();
    const { onVerificationRequired, onSignInRequested } = renderRegisterForm();
    const firstNameInput = screen.getByLabelText("First name *");
    const lastNameInput = screen.getByLabelText("Last name *");
    const emailInput = screen.getByLabelText("Your email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const confirmPasswordInput = screen.getByLabelText("Confirm password *");
    const phoneInput = screen.getByLabelText("Phone number *");
    const privacyCheckbox = screen.getByRole("checkbox", {
      name: "I agree to the Privacy Policy",
    });
    const registerButton = screen.getByRole("button", { name: "REGISTER" });

    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Kenworth");
    await user.type(emailInput, "john@kenworth.com");
    await user.type(passwordInput, "example");
    await user.type(confirmPasswordInput, "example");
    await user.type(phoneInput, "0123456789");
    await user.click(privacyCheckbox);
    await user.click(registerButton);

    expect(
      screen.getByText("Password must be at least 8 characters."),
    ).toBeVisible();
    expect(mocks.register).not.toHaveBeenCalled();
    expect(onVerificationRequired).not.toHaveBeenCalled();
    expect(onSignInRequested).not.toHaveBeenCalled();
  });

  it("should reject a mismatched confirmation password", async () => {
    const user = userEvent.setup();
    const { onVerificationRequired, onSignInRequested } = renderRegisterForm();
    const firstNameInput = screen.getByLabelText("First name *");
    const lastNameInput = screen.getByLabelText("Last name *");
    const emailInput = screen.getByLabelText("Your email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const confirmPasswordInput = screen.getByLabelText("Confirm password *");
    const phoneInput = screen.getByLabelText("Phone number *");
    const privacyCheckbox = screen.getByRole("checkbox", {
      name: "I agree to the Privacy Policy",
    });
    const registerButton = screen.getByRole("button", { name: "REGISTER" });

    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Kenworth");
    await user.type(emailInput, "john@kenworth.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password234");
    await user.type(phoneInput, "0123456789");
    await user.click(privacyCheckbox);
    await user.click(registerButton);

    expect(screen.getByText("Passwords do not match.")).toBeVisible();
    expect(mocks.register).not.toHaveBeenCalled();
    expect(onVerificationRequired).not.toHaveBeenCalled();
    expect(onSignInRequested).not.toHaveBeenCalled();
  });

  it("should reject an invalid phone number", async () => {
    const user = userEvent.setup();
    const { onVerificationRequired, onSignInRequested } = renderRegisterForm();
    const firstNameInput = screen.getByLabelText("First name *");
    const lastNameInput = screen.getByLabelText("Last name *");
    const emailInput = screen.getByLabelText("Your email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const confirmPasswordInput = screen.getByLabelText("Confirm password *");
    const phoneInput = screen.getByLabelText("Phone number *");
    const privacyCheckbox = screen.getByRole("checkbox", {
      name: "I agree to the Privacy Policy",
    });
    const registerButton = screen.getByRole("button", { name: "REGISTER" });

    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Kenworth");
    await user.type(emailInput, "john@kenworth.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.type(phoneInput, "abcdefg");
    await user.click(privacyCheckbox);
    await user.click(registerButton);

    expect(
      screen.getByText("Enter a valid phone number containing 9 to 15 digits."),
    ).toBeVisible();
    expect(mocks.register).not.toHaveBeenCalled();
    expect(onVerificationRequired).not.toHaveBeenCalled();
    expect(onSignInRequested).not.toHaveBeenCalled();
  });

  it("should require acceptance of the privacy policy", async () => {
    const user = userEvent.setup();
    const { onVerificationRequired, onSignInRequested } = renderRegisterForm();
    const firstNameInput = screen.getByLabelText("First name *");
    const lastNameInput = screen.getByLabelText("Last name *");
    const emailInput = screen.getByLabelText("Your email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const confirmPasswordInput = screen.getByLabelText("Confirm password *");
    const phoneInput = screen.getByLabelText("Phone number *");
    const registerButton = screen.getByRole("button", { name: "REGISTER" });

    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Kenworth");
    await user.type(emailInput, "john@kenworth.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.type(phoneInput, "0123456789");
    await user.click(registerButton);

    expect(
      screen.getByText("You must agree to the privacy policy."),
    ).toBeVisible();
    expect(mocks.register).not.toHaveBeenCalled();
    expect(onVerificationRequired).not.toHaveBeenCalled();
    expect(onSignInRequested).not.toHaveBeenCalled();
  });

  it("should submit trimmed and normalized registration data", async () => {
    const user = userEvent.setup();
    renderRegisterForm();
    const firstNameInput = screen.getByLabelText("First name *");
    const lastNameInput = screen.getByLabelText("Last name *");
    const emailInput = screen.getByLabelText("Your email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const confirmPasswordInput = screen.getByLabelText("Confirm password *");
    const phoneInput = screen.getByLabelText("Phone number *");
    const privacyCheckbox = screen.getByRole("checkbox", {
      name: "I agree to the Privacy Policy",
    });
    const registerButton = screen.getByRole("button", { name: "REGISTER" });

    await user.type(firstNameInput, "   John   ");
    await user.type(lastNameInput, "    Kenworth    ");
    await user.type(emailInput, "   John@Kenworth.com  ");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.type(phoneInput, "   0123456789    ");
    await user.click(privacyCheckbox);
    await user.click(registerButton);

    expect(mocks.register).toHaveBeenCalledOnce();
    expect(mocks.register).toHaveBeenCalledWith({
      firstName: "John",
      lastName: "Kenworth",
      email: "john@kenworth.com",
      password: "password123",
      phone: "0123456789",
    });
  });

  it("should open verification after successful registration requiring verification", async () => {
    const user = userEvent.setup();
    const { onVerificationRequired, onSignInRequested } = renderRegisterForm();
    const firstNameInput = screen.getByLabelText("First name *");
    const lastNameInput = screen.getByLabelText("Last name *");
    const emailInput = screen.getByLabelText("Your email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const confirmPasswordInput = screen.getByLabelText("Confirm password *");
    const phoneInput = screen.getByLabelText("Phone number *");
    const privacyCheckbox = screen.getByRole("checkbox", {
      name: "I agree to the Privacy Policy",
    });
    const registerButton = screen.getByRole("button", { name: "REGISTER" });

    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Kenworth");
    await user.type(emailInput, "john@kenworth.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.type(phoneInput, "0123456789");
    await user.click(privacyCheckbox);
    await user.click(registerButton);

    expect(onVerificationRequired).toHaveBeenCalledOnce();
    expect(onVerificationRequired).toHaveBeenCalledWith("john@kenworth.com");
    expect(onSignInRequested).not.toHaveBeenCalled();
  });

  it("should request sign-in when verification is not required", async () => {
    mocks.register.mockResolvedValue({
      requiresEmailVerification: false,
    });

    const user = userEvent.setup();
    const { onVerificationRequired, onSignInRequested } = renderRegisterForm();
    const firstNameInput = screen.getByLabelText("First name *");
    const lastNameInput = screen.getByLabelText("Last name *");
    const emailInput = screen.getByLabelText("Your email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const confirmPasswordInput = screen.getByLabelText("Confirm password *");
    const phoneInput = screen.getByLabelText("Phone number *");
    const privacyCheckbox = screen.getByRole("checkbox", {
      name: "I agree to the Privacy Policy",
    });
    const registerButton = screen.getByRole("button", { name: "REGISTER" });

    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Kenworth");
    await user.type(emailInput, "john@kenworth.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.type(phoneInput, "0123456789");
    await user.click(privacyCheckbox);
    await user.click(registerButton);

    expect(onVerificationRequired).not.toHaveBeenCalled();
    expect(onSignInRequested).toHaveBeenCalledOnce();
  });

  it("should show and focus the duplicate-email error after a 409 response", async () => {
    mocks.register.mockRejectedValueOnce(
      new ApiClientError(409, "Email already exists."),
    );

    const user = userEvent.setup();
    const { onVerificationRequired, onSignInRequested } = renderRegisterForm();
    const firstNameInput = screen.getByLabelText("First name *");
    const lastNameInput = screen.getByLabelText("Last name *");
    const emailInput = screen.getByLabelText("Your email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const confirmPasswordInput = screen.getByLabelText("Confirm password *");
    const phoneInput = screen.getByLabelText("Phone number *");
    const privacyCheckbox = screen.getByRole("checkbox", {
      name: "I agree to the Privacy Policy",
    });
    const registerButton = screen.getByRole("button", { name: "REGISTER" });

    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Kenworth");
    await user.type(emailInput, "john@kenworth.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.type(phoneInput, "0123456789");
    await user.click(privacyCheckbox);
    await user.click(registerButton);

    expect(
      await screen.findByText(
        "An account with this email address already exists.",
      ),
    ).toBeVisible();
    await waitFor(() => {
      expect(emailInput).toHaveFocus();
    });
    expect(onVerificationRequired).not.toHaveBeenCalled();
    expect(onSignInRequested).not.toHaveBeenCalled();
  });
});
