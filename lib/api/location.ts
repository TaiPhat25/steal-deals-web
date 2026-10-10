import { apiRequest } from "@/lib/api/client";

export interface LocationAutocompleteQueryRequest {
  input: string;
  sessionToken?: string;
  latitude?: number;
  longitude?: number;
}

export interface LocationPlaceDetailQueryRequest {
  placeId: string;
  sessionToken?: string;
}

export interface AutocompleteSuggestionResponse {
  placeId: string;
  description: string;
  mainText?: string | null;
  secondaryText?: string | null;
  commune?: string | null;
  province?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PlaceDetailResponse {
  placeId: string;
  name?: string | null;
  formattedAddress?: string | null;
  latitude: number;
  longitude: number;
  commune?: string | null;
  province?: string | null;
}

export const DEMO_LOCATION_SUGGESTIONS: AutocompleteSuggestionResponse[] = [
  {
    placeId: "demo-loc-hcm-1",
    description: "18 Nguyễn Huệ, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh",
    mainText: "18 Nguyễn Huệ",
    secondaryText: "Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh",
    commune: "Phường Bến Nghé",
    province: "Thành phố Hồ Chí Minh",
    latitude: 10.7731,
    longitude: 106.703,
  },
  {
    placeId: "demo-loc-hcm-2",
    description: "135 Nam Kỳ Khởi Nghĩa, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh",
    mainText: "Dinh Độc Lập (135 Nam Kỳ Khởi Nghĩa)",
    secondaryText: "Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh",
    commune: "Phường Bến Thành",
    province: "Thành phố Hồ Chí Minh",
    latitude: 10.777,
    longitude: 106.6954,
  },
  {
    placeId: "demo-loc-hn-1",
    description: "1 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Thành phố Hà Nội",
    mainText: "Nhà hát Lớn Hà Nội (1 Tràng Tiền)",
    secondaryText: "Phường Tràng Tiền, Quận Hoàn Kiếm, Thành phố Hà Nội",
    commune: "Phường Tràng Tiền",
    province: "Thành phố Hà Nội",
    latitude: 21.0245,
    longitude: 105.8576,
  },
  {
    placeId: "demo-loc-dn-1",
    description: "Đường 2 Tháng 9, Phường Bình Hiên, Quận Hải Châu, Thành phố Đà Nẵng",
    mainText: "Cầu Rồng (Đường 2 Tháng 9)",
    secondaryText: "Phường Bình Hiên, Quận Hải Châu, Thành phố Đà Nẵng",
    commune: "Phường Bình Hiên",
    province: "Thành phố Đà Nẵng",
    latitude: 16.061,
    longitude: 108.2235,
  },
];

function storeApiBaseUrl() {
  return process.env.NEXT_PUBLIC_STORE_API_URL;
}

function bearer(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function buildAutocompleteQueryParams(query: LocationAutocompleteQueryRequest): URLSearchParams {
  const searchParams = new URLSearchParams({ input: query.input.trim() });
  if (query.sessionToken) {
    searchParams.set("sessionToken", query.sessionToken);
  }
  if (query.latitude !== undefined && query.latitude !== null && !isNaN(query.latitude)) {
    searchParams.set("latitude", String(query.latitude));
  }
  if (query.longitude !== undefined && query.longitude !== null && !isNaN(query.longitude)) {
    searchParams.set("longitude", String(query.longitude));
  }
  return searchParams;
}

type GeoapifyRawFeature = {
  properties?: {
    place_id?: string;
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    street?: string;
    name?: string;
    suburb?: string;
    quarter?: string;
    district?: string;
    state?: string;
    city?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  geometry?: {
    coordinates?: [number, number];
  };
};

async function queryGeoapifyDirectAutocomplete(
  query: LocationAutocompleteQueryRequest,
  apiKey: string,
): Promise<AutocompleteSuggestionResponse[]> {
  const trimmed = query.input.trim();
  let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(trimmed)}&filter=countrycode:vn&lang=vi&apiKey=${encodeURIComponent(apiKey)}`;

  if (query.latitude !== undefined && query.longitude !== undefined) {
    url += `&bias=proximity:${encodeURIComponent(`${query.longitude},${query.latitude}`)}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geoapify error status: ${response.status}`);
  }

  const data = (await response.json()) as { features?: GeoapifyRawFeature[] };
  const features = data.features ?? [];

  return features
    .filter((f): f is GeoapifyRawFeature & { properties: { place_id: string } } => Boolean(f.properties?.place_id))
    .map((f) => {
      const p = f.properties;
      const mainText = p.address_line1 || p.street || p.name || p.formatted || "";
      const secondaryText =
        p.address_line2 ||
        [p.suburb || p.quarter, p.district, p.state || p.city, p.country]
          .filter(Boolean)
          .join(", ");

      return {
        placeId: p.place_id,
        description: p.formatted || `${mainText}, ${secondaryText}`.trim().replace(/^, |, $/g, ""),
        mainText,
        secondaryText: secondaryText || null,
        commune: p.suburb || p.quarter || null,
        province: p.state || p.city || null,
        latitude: p.lat ?? f.geometry?.coordinates?.[1] ?? null,
        longitude: p.lon ?? f.geometry?.coordinates?.[0] ?? null,
      };
    });
}

async function queryGeoapifyDirectPlaceDetail(
  placeId: string,
  apiKey: string,
): Promise<PlaceDetailResponse> {
  const url = `https://api.geoapify.com/v1/geocode/place-details?id=${encodeURIComponent(placeId)}&apiKey=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geoapify place detail error status: ${response.status}`);
  }

  const data = (await response.json()) as { features?: GeoapifyRawFeature[] };
  const feature = data.features?.[0];
  const p = feature?.properties;

  return {
    placeId,
    name: p?.name || p?.address_line1 || null,
    formattedAddress: p?.formatted || null,
    latitude: p?.lat ?? feature?.geometry?.coordinates?.[1] ?? 0,
    longitude: p?.lon ?? feature?.geometry?.coordinates?.[0] ?? 0,
    commune: p?.suburb || p?.quarter || null,
    province: p?.state || p?.city || null,
  };
}

export async function autocompleteLocations(
  accessToken: string | null | undefined,
  query: LocationAutocompleteQueryRequest,
): Promise<AutocompleteSuggestionResponse[]> {
  const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY?.trim();

  // If accessToken is present, query backend proxy first
  if (accessToken) {
    try {
      const params = buildAutocompleteQueryParams(query);
      return await apiRequest<AutocompleteSuggestionResponse[]>(
        `/api/locations/autocomplete?${params.toString()}`,
        {
          method: "GET",
          headers: bearer(accessToken),
        },
        storeApiBaseUrl(),
      );
    } catch {
      // Backend proxy failed (e.g. backend CORS redirect, unconfigured backend key, or network issue).
      // Fall through to direct Geoapify query if API key is configured in frontend.
    }
  }

  // Direct Geoapify query using NEXT_PUBLIC_GEOAPIFY_API_KEY
  if (geoapifyKey) {
    try {
      return await queryGeoapifyDirectAutocomplete(query, geoapifyKey);
    } catch {
      // Fall through to in-memory demo data if Geoapify network fails
    }
  }

  // Fallback to in-memory demo suggestions if offline
  const normalizedInput = query.input.trim().toLowerCase();
  const matched = DEMO_LOCATION_SUGGESTIONS.filter(
    (item) =>
      item.description.toLowerCase().includes(normalizedInput) ||
      (item.mainText && item.mainText.toLowerCase().includes(normalizedInput)),
  );
  return matched.length > 0 ? matched : DEMO_LOCATION_SUGGESTIONS.slice(0, 2);
}

export async function getLocationPlaceDetail(
  accessToken: string | null | undefined,
  query: LocationPlaceDetailQueryRequest,
): Promise<PlaceDetailResponse> {
  const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY?.trim();

  if (accessToken) {
    try {
      const searchParams = new URLSearchParams({ placeId: query.placeId });
      if (query.sessionToken) {
        searchParams.set("sessionToken", query.sessionToken);
      }

      return await apiRequest<PlaceDetailResponse>(
        `/api/locations/place-detail?${searchParams.toString()}`,
        {
          method: "GET",
          headers: bearer(accessToken),
        },
        storeApiBaseUrl(),
      );
    } catch {
      // Backend failed, fall through to Geoapify
    }
  }

  if (geoapifyKey) {
    try {
      return await queryGeoapifyDirectPlaceDetail(query.placeId, geoapifyKey);
    } catch {
      // Fall through to demo
    }
  }

  const demo = DEMO_LOCATION_SUGGESTIONS.find((item) => item.placeId === query.placeId);
  if (demo) {
    return {
      placeId: demo.placeId,
      name: demo.mainText ?? demo.description,
      formattedAddress: demo.description,
      latitude: demo.latitude ?? 10.7731,
      longitude: demo.longitude ?? 106.703,
      commune: demo.commune,
      province: demo.province,
    };
  }

  throw new Error("Unable to retrieve place details.");
}
