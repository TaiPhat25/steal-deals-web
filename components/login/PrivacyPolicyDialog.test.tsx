import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PrivacyPolicyDialog from "./PrivacyPolicyDialog";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

function PrivacyPolicyDialogHarness() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open privacy policy
      </button>

      {isOpen && <PrivacyPolicyDialog onClose={() => setIsOpen(false)} />}
    </>
  );
}

describe("PrivacyPolicyDialog", () => {
  it("should render an accessible modal dialog with the privacy policy heading", () => {
    const onClose = vi.fn();
    render(<PrivacyPolicyDialog onClose={onClose} />);
    const heading = screen.getByRole("heading", {
      level: 2,
      name: /privacy policy/i,
    });
    const dialog = screen.getByRole("dialog", { name: /privacy policy/i });

    expect(heading).toBeVisible();
    expect(dialog).toBeVisible();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", heading.id);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should associate the dialog with the policy summary", () => {
    const onClose = vi.fn();
    render(<PrivacyPolicyDialog onClose={onClose} />);
    const dialog = screen.getByRole("dialog", { name: /privacy policy/i });
    const summary = screen.getByText(
      /this policy explains how .* collects, uses, and protects information/i,
    );

    expect(summary).toBeVisible();
    expect(dialog).toHaveAttribute("aria-describedby", summary.id);
    expect(dialog).toHaveAccessibleDescription(
      /this policy explains how .* collects, uses, and protects information/i,
    );
  });

  it("should display the policy's last updated date", () => {
    const onClose = vi.fn();
    render(<PrivacyPolicyDialog onClose={onClose} />);
    const lastUpdatedText = screen.getByText("Last updated: September 9, 2026");

    expect(lastUpdatedText).toBeVisible();
  });

  it("should render all seven privacy policy sections", () => {
    const onClose = vi.fn();
    render(<PrivacyPolicyDialog onClose={onClose} />);
    const headings = screen.getAllByRole("heading", {
      level: 3,
    });
    const expectedHeadings = [
      "1. Information we collect",
      "2. How we use information",
      "3. When information is shared",
      "4. Retention and security",
      "5. Your choices",
      "6. Cookies and session data",
      "7. Policy updates and contact",
    ];

    expect(headings).toHaveLength(7);
    expectedHeadings.forEach((heading) => {
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: heading,
        }),
      ).toBeVisible();
    });
    expect(headings.map((heading) => heading.textContent)).toEqual(
      expectedHeadings,
    );
  });

  it("should render an aria-hidden modal backdrop", () => {
    const onClose = vi.fn();
    const { container } = render(<PrivacyPolicyDialog onClose={onClose} />);
    const backdrop = container.querySelector<HTMLElement>(".modal-backdrop");

    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    expect(backdrop).toHaveClass("modal-backdrop", "fade", "show");
  });

  it("should move focus to the policy heading when opened", async () => {
    const onClose = vi.fn();
    render(<PrivacyPolicyDialog onClose={onClose} />);
    const heading = screen.getByRole("heading", {
      level: 2,
      name: /privacy policy/i,
    });

    await waitFor(() => {
      expect(heading).toHaveFocus();
    });
  });

  it("should call onClose when the OK button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<PrivacyPolicyDialog onClose={onClose} />);
    const okButton = screen.getByRole("button", { name: "OK" });

    await user.click(okButton);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("should call onClose when the Escape key is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<PrivacyPolicyDialog onClose={onClose} />);

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("should lock body scrolling while open and restore it when unmounted", () => {
    const originalOverflow = document.body.style.overflow;
    const onClose = vi.fn();
    const { unmount } = render(<PrivacyPolicyDialog onClose={onClose} />);

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe(originalOverflow);
  });

  it("should restore focus to the previously focused element when unmounted", async () => {
    const user = userEvent.setup();
    render(<PrivacyPolicyDialogHarness />);
    const openButton = screen.getByRole("button", {
      name: "Open privacy policy",
    });

    await user.click(openButton);

    const heading = screen.getByRole("heading", {
      level: 2,
      name: /privacy policy/i,
    });

    await waitFor(() => {
      expect(heading).toHaveFocus();
    });

    await user.click(
      screen.getByRole("button", {
        name: "OK",
      }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", {
          name: /privacy policy/i,
        }),
      ).not.toBeInTheDocument();

      expect(openButton).toHaveFocus();
    });
  });
});
