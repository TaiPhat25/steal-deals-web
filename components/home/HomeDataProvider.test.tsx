import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomeDataProvider, { useHomeData } from "./HomeDataProvider";

const mocks = vi.hoisted(() => ({
  listBags: vi.fn(),
  listCategories: vi.fn(),
  listStores: vi.fn(),
}));

vi.mock("@/lib/api/store", () => ({
  listBags: mocks.listBags,
  listCategories: mocks.listCategories,
  listStores: mocks.listStores,
}));

function DataSummary({ label }: { label: string }) {
  const { bags, categories, retry, stores } = useHomeData();

  return (
    <div>
      <output aria-label={label}>
        {bags.status}:{bags.data.length}|{categories.status}:
        {categories.data.length}|{stores.status}:{stores.data.length}
      </output>
      <button type="button" onClick={retry}>
        Retry
      </button>
    </div>
  );
}

describe("HomeDataProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listBags.mockResolvedValue([{}]);
    mocks.listCategories.mockResolvedValue([{}, {}]);
    mocks.listStores.mockResolvedValue([{}, {}, {}]);
  });

  it("loads each Home resource once for multiple consumers", async () => {
    render(
      <HomeDataProvider>
        <DataSummary label="first consumer" />
        <DataSummary label="second consumer" />
      </HomeDataProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("first consumer")).toHaveTextContent(
        "success:1|success:2|success:3",
      );
      expect(screen.getByLabelText("second consumer")).toHaveTextContent(
        "success:1|success:2|success:3",
      );
    });

    expect(mocks.listBags).toHaveBeenCalledOnce();
    expect(mocks.listCategories).toHaveBeenCalledOnce();
    expect(mocks.listStores).toHaveBeenCalledOnce();
  });

  it("keeps successful resources when another request fails", async () => {
    mocks.listStores.mockRejectedValue(new Error("Store service unavailable"));

    render(
      <HomeDataProvider>
        <DataSummary label="home data" />
      </HomeDataProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("home data")).toHaveTextContent(
        "success:1|success:2|error:0",
      );
    });
  });

  it("reloads all resources after a failed request is retried", async () => {
    const user = userEvent.setup();
    let resolveRetry!: (value: object[]) => void;
    const retryResult = new Promise<object[]>((resolve) => {
      resolveRetry = resolve;
    });
    mocks.listBags
      .mockRejectedValueOnce(new Error("Bag service unavailable"))
      .mockReturnValueOnce(retryResult);

    render(
      <HomeDataProvider>
        <DataSummary label="home data" />
      </HomeDataProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("home data")).toHaveTextContent(
        "error:0|success:2|success:3",
      );
    });

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(screen.getByLabelText("home data")).toHaveTextContent(
      "loading:0|loading:0|loading:0",
    );

    resolveRetry([{}, {}]);

    await waitFor(() => {
      expect(screen.getByLabelText("home data")).toHaveTextContent(
        "success:2|success:2|success:3",
      );
    });

    expect(mocks.listBags).toHaveBeenCalledTimes(2);
    expect(mocks.listCategories).toHaveBeenCalledTimes(2);
    expect(mocks.listStores).toHaveBeenCalledTimes(2);
  });
});
