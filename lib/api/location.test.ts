import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  autocompleteLocations,
  buildAutocompleteQueryParams,
  getLocationPlaceDetail,
  DEMO_LOCATION_SUGGESTIONS,
} from "./location";

describe("location API", () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = process.env.NEXT_PUBLIC_STORE_API_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_STORE_API_URL = "http://store.test";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_STORE_API_URL = originalEnv;
    vi.restoreAllMocks();
  });

  describe("buildAutocompleteQueryParams", () => {
    it("serializes input properly", () => {
      const params = buildAutocompleteQueryParams({ input: "  18 Nguyen Hue  " });
      expect(params.get("input")).toBe("18 Nguyen Hue");
      expect(params.get("sessionToken")).toBeNull();
      expect(params.get("latitude")).toBeNull();
      expect(params.get("longitude")).toBeNull();
    });

    it("includes optional sessionToken and proximity coordinates when supplied", () => {
      const params = buildAutocompleteQueryParams({
        input: "Ben Thanh",
        sessionToken: "token-123",
        latitude: 10.7731,
        longitude: 106.703,
      });

      expect(params.get("input")).toBe("Ben Thanh");
      expect(params.get("sessionToken")).toBe("token-123");
      expect(params.get("latitude")).toBe("10.7731");
      expect(params.get("longitude")).toBe("106.703");
    });
  });

  describe("autocompleteLocations", () => {
    it("calls /api/locations/autocomplete with Bearer header and query params", async () => {
      let requestedUrl = "";
      let authHeader = "";

      globalThis.fetch = vi.fn().mockImplementation((url: string, options?: RequestInit) => {
        requestedUrl = url;
        authHeader = new Headers(options?.headers).get("Authorization") ?? "";
        return Promise.resolve(
          Response.json([
            {
              placeId: "p1",
              description: "18 Nguyen Hue, District 1, HCMC",
              latitude: 10.7731,
              longitude: 106.703,
            },
          ]),
        );
      });

      const results = await autocompleteLocations("my-seller-token", {
        input: "Nguyen Hue",
        sessionToken: "session-abc",
      });

      expect(requestedUrl).toContain("http://store.test/api/locations/autocomplete");
      expect(requestedUrl).toContain("input=Nguyen+Hue");
      expect(requestedUrl).toContain("sessionToken=session-abc");
      expect(authHeader).toBe("Bearer my-seller-token");
      expect(results).toHaveLength(1);
      expect(results[0].placeId).toBe("p1");
    });

    it("falls back to demo suggestions when network error occurs", async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("fetch failed"));

      const results = await autocompleteLocations("my-token", {
        input: "Nguyễn Huệ",
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].description).toContain("Nguyễn Huệ");
    });
  });

  describe("getLocationPlaceDetail", () => {
    it("calls /api/locations/place-detail with placeId query", async () => {
      let requestedUrl = "";

      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        requestedUrl = url;
        return Promise.resolve(
          Response.json({
            placeId: "p1",
            name: "Central Post Office",
            formattedAddress: "2 Cong xa Paris, Ben Nghe, District 1, HCMC",
            latitude: 10.7798,
            longitude: 106.6999,
            commune: "Ben Nghe",
            province: "Ho Chi Minh",
          }),
        );
      });

      const detail = await getLocationPlaceDetail("token-xyz", {
        placeId: "p1",
        sessionToken: "sess-1",
      });

      expect(requestedUrl).toContain("http://store.test/api/locations/place-detail");
      expect(requestedUrl).toContain("placeId=p1");
      expect(requestedUrl).toContain("sessionToken=sess-1");
      expect(detail.name).toBe("Central Post Office");
      expect(detail.latitude).toBe(10.7798);
      expect(detail.longitude).toBe(106.6999);
    });

    it("returns demo location details when network fails", async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("fetch failed"));

      const demo = DEMO_LOCATION_SUGGESTIONS[0];
      const detail = await getLocationPlaceDetail("token-xyz", {
        placeId: demo.placeId,
      });

      expect(detail.placeId).toBe(demo.placeId);
      expect(detail.formattedAddress).toBe(demo.description);
      expect(detail.latitude).toBe(demo.latitude);
    });
  });
});
