import { create } from "zustand";

interface ProviderState {
  providerName: string | null;
  providerId: string | null;
  token: string | null;
  loginTime?: string | null;
  sessionDuration?: string | null;
  bookingSlotsType?: string | null;
  userRole?: string | null;
  setProvider: (data: {
    providerName: string;
    providerId: string;
    token: string;
    loginTime: string;
    sessionDuration: string;
    bookingSlotsType: string;
    userRole?: string;
  }) => void;
  logout: () => void;
}

export const useProviderStore = create<ProviderState>((set) => ({
  providerName: localStorage.getItem("providerName"),
  providerId: localStorage.getItem("providerId"),
  token: localStorage.getItem("doctorToken"),
  loginTime: localStorage.getItem("loginTime"),
  sessionDuration: localStorage.getItem("sessionDuration"),
  bookingSlotsType: localStorage.getItem("bookingSlotsType"),
  userRole: localStorage.getItem("userRole"),

  setProvider: ({
    providerName,
    providerId,
    token,
    loginTime,
    sessionDuration,
    bookingSlotsType,
    userRole
  }) => {
    localStorage.setItem("providerName", providerName);
    localStorage.setItem("providerId", providerId);
    localStorage.setItem("doctorToken", token);
    localStorage.setItem("loginTime", loginTime);
    localStorage.setItem("sessionDuration", sessionDuration);
    localStorage.setItem("bookingSlotsType", bookingSlotsType);
    localStorage.setItem("userRole", userRole || "user");

    set({
      providerName,
      providerId,
      token,
      loginTime,
      sessionDuration,
      bookingSlotsType,
      userRole
    });
  },

  logout: () => {
    localStorage.clear();
    set({
      providerName: null,
      providerId: null,
      token: null,
      loginTime: null,
      sessionDuration: null,
      bookingSlotsType: null,
      userRole: null,
    });
  },
}));