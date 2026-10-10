import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RequireAuth from "./RequireAuth";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: mocks.useAuth,
}));

describe("RequireAuth", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.useAuth.mockReset();
  });

  it("should render nothing and avoid redirecting while authentication is initializing", () => {
    mocks.useAuth.mockReturnValue({
      isInitialized: false,
      isAuthenticated: false,
    });

    render(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("should redirect an unauthenticated user to the default login path", () => {
    mocks.useAuth.mockReturnValue({
      isInitialized: true,
      isAuthenticated: false,
    });

    render(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(mocks.replace).toHaveBeenCalledOnce();
    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });

  it("should redirect an unauthenticated user to a custom login path", () => {
    mocks.useAuth.mockReturnValue({
      isInitialized: true,
      isAuthenticated: false,
    });

    render(
      <RequireAuth loginPath="/admin/login">
        <div>Protected content</div>
      </RequireAuth>,
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(mocks.replace).toHaveBeenCalledOnce();
    expect(mocks.replace).toHaveBeenCalledWith("/admin/login");
  });

  it("should render protected content without redirecting an authenticated user", () => {
    mocks.useAuth.mockReturnValue({
      isInitialized: true,
      isAuthenticated: true,
    });

    render(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
    );

    expect(screen.getByText("Protected content")).toBeVisible();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("should render protected content when initialization completes with an authenticated user", () => {
    mocks.useAuth.mockReturnValue({
      isInitialized: false,
      isAuthenticated: false,
    });

    const { rerender } = render(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();

    mocks.useAuth.mockReturnValue({
      isInitialized: true,
      isAuthenticated: true,
    });

    rerender(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
    );

    expect(screen.getByText("Protected content")).toBeVisible();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("should redirect when initialization completes with an unauthenticated user", () => {
    mocks.useAuth.mockReturnValue({
      isInitialized: false,
      isAuthenticated: false,
    });

    const { rerender } = render(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();

    mocks.useAuth.mockReturnValue({
      isInitialized: true,
      isAuthenticated: false,
    });

    rerender(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(mocks.replace).toHaveBeenCalledOnce();
    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });

  it("should hide protected content and redirect when an authenticated user becomes unauthenticated", () => {
    mocks.useAuth.mockReturnValue({
      isInitialized: true,
      isAuthenticated: true,
    });

    const { rerender } = render(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
    );

    expect(screen.getByText("Protected content")).toBeVisible();
    expect(mocks.replace).not.toHaveBeenCalled();

    mocks.useAuth.mockReturnValue({
      isInitialized: true,
      isAuthenticated: false,
    });

    rerender(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>,
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(mocks.replace).toHaveBeenCalledOnce();
    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });
});
