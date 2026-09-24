import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import HomeCollectionState from "./HomeCollectionState";

describe("HomeCollectionState", () => {
  it("announces loading without exposing placeholder cards", () => {
    render(
      <HomeCollectionState state="loading" message="Loading surprise bags" />,
    );

    expect(screen.getByRole("status")).toHaveAccessibleName(
      "Loading surprise bags",
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("provides a retry action for errors", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <HomeCollectionState
        state="error"
        title="Surprise bags are temporarily unavailable"
        message="We couldn't load surprise bags right now."
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't load surprise bags right now.",
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("renders an empty state without a retry action", () => {
    render(
      <HomeCollectionState
        state="empty"
        title="No new stores yet"
        message="Recently joined stores will appear here."
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("No new stores yet");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
