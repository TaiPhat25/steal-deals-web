import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PasswordField from "./PasswordField";

const defaultProps = {
  id: "test-password",
  label: "Password",
  name: "password",
  autoComplete: "current-password",
  value: "password123",
  onChange: vi.fn(),
} satisfies ComponentProps<typeof PasswordField>;

function renderPasswordField(
  overrides: Partial<ComponentProps<typeof PasswordField>> = {},
) {
  render(<PasswordField {...defaultProps} {...overrides} />);

  return screen.getByLabelText("Password *", {
    selector: "input",
  });
}

describe("PasswordField", () => {
  it("should hide the password initially", () => {
    const input = renderPasswordField();

    expect(input).toHaveAttribute("type", "password");
  });

  it("should show and hide the password when clicking the toggle", async () => {
    const user = userEvent.setup();
    const input = renderPasswordField();

    await user.click(screen.getByRole("button", { name: "Show password" }));

    expect(input).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Hide password" }));

    expect(input).toHaveAttribute("type", "password");
    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("should call onChange when the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const input = renderPasswordField({
      value: "",
      onChange,
    });

    await user.type(input, "a");

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("should display the error and mark the input as invalid", () => {
    const input = renderPasswordField({
      error: "Password is required.",
    });

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "test-password-error");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Password is required.",
    );
  });

  it("should associate the password hint with the input", () => {
    const input = renderPasswordField({
      hint: "Use at least 8 characters.",
    });

    expect(input).toHaveAccessibleDescription("Use at least 8 characters.");
  });

  it("should apply the value passed through the value prop", () => {
    const input = renderPasswordField({
      value: "my-password",
    });

    expect(input).toHaveValue("my-password");
  });

  it("should apply the provided minimum length to the input", () => {
    const input = renderPasswordField({
      minLength: 8,
    });

    expect(input).toHaveAttribute("minLength", "8");
  });

  it("should mark the password input as required", () => {
    const input = renderPasswordField();

    expect(input).toBeRequired();
  });

  it("should show no error when no error prop is provided", () => {
    const input = renderPasswordField();

    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("should associate both the hint and error messages with the input", () => {
    const input = renderPasswordField({
      hint: "Use at least 8 characters.",
      error: "Password is required.",
    });

    expect(input).toHaveAttribute(
      "aria-describedby",
      "test-password-requirements test-password-error",
    );
    expect(input).toHaveAccessibleDescription(
      "Use at least 8 characters. Password is required.",
    );
  });
});
