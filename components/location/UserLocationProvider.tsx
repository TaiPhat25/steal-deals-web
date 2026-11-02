"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getProfile } from "@/lib/api/account";

export type UserCoordinates = {
  latitude: number;
  longitude: number;
};

type UserLocationContextValue = {
  coordinates: UserCoordinates | null;
  isLoading: boolean;
};

const DEFAULT_CONTEXT: UserLocationContextValue = {
  coordinates: null,
  isLoading: false,
};

export const SELECTED_ADDRESS_STORAGE_KEY = "stealdeals.selected-address-id";
export const SELECTED_ADDRESS_CHANGE_EVENT = "stealdeals:selected-address-change";

const UserLocationContext = createContext<UserLocationContextValue>(DEFAULT_CONTEXT);

function validCoordinates(latitude: number | null, longitude: number | null): UserCoordinates | null {
  return latitude !== null && longitude !== null
    && Number.isFinite(latitude) && Number.isFinite(longitude)
    ? { latitude, longitude }
    : null;
}

export default function UserLocationProvider({ children }: { children: ReactNode }) {
  const { accessToken, isInitialized } = useAuth();
  const [location, setLocation] = useState<UserLocationContextValue>({
    coordinates: null,
    isLoading: true,
  });
  const [selectionVersion, setSelectionVersion] = useState(0);

  useEffect(() => {
    const handleSelectedAddressChange = () => setSelectionVersion((version) => version + 1);

    window.addEventListener(SELECTED_ADDRESS_CHANGE_EVENT, handleSelectedAddressChange);
    return () => window.removeEventListener(SELECTED_ADDRESS_CHANGE_EVENT, handleSelectedAddressChange);
  }, []);

  useEffect(() => {
    let active = true;

    if (!isInitialized) return () => { active = false; };

    if (!accessToken) {
      void Promise.resolve().then(() => {
        if (active) setLocation({ coordinates: null, isLoading: false });
      });
      return () => { active = false; };
    }

    void Promise.resolve().then(() => {
      if (active) setLocation((current) => ({ ...current, isLoading: true }));
    });
    void getProfile(accessToken)
      .then((profile) => {
        if (!active) return;

        const selectedAddressId = window.localStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY);
        const address = profile.userAddresses.find((item) => item.id === selectedAddressId)
          ?? profile.userAddresses.find((item) => item.isDefault)
          ?? profile.userAddresses[0];
        setLocation({
          coordinates: address
            ? validCoordinates(address.latitude, address.longitude)
            : null,
          isLoading: false,
        });
      })
      .catch(() => {
        if (active) setLocation({ coordinates: null, isLoading: false });
      });

    return () => { active = false; };
  }, [accessToken, isInitialized, selectionVersion]);

  const value = useMemo(() => location, [location]);

  return (
    <UserLocationContext.Provider value={value}>
      {children}
    </UserLocationContext.Provider>
  );
}

export function useUserLocation() {
  return useContext(UserLocationContext);
}
