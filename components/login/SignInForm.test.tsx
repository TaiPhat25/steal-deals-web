import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignInForm from "./SignInForm";
import { ApiClientError } from "@/lib/api/client";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  replace: vi.fn(),
  isLoading: false,
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    login: mocks.login,
    isLoading: mocks.isLoading,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

describe("SignInForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isLoading = false;

    mocks.login.mockResolvedValue({
      user: {
        roles: ["Buyer"],
      },
    });
  });

  it("should show required errors when email and password are empty", async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    const signInButton = screen.getByRole("button", { name: "SIGN IN" });
    await user.click(signInButton);

    expect(screen.getByText("Email address is required.")).toBeVisible();
    expect(screen.getByText("Password is required.")).toBeVisible();

    expect(mocks.login).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("should reject an invalid email without calling login", async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    const emailInput = screen.getByLabelText("Email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const signInButton = screen.getByRole("button", { name: "SIGN IN" });

    await user.type(emailInput, "test");
    await user.type(passwordInput, "password123");
    await user.click(signInButton);

    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
    expect(screen.queryByText("Password is required.")).not.toBeInTheDocument();

    expect(mocks.login).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("should submit normalized email and the entered password", async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    const emailInput = screen.getByLabelText("Email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const signInButton = screen.getByRole("button", { name: "SIGN IN" });

    await user.type(emailInput, "Test@Example.COM  ");
    await user.type(passwordInput, "12345678");
    await user.click(signInButton);

    expect(mocks.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "12345678",
    });
  });

  it("should redirect a user to the home page after successful login", async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    const emailInput = screen.getByLabelText("Email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const signInButton = screen.getByRole("button", { name: "SIGN IN" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "12345678");
    await user.click(signInButton);

    expect(mocks.replace).toHaveBeenCalledWith("/");
  });

  it("should redirect a seller to the seller dashboard after successful login", async () => {
    mocks.login.mockResolvedValueOnce({
      user: {
        roles: ["Seller"],
      },
    });

    const user = userEvent.setup();
    render(<SignInForm />);

    const emailInput = screen.getByLabelText("Email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const signInButton = screen.getByRole("button", { name: "SIGN IN" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "12345678");
    await user.click(signInButton);

    expect(mocks.replace).toHaveBeenCalledWith("/seller");
  });

  it("should show an incorrect credentials message for a 401 response", async () => {
    mocks.login.mockRejectedValueOnce(
      new ApiClientError(401, "Invalid credentials."),
    );

    const user = userEvent.setup();
    render(<SignInForm />);

    const emailInput = screen.getByLabelText("Email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const signInButton = screen.getByRole("button", { name: "SIGN IN" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(signInButton);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Incorrect email or password.",
    );

    expect(mocks.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });

    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("should show a service or connection error when login fails unexpectedly", async () => {
    mocks.login.mockRejectedValueOnce(new Error("Network failure"));

    const user = userEvent.setup();
    render(<SignInForm />);

    const emailInput = screen.getByLabelText("Email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const signInButton = screen.getByRole("button", { name: "SIGN IN" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(signInButton);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to reach the server. Check your connection and try again.",
    );

    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("should disable the submit button and show the loading label while signing in", () => {
    mocks.isLoading = true;

    render(<SignInForm />);

    const signInButton = screen.getByRole("button", { name: "SIGNING IN..." });

    expect(signInButton).toBeDisabled();
    expect(signInButton).toHaveTextContent("SIGNING IN...");
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("should show a service unavailable message for a server error", async () => {
    mocks.login.mockRejectedValueOnce(
      new ApiClientError(500, "Service is unavailable."),
    );

    const user = userEvent.setup();
    render(<SignInForm />);

    const emailInput = screen.getByLabelText("Email address *");
    const passwordInput = screen.getByLabelText("Password *");
    const signInButton = screen.getByRole("button", { name: "SIGN IN" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(signInButton);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The sign-in service is temporarily unavailable. Please try again later.",
    );

    expect(mocks.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });

    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("should clear a field error when the user corrects that field", async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    const emailInput = screen.getByLabelText("Email address *");
    const signInButton = screen.getByRole("button", { name: "SIGN IN" });

    await user.click(signInButton);
    await user.type(emailInput, "test@example.com");

    expect(
      screen.queryByText("Email address is required."),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeVisible();
    expect(mocks.login).not.toHaveBeenCalled();
  });
});
