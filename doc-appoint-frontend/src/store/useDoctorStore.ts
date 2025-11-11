import { create } from "zustand";

interface DoctorState {
  doctorName: string | null;
  doctorId: string | null;
  token: string | null;
  loginTime?: string | null;
  sessionDuration?: string | null;
  bookingSlotsType?: string | null;
  userRole?: string | null;
  setDoctor: (data: {
    doctorName: string;
    doctorId: string;
    token: string;
    loginTime: string;
    sessionDuration: string;
    bookingSlotsType: string;
    userRole?: string;
  }) => void;
  logout: () => void;
}

export const useDoctorStore = create<DoctorState>((set) => ({
  doctorName: localStorage.getItem("doctorName"),
  doctorId: localStorage.getItem("doctorId"),
  token: localStorage.getItem("doctorToken"),
  loginTime: localStorage.getItem("loginTime"),
  sessionDuration: localStorage.getItem("sessionDuration"),
  bookingSlotsType: localStorage.getItem("bookingSlotsType"),
  userRole: localStorage.getItem("userRole"),

  setDoctor: ({
    doctorName,
    doctorId,
    token,
    loginTime,
    sessionDuration,
    bookingSlotsType,
    userRole
  }) => {
    localStorage.setItem("doctorName", doctorName);
    localStorage.setItem("doctorId", doctorId);
    localStorage.setItem("doctorToken", token);
    localStorage.setItem("loginTime", loginTime);
    localStorage.setItem("sessionDuration", sessionDuration);
    localStorage.setItem("bookingSlotsType", bookingSlotsType);
    localStorage.setItem("userRole", userRole || "user");

    set({
      doctorName,
      doctorId,
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
      doctorName: null,
      doctorId: null,
      token: null,
      loginTime: null,
      sessionDuration: null,
      bookingSlotsType: null,
      userRole: null,
    });
  },
}));