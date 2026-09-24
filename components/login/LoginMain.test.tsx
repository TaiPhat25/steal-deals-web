import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import LoginMain from "./LoginMain";

vi.mock("@/components/login/SignInForm", () => ({
  default: () => (
    <div>
      <label htmlFor="mock-signin-email">Sign-in email</label>
      <input id="mock-signin-email" />
    </div>
  ),
}));

type MockRegisterFormProps = {
  onVerificationRequired: (email: string) => void;
  onSignInRequested: () => void;
};

type MockEmailVerificationDialogProps = {
  email: string;
  onExit: () => void;
};

vi.mock("@/components/login/RegisterForm", () => ({
  default: ({
    onVerificationRequired,
    onSignInRequested,
  }: MockRegisterFormProps) => (
    <div>
      <label htmlFor="mock-register-email">Registration email</label>
      <input id="mock-register-email" />
      <button type="button" onClick={onSignInRequested}>
        Request sign-in
      </button>
      <button
        type="button"
        onClick={() => onVerificationRequired("john@kenworth.com")}
      >
        Request verification
      </button>
    </div>
  ),
}));

vi.mock("@/components/login/EmailVerificationDialog", () => ({
  default: ({ email, onExit }: MockEmailVerificationDialogProps) => (
    <div role="dialog" aria-label="Email verification">
      <span>{email}</span>
      <button type="button" onClick={onExit}>
        Exit verification
      </button>
    </div>
  ),
}));

describe("LoginMain", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show the Sign In tab by default", () => {
    render(<LoginMain />);
    const signInTab = screen.getByRole("tab", { name: "Sign In" });
    const registerTab = screen.getByRole("tab", { name: "Register" });
    const signInPanel = screen.getByRole("tabpanel", { name: "Sign In" });
    const registerPanel = screen.getByRole("tabpanel", { name: "Register" });
    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });

    expect(signInTab).toHaveAttribute("aria-selected", "true");
    expect(signInTab).toHaveAttribute("tabindex", "0");
    expect(registerTab).toHaveAttribute("aria-selected", "false");
    expect(registerTab).toHaveAttribute("tabindex", "-1");
    expect(signInPanel).toHaveClass("show", "active");
    expect(registerPanel).not.toHaveClass("show", "active");
    expect(within(breadcrumb).getByText("Sign In")).toBeVisible();
  });

  it("should show the Register tab when initialTab is register", () => {
    render(<LoginMain initialTab="register" />);
    const signInTab = screen.getByRole("tab", { name: "Sign In" });
    const registerTab = screen.getByRole("tab", { name: "Register" });
    const signInPanel = screen.getByRole("tabpanel", { name: "Sign In" });
    const registerPanel = screen.getByRole("tabpanel", { name: "Register" });
    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });

    expect(signInTab).toHaveAttribute("aria-selected", "false");
    expect(signInTab).toHaveAttribute("tabindex", "-1");
    expect(registerTab).toHaveAttribute("aria-selected", "true");
    expect(registerTab).toHaveAttribute("tabindex", "0");
    expect(signInPanel).not.toHaveClass("show", "active");
    expect(registerPanel).toHaveClass("show", "active");
    expect(within(breadcrumb).getByText("Register")).toBeVisible();
  });

  it("should switch to Register when the Register tab is clicked", async () => {
    const user = userEvent.setup();
    render(<LoginMain />);
    const signInTab = screen.getByRole("tab", { name: "Sign In" });
    const registerTab = screen.getByRole("tab", { name: "Register" });
    const signInPanel = screen.getByRole("tabpanel", { name: "Sign In" });
    const registerPanel = screen.getByRole("tabpanel", { name: "Register" });
    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });
    const registerInput = screen.getByLabelText("Registration email");

    await user.click(registerTab);

    await waitFor(() => {
      expect(registerTab).toHaveAttribute("aria-selected", "true");
      expect(registerInput).toHaveFocus();
    });
    expect(signInTab).toHaveAttribute("aria-selected", "false");
    expect(signInTab).toHaveAttribute("tabindex", "-1");
    expect(registerTab).toHaveAttribute("tabindex", "0");
    expect(signInPanel).not.toHaveClass("show", "active");
    expect(registerPanel).toHaveClass("show", "active");
    expect(within(breadcrumb).getByText("Register")).toBeVisible();
  });

  it("should switch back to Sign In when the Sign In tab is clicked", async () => {
    const user = userEvent.setup();
    render(<LoginMain initialTab="register" />);
    const signInTab = screen.getByRole("tab", { name: "Sign In" });
    const registerTab = screen.getByRole("tab", { name: "Register" });
    const signInPanel = screen.getByRole("tabpanel", { name: "Sign In" });
    const registerPanel = screen.getByRole("tabpanel", { name: "Register" });
    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });
    const signInInput = screen.getByLabelText("Sign-in email");

    await user.click(signInTab);

    await waitFor(() => {
      expect(signInTab).toHaveAttribute("aria-selected", "true");
      expect(signInInput).toHaveFocus();
    });
    expect(signInTab).toHaveAttribute("tabindex", "0");
    expect(registerTab).toHaveAttribute("aria-selected", "false");
    expect(registerTab).toHaveAttribute("tabindex", "-1");
    expect(signInPanel).toHaveClass("show", "active");
    expect(registerPanel).not.toHaveClass("show", "active");
    expect(within(breadcrumb).getByText("Sign In")).toBeVisible();
  });

  it("should update the browser path after changing tabs", async () => {
    const replaceStateSpy = vi
      .spyOn(window.history, "replaceState")
      .mockImplementation(() => {});

    const user = userEvent.setup();
    render(<LoginMain />);
    const registerTab = screen.getByRole("tab", { name: "Register" });

    await user.click(registerTab);

    await waitFor(() => {
      expect(registerTab).toHaveAttribute("aria-selected", "true");
    });
    await waitFor(() => {
      expect(replaceStateSpy).toHaveBeenCalledWith(
        window.history.state,
        "",
        "/register",
      );
    });
  });

  it("should navigate between tabs with ArrowLeft and ArrowRight", async () => {
    const user = userEvent.setup();
    render(<LoginMain />);
    const signInTab = screen.getByRole("tab", { name: "Sign In" });
    const registerTab = screen.getByRole("tab", { name: "Register" });
    const signInPanel = screen.getByRole("tabpanel", { name: "Sign In" });
    const registerPanel = screen.getByRole("tabpanel", { name: "Register" });
    const signInInput = screen.getByLabelText("Sign-in email");

    await waitFor(() => {
      expect(signInInput).toHaveFocus();
    });

    signInTab.focus();

    expect(signInTab).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    await waitFor(() => {
      expect(registerTab).toHaveAttribute("aria-selected", "true");
    });
    expect(signInTab).toHaveAttribute("aria-selected", "false");
    expect(registerTab).toHaveFocus();
    expect(signInPanel).not.toHaveClass("show", "active");
    expect(registerPanel).toHaveClass("show", "active");

    await user.keyboard("{ArrowLeft}");

    await waitFor(() => {
      expect(signInTab).toHaveAttribute("aria-selected", "true");
    });
    expect(signInTab).toHaveFocus();
    expect(registerTab).toHaveAttribute("aria-selected", "false");
    expect(signInPanel).toHaveClass("show", "active");
    expect(registerPanel).not.toHaveClass("show", "active");
  });

  it("should select the Sign In tab when Home is pressed", async () => {
    const user = userEvent.setup();
    render(<LoginMain initialTab="register" />);
    const signInTab = screen.getByRole("tab", { name: "Sign In" });
    const registerTab = screen.getByRole("tab", { name: "Register" });
    const signInPanel = screen.getByRole("tabpanel", { name: "Sign In" });
    const registerPanel = screen.getByRole("tabpanel", { name: "Register" });
    const registerInput = screen.getByLabelText("Registration email");

    await waitFor(() => {
      expect(registerInput).toHaveFocus();
    });

    registerTab.focus();

    expect(registerTab).toHaveFocus();

    await user.keyboard("{Home}");

    await waitFor(() => {
      expect(signInTab).toHaveAttribute("aria-selected", "true");
    });
    expect(signInTab).toHaveFocus();
    expect(registerTab).toHaveAttribute("aria-selected", "false");
    expect(signInPanel).toHaveClass("show", "active");
    expect(registerPanel).not.toHaveClass("show", "active");
  });

  it("should select the Register tab when End is pressed", async () => {
    const user = userEvent.setup();
    render(<LoginMain />);
    const signInTab = screen.getByRole("tab", { name: "Sign In" });
    const registerTab = screen.getByRole("tab", { name: "Register" });
    const signInPanel = screen.getByRole("tabpanel", { name: "Sign In" });
    const registerPanel = screen.getByRole("tabpanel", { name: "Register" });
    const signInInput = screen.getByLabelText("Sign-in email");

    await waitFor(() => {
      expect(signInInput).toHaveFocus();
    });

    signInTab.focus();

    expect(signInTab).toHaveFocus();

    await user.keyboard("{End}");

    await waitFor(() => {
      expect(registerTab).toHaveAttribute("aria-selected", "true");
    });
    expect(signInTab).toHaveAttribute("aria-selected", "false");
    expect(registerTab).toHaveFocus();
    expect(signInPanel).not.toHaveClass("show", "active");
    expect(registerPanel).toHaveClass("show", "active");
  });

  it("should switch to Sign In when RegisterForm requests sign-in", async () => {
    const user = userEvent.setup();
    render(<LoginMain initialTab="register" />);
    const signInTab = screen.getByRole("tab", { name: "Sign In" });
    const registerTab = screen.getByRole("tab", { name: "Register" });
    const signInPanel = screen.getByRole("tabpanel", { name: "Sign In" });
    const registerPanel = screen.getByRole("tabpanel", { name: "Register" });
    const signInInput = screen.getByLabelText("Sign-in email");
    const requestSignInButton = screen.getByRole("button", {
      name: "Request sign-in",
    });

    await user.click(requestSignInButton);

    await waitFor(() => {
      expect(signInTab).toHaveAttribute("aria-selected", "true");
      expect(signInInput).toHaveFocus();
    });
    expect(registerTab).toHaveAttribute("aria-selected", "false");
    expect(signInPanel).toHaveClass("show", "active");
    expect(registerPanel).not.toHaveClass("show", "active");
  });

  it("should open email verification for the registered email", async () => {
    const user = userEvent.setup();
    render(<LoginMain initialTab="register" />);
    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });
    const loginPage = screen
      .getByRole("tablist", { name: "Account access" })
      .closest(".login-page");

    if (!loginPage) {
      throw new Error("Login page container was not found.");
    }

    const requestVerificationButton = screen.getByRole("button", {
      name: "Request verification",
    });

    await user.click(requestVerificationButton);

    const verificationDialog = await screen.findByRole("dialog", {
      name: "Email verification",
    });

    expect(verificationDialog).toBeVisible();
    expect(
      within(verificationDialog).getByText("john@kenworth.com"),
    ).toBeVisible();
    expect(breadcrumb).toHaveAttribute("aria-hidden", "true");
    expect(loginPage).toHaveAttribute("aria-hidden", "true");
  });
});
