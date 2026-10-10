import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AddressMapPicker, { type LocationValue } from "./AddressMapPicker";
import * as locationApi from "@/lib/api/location";

// Mock the dynamic map view component to avoid WebGL requirement in jsdom
vi.mock("./LocationMapView", () => ({
  default: ({
    latitude,
    longitude,
    onCoordinatesChange,
  }: {
    latitude: number | null;
    longitude: number | null;
    onCoordinatesChange: (lat: number, lng: number) => void;
  }) => (
    <div data-testid="mock-location-map-view">
      <span data-testid="map-lat">{latitude}</span>
      <span data-testid="map-lng">{longitude}</span>
      <button
        type="button"
        data-testid="simulate-pin-drag"
        onClick={() => onCoordinatesChange(10.8231, 106.6297)}
      >
        Simulate Pin Drag
      </button>
    </div>
  ),
  OSM_RASTER_STYLE: {},
}));

// Mock useAuth
vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    accessToken: "test-auth-token",
  }),
}));

describe("AddressMapPicker", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with initial location values", async () => {
    const initialLocation: LocationValue = {
      address: "18 Nguyen Hue",
      province: "Thành phố Hồ Chí Minh",
      commune: "Phường Bến Nghé",
      latitude: 10.7731,
      longitude: 106.703,
    };

    render(<AddressMapPicker value={initialLocation} />);

    expect(screen.getByDisplayValue("18 Nguyen Hue")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Thành phố Hồ Chí Minh")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Phường Bến Nghé")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10.7731")).toBeInTheDocument();
    expect(screen.getByDisplayValue("106.703")).toBeInTheDocument();
    expect(await screen.findByTestId("map-lat")).toHaveTextContent("10.7731");
    expect(await screen.findByTestId("map-lng")).toHaveTextContent("106.703");
  });

  it("performs debounced search and displays dropdown suggestions", async () => {
    const user = userEvent.setup();
    const mockSuggestions = [
      {
        placeId: "p1",
        description: "18 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
        mainText: "18 Nguyễn Huệ",
        secondaryText: "Phường Bến Nghé, Quận 1, TP.HCM",
        commune: "Phường Bến Nghé",
        province: "Thành phố Hồ Chí Minh",
        latitude: 10.7731,
        longitude: 106.703,
      },
    ];

    const autocompleteSpy = vi
      .spyOn(locationApi, "autocompleteLocations")
      .mockResolvedValue(mockSuggestions);

    render(<AddressMapPicker />);

    const searchInput = screen.getByRole("combobox");
    await user.type(searchInput, "Nguyen Hue");

    await waitFor(() => {
      expect(autocompleteSpy).toHaveBeenCalledWith(
        "test-auth-token",
        expect.objectContaining({ input: "Nguyen Hue" }),
      );
    });

    const option = await screen.findByRole("option");
    expect(option).toHaveTextContent("18 Nguyễn Huệ");
  });

  it("selects suggestion and autofills address, commune, province, and coordinates", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    const mockSuggestions = [
      {
        placeId: "p2",
        description: "135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1",
        mainText: "Dinh Độc Lập",
        secondaryText: "135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1",
        commune: "Phường Bến Thành",
        province: "Thành phố Hồ Chí Minh",
        latitude: 10.777,
        longitude: 106.6954,
      },
    ];

    vi.spyOn(locationApi, "autocompleteLocations").mockResolvedValue(mockSuggestions);

    render(<AddressMapPicker onChange={handleChange} />);

    const searchInput = screen.getByRole("combobox");
    await user.type(searchInput, "Dinh Doc Lap");

    const option = await screen.findByRole("option");
    await user.click(option);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        address: "135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1",
        commune: "Phường Bến Thành",
        province: "Thành phố Hồ Chí Minh",
        latitude: 10.777,
        longitude: 106.6954,
      }),
    );
  });

  it("falls back to place-detail if coordinates are absent from autocomplete suggestion", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    const mockSuggestions = [
      {
        placeId: "p-no-coord",
        description: "Opera House, Hanoi",
        mainText: "Opera House",
        commune: "Tràng Tiền",
        province: "Hà Nội",
        latitude: null,
        longitude: null,
      },
    ];

    vi.spyOn(locationApi, "autocompleteLocations").mockResolvedValue(mockSuggestions);
    const placeDetailSpy = vi.spyOn(locationApi, "getLocationPlaceDetail").mockResolvedValue({
      placeId: "p-no-coord",
      name: "Hanoi Opera House",
      formattedAddress: "1 Trang Tien, Hoan Kiem, Hanoi",
      latitude: 21.0245,
      longitude: 105.8576,
      commune: "Tràng Tiền",
      province: "Hà Nội",
    });

    render(<AddressMapPicker onChange={handleChange} />);

    const searchInput = screen.getByRole("combobox");
    await user.type(searchInput, "Opera");

    const option = await screen.findByRole("option");
    await user.click(option);

    await waitFor(() => {
      expect(placeDetailSpy).toHaveBeenCalledWith(
        "test-auth-token",
        expect.objectContaining({ placeId: "p-no-coord" }),
      );
    });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 21.0245,
        longitude: 105.8576,
      }),
    );
  });

  it("does not load the map when address or coordinates are empty until requested", async () => {
    render(<AddressMapPicker />);

    expect(screen.getByTestId("map-placeholder")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-location-map-view")).not.toBeInTheDocument();

    const manualButton = screen.getByTestId("open-map-manually");
    fireEvent.click(manualButton);

    expect(await screen.findByTestId("mock-location-map-view")).toBeInTheDocument();
  });

  it("updates coordinates when pin is dragged on the map", async () => {
    const handleChange = vi.fn();
    render(
      <AddressMapPicker
        value={{
          address: "18 Nguyen Hue",
          province: "TP.HCM",
          commune: "Ben Nghe",
          latitude: 10.7731,
          longitude: 106.703,
        }}
        onChange={handleChange}
      />,
    );

    const dragButton = await screen.findByTestId("simulate-pin-drag");
    fireEvent.click(dragButton);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 10.8231,
        longitude: 106.6297,
      }),
    );
  });

  it("allows manual editing of street address, commune, and province fields", () => {
    const handleChange = vi.fn();
    render(
      <AddressMapPicker
        value={{
          address: "Old street",
          province: "Old province",
          commune: "Old commune",
          latitude: 10.1,
          longitude: 106.1,
        }}
        onChange={handleChange}
      />,
    );

    const addressInput = screen.getByDisplayValue("Old street");
    fireEvent.change(addressInput, { target: { value: "New street 456" } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        address: "New street 456",
      }),
    );
  });
});
