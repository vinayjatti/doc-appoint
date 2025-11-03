import { create } from "zustand";

interface DoctorState {
  doctorName: string | null;
  doctorId: string | null;
  token: string | null;
  setDoctor: (data: { doctorName: string; doctorId: string; token: string }) => void;
  logout: () => void;
}

export const useDoctorStore = create<DoctorState>((set) => ({
  doctorName: localStorage.getItem("doctorName"),
  doctorId: localStorage.getItem("doctorId"),
  token: localStorage.getItem("doctorToken"),

  setDoctor: ({ doctorName, doctorId, token }) => {
    localStorage.setItem("doctorName", doctorName);
    localStorage.setItem("doctorId", doctorId);
    localStorage.setItem("doctorToken", token);

    set({ doctorName, doctorId, token });
  },

  logout: () => {
    localStorage.clear();
    set({ doctorName: null, doctorId: null, token: null });
  },
}));