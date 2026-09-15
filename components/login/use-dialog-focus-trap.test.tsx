import { useRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDialogFocusTrap } from "./use-dialog-focus-trap";
import userEvent from "@testing-library/user-event";

type TestDialogProps = {
  initialFocusSelector?: string;
  onEscape: () => void;
  canEscape?: boolean;
  hasFocusableElements?: boolean;
};

function TestDialog({
  initialFocusSelector = "[data-initial-focus]",
  onEscape,
  canEscape = true,
  hasFocusableElements = true,
}: TestDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogFocusTrap({
    dialogRef,
    initialFocusSelector,
    onEscape,
    canEscape,
  });

  return (
    <div ref={dialogRef} role="dialog" tabIndex={-1}>
      {hasFocusableElements && (
        <>
          <button type="button" data-first-action>
            First action
          </button>

          <button type="button" data-initial-focus>
            Initial action
          </button>

          <button type="button" data-last-action>
            Last action
          </button>
        </>
      )}
    </div>
  );
}

describe("useDialogFocusTrap", () => {
  it("should focus the element matching the initial focus selector", async () => {
    render(<TestDialog onEscape={vi.fn()} />);

    const initialElement = screen.getByRole("button", {
      name: "Initial action",
    });

    await waitFor(() => {
      expect(initialElement).toHaveFocus();
    });
  });

  it("should focus the dialog when the initial element cannot be found", async () => {
    render(
      <TestDialog
        initialFocusSelector="data-does-not-exist"
        onEscape={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog");

    await waitFor(() => {
      expect(dialog).toHaveFocus();
    });
  });

  it("should disable body scrolling while mounted and restore it after unmounting", () => {
    document.body.style.overflow = "auto";

    const { unmount } = render(<TestDialog onEscape={vi.fn()} />);

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("auto");
  });

  it("should call onEscape when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    render(<TestDialog onEscape={onEscape} />);

    await user.keyboard("{Escape}");

    expect(onEscape).toHaveBeenCalledOnce();
  });

  it("should not call onEscape when escaping is disabled", async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    render(<TestDialog onEscape={onEscape} canEscape={false} />);

    await user.keyboard("{Escape}");

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("should focus the dialog when Tab is pressed with no focusable elements", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Outside action</button>
        <TestDialog onEscape={vi.fn()} hasFocusableElements={false} />
      </>,
    );

    const outsideButton = screen.getByRole("button", {
      name: "Outside action",
    });
    const dialog = screen.getByRole("dialog");

    await waitFor(() => {
      expect(dialog).toHaveFocus();
    });

    outsideButton.focus();
    expect(outsideButton).toHaveFocus();

    await user.keyboard("{Tab}");

    expect(dialog).toHaveFocus();
  });

  it("should move focus from the last element to the first when Tab is pressed", async () => {
    const user = userEvent.setup();
    render(
      <TestDialog
        onEscape={vi.fn()}
        initialFocusSelector="[data-last-action]"
      />,
    );

    const lastElement = screen.getByRole("button", {
      name: "Last action",
    });
    const firstElement = screen.getByRole("button", {
      name: "First action",
    });

    await waitFor(() => {
      expect(lastElement).toHaveFocus();
    });

    await user.keyboard("{Tab}");

    expect(firstElement).toHaveFocus();
  });

  it("should move focus from the first element to the last when Shift+Tab is pressed", async () => {
    const user = userEvent.setup();
    render(
      <TestDialog
        onEscape={vi.fn()}
        initialFocusSelector="[data-first-action]"
      />,
    );

    const firstElement = screen.getByRole("button", {
      name: "First action",
    });
    const lastElement = screen.getByRole("button", {
      name: "Last action",
    });

    await waitFor(() => {
      expect(firstElement).toHaveFocus();
    });

    await user.keyboard("{Shift>}{Tab}{/Shift}");

    expect(lastElement).toHaveFocus();
  });

  it("should restore focus to the previously focused element after unmounting", async () => {
    render(<button type="button">Outside action</button>);

    const outsideButton = screen.getByRole("button", {
      name: "Outside action",
    });

    outsideButton.focus();

    expect(outsideButton).toHaveFocus();

    const { unmount } = render(<TestDialog onEscape={vi.fn()} />);
    const initialElement = screen.getByRole("button", {
      name: "Initial action",
    });

    await waitFor(() => {
      expect(initialElement).toHaveFocus();
    });

    unmount();

    expect(outsideButton).toHaveFocus();
  });

  it("should move focus to the first element when Tab is pressed from outside the dialog", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Outside action</button>
        <TestDialog onEscape={vi.fn()} />
      </>,
    );

    const outsideButton = screen.getByRole("button", {
      name: "Outside action",
    });
    const initialElement = screen.getByRole("button", {
      name: "Initial action",
    });
    const firstElement = screen.getByRole("button", {
      name: "First action",
    });

    await waitFor(() => {
      expect(initialElement).toHaveFocus();
    });

    outsideButton.focus();

    expect(outsideButton).toHaveFocus();

    await user.keyboard("{Tab}");

    expect(firstElement).toHaveFocus();
  });
});
