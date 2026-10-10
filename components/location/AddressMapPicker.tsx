"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  autocompleteLocations,
  getLocationPlaceDetail,
  type AutocompleteSuggestionResponse,
} from "@/lib/api/location";

const LocationMapView = dynamic(() => import("./LocationMapView"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-label="Loading map"
      className="flex h-80 w-full animate-pulse flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 p-4 text-center text-sm text-gray-400"
    >
      <svg className="mb-2 size-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span>Loading interactive map…</span>
    </div>
  ),
});

export type LocationValue = {
  address: string;
  province?: string;
  commune?: string;
  latitude: number | null;
  longitude: number | null;
};

export interface AddressMapPickerProps {
  value?: LocationValue;
  defaultValue?: LocationValue;
  onChange?: (value: LocationValue) => void;
  accessToken?: string | null;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

function generateSessionToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `st_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function AddressMapPicker({
  value,
  defaultValue,
  onChange,
  accessToken: explicitAccessToken,
  disabled = false,
  className = "",
  label = "Store location & address",
  required = false,
  error,
  hint = "Search for your address or place the pin directly on the map.",
}: AddressMapPickerProps) {
  let contextAuthToken: string | null = null;
  try {
    const auth = useAuth();
    contextAuthToken = auth.accessToken;
  } catch {
    contextAuthToken = null;
  }

  const effectiveToken = explicitAccessToken ?? contextAuthToken;

  const [internalValue, setInternalValue] = useState<LocationValue>(() => ({
    address: value?.address ?? defaultValue?.address ?? "",
    province: value?.province ?? defaultValue?.province ?? "",
    commune: value?.commune ?? defaultValue?.commune ?? "",
    latitude: value?.latitude ?? defaultValue?.latitude ?? null,
    longitude: value?.longitude ?? defaultValue?.longitude ?? null,
  }));

  const activeValue = value !== undefined ? value : internalValue;

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestionResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingDetail, setIsResolvingDetail] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sessionToken, setSessionToken] = useState(() => generateSessionToken());
  const [showManualMap, setShowManualMap] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const hasCoordinates =
    typeof activeValue.latitude === "number" &&
    typeof activeValue.longitude === "number" &&
    !isNaN(activeValue.latitude) &&
    !isNaN(activeValue.longitude);

  const hasAddress = Boolean(activeValue.address && activeValue.address.trim() !== "");
  const isMapVisible = (hasCoordinates && hasAddress) || showManualMap;

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handlePointerDownOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDownOutside);
    return () => {
      document.removeEventListener("mousedown", handlePointerDownOutside);
    };
  }, []);

  const emitChange = useCallback(
    (updates: Partial<LocationValue>) => {
      const nextLocation: LocationValue = {
        address: updates.address !== undefined ? updates.address : (activeValue.address ?? ""),
        province: updates.province !== undefined ? updates.province : (activeValue.province ?? ""),
        commune: updates.commune !== undefined ? updates.commune : (activeValue.commune ?? ""),
        latitude: updates.latitude !== undefined ? updates.latitude : activeValue.latitude,
        longitude: updates.longitude !== undefined ? updates.longitude : activeValue.longitude,
      };

      if (value === undefined) {
        setInternalValue(nextLocation);
      }
      onChange?.(nextLocation);
    },
    [activeValue, onChange, value],
  );

  // Debounced search query execution
  const executeSearch = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length < 3) {
        setSuggestions([]);
        setIsDropdownOpen(false);
        setIsSearching(false);
        setSearchError("");
        return;
      }

      setIsSearching(true);
      setSearchError("");

      try {
        const results = await autocompleteLocations(effectiveToken, {
          input: trimmed,
          sessionToken,
          latitude: activeValue.latitude ?? undefined,
          longitude: activeValue.longitude ?? undefined,
        });

        setSuggestions(results);
        setIsDropdownOpen(true);
      } catch (caught) {
        setSearchError(
          caught instanceof Error ? caught.message : "Unable to load address suggestions.",
        );
        setSuggestions([]);
        setIsDropdownOpen(true);
      } finally {
        setIsSearching(false);
      }
    },
    [activeValue.latitude, activeValue.longitude, effectiveToken, sessionToken],
  );

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    setSearchQuery(val);

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length >= 3) {
      debounceTimerRef.current = window.setTimeout(() => {
        void executeSearch(val);
      }, 350);
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setIsDropdownOpen(false);
    setSearchError("");
  };

  const handleSelectSuggestion = async (suggestion: AutocompleteSuggestionResponse) => {
    setIsDropdownOpen(false);
    setSearchQuery(suggestion.description);

    let lat = suggestion.latitude;
    let lng = suggestion.longitude;
    let commune = suggestion.commune ?? activeValue.commune ?? "";
    let province = suggestion.province ?? activeValue.province ?? "";
    let resolvedAddress = suggestion.description;

    // Fall back to place-detail if coordinates are absent from autocomplete
    if (lat === null || lat === undefined || lng === null || lng === undefined) {
      setIsResolvingDetail(true);
      try {
        const detail = await getLocationPlaceDetail(effectiveToken, {
          placeId: suggestion.placeId,
          sessionToken,
        });
        lat = detail.latitude;
        lng = detail.longitude;
        if (detail.commune) commune = detail.commune;
        if (detail.province) province = detail.province;
        if (detail.formattedAddress) resolvedAddress = detail.formattedAddress;
      } catch {
        // Keep partial data if detail retrieval fails
      } finally {
        setIsResolvingDetail(false);
      }
    }

    emitChange({
      address: resolvedAddress,
      province,
      commune,
      latitude: lat ?? null,
      longitude: lng ?? null,
    });

    // Refresh session token for the next autocomplete cycle
    setSessionToken(generateSessionToken());
  };

  const handleCoordinatesChange = useCallback(
    (lat: number, lng: number) => {
      emitChange({
        latitude: lat,
        longitude: lng,
      });
    },
    [emitChange],
  );

  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setShowManualMap(true);
        emitChange({
          latitude: Math.round(pos.coords.latitude * 1000000) / 1000000,
          longitude: Math.round(pos.coords.longitude * 1000000) / 1000000,
        });
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const inputClass =
    "mt-1.5 h-10 w-full rounded-xl border-none bg-gray-100 px-3.5 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary disabled:opacity-60";

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label className="text-sm font-semibold text-gray-900">
          {label} {required && <span className="text-error">*</span>}
        </label>
        {hint && <span className="text-xs text-light-secondary-text">{hint}</span>}
      </div>

      {/* Search Input with Autocomplete Dropdown */}
      <div ref={searchContainerRef} className="relative">
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-3.5 text-gray-400" aria-hidden="true">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>

          <input
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isDropdownOpen}
            aria-controls="address-suggestions-list"
            placeholder="Search address or landmark (min 3 characters)…"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={() => {
              if (suggestions.length > 0 || searchError) {
                setIsDropdownOpen(true);
              }
            }}
            disabled={disabled}
            className="h-11 w-full rounded-xl border-none bg-gray-100 pl-10 pr-20 text-sm ring ring-gray-500/20 focus:ring-2 focus:ring-primary"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {(isSearching || isResolvingDetail) && (
              <span role="status" aria-label="Searching locations">
                <svg className="size-4 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </span>
            )}

            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                title="Clear search"
                aria-label="Clear search input"
                className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              >
                <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Suggestions */}
        {isDropdownOpen && (
          <div
            id="address-suggestions-list"
            role="listbox"
            className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
          >
            {isSearching && suggestions.length === 0 && (
              <div className="p-3 text-center text-xs text-gray-500">Searching address suggestions…</div>
            )}

            {searchError && (
              <div className="p-3 text-xs text-error">
                <p className="font-semibold">Unable to fetch suggestions</p>
                <p className="mt-0.5 text-gray-500">You can type your address manually below and drop a pin on the map.</p>
              </div>
            )}

            {!isSearching && !searchError && suggestions.length === 0 && (
              <div className="p-3 text-center text-xs text-gray-500">
                No matching locations found. You can enter details manually below.
              </div>
            )}

            {suggestions.map((item) => (
              <button
                key={item.placeId}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => void handleSelectSuggestion(item)}
                className="flex w-full items-start gap-2.5 rounded-lg p-2.5 text-left text-sm transition-colors hover:bg-primary-lighter/40 focus:bg-primary-lighter/40"
              >
                <span className="mt-0.5 shrink-0 text-primary" aria-hidden="true">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">
                    {item.mainText || item.description}
                  </p>
                  {item.secondaryText && (
                    <p className="truncate text-xs text-light-secondary-text">
                      {item.secondaryText}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Map View or Placeholder */}
      <div>
        {isMapVisible ? (
          <>
            <LocationMapView
              latitude={activeValue.latitude}
              longitude={activeValue.longitude}
              onCoordinatesChange={handleCoordinatesChange}
              disabled={disabled}
            />
            <div className="mt-1.5 flex items-center justify-between text-xs text-light-secondary-text">
              <span>💡 Tip: Click anywhere on the map or drag the pin marker to fine-tune exact storefront entrance.</span>
            </div>
          </>
        ) : (
          <div
            data-testid="map-placeholder"
            className="flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/80 p-6 text-center"
          >
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-800">Map will appear once an address is entered</p>
            <p className="mt-1 max-w-md text-xs text-light-secondary-text">
              Search your store address above and select a suggestion, or type details below to display your location on the map.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {typeof window !== "undefined" && "geolocation" in navigator && (
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={disabled || isLocating}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-60"
                >
                  <svg className="size-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                    <path strokeWidth="2" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                  </svg>
                  {isLocating ? "Getting location…" : "Use current device location"}
                </button>
              )}
              <button
                type="button"
                data-testid="open-map-manually"
                onClick={() => setShowManualMap(true)}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-60"
              >
                <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Place pin manually on map
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Address Details Fields */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <label className="text-xs font-semibold sm:col-span-2 md:col-span-3">
          Street address / Specific address *
          <input
            type="text"
            required={required}
            disabled={disabled}
            value={activeValue.address ?? ""}
            onChange={(e) => emitChange({ address: e.target.value })}
            placeholder="e.g. 18 Nguyễn Huệ"
            className={inputClass}
          />
        </label>

        <label className="text-xs font-semibold">
          Ward / Commune (Phường / Xã)
          <input
            type="text"
            disabled={disabled}
            value={activeValue.commune ?? ""}
            onChange={(e) => emitChange({ commune: e.target.value })}
            placeholder="e.g. Phường Bến Nghé"
            className={inputClass}
          />
        </label>

        <label className="text-xs font-semibold">
          Province / City (Tỉnh / Thành phố)
          <input
            type="text"
            disabled={disabled}
            value={activeValue.province ?? ""}
            onChange={(e) => emitChange({ province: e.target.value })}
            placeholder="e.g. Thành phố Hồ Chí Minh"
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-2 sm:col-span-2 md:col-span-1">
          <label className="text-xs font-semibold">
            Latitude
            <input
              type="number"
              step="any"
              disabled={disabled}
              value={activeValue.latitude ?? ""}
              onChange={(e) => {
                const val = e.target.value === "" ? null : parseFloat(e.target.value);
                emitChange({ latitude: val });
              }}
              placeholder="10.7731"
              className={inputClass}
            />
          </label>
          <label className="text-xs font-semibold">
            Longitude
            <input
              type="number"
              step="any"
              disabled={disabled}
              value={activeValue.longitude ?? ""}
              onChange={(e) => {
                const val = e.target.value === "" ? null : parseFloat(e.target.value);
                emitChange({ longitude: val });
              }}
              placeholder="106.703"
              className={inputClass}
            />
          </label>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
