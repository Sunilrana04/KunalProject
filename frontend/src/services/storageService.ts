import { INITIAL_PROFILES } from "../constants";
import type { Profile } from "../types";

const STORAGE_KEY = "profiles";

export const storageService = {
  getProfiles(): Profile[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_PROFILES;
  },

  saveProfiles(profiles: Profile[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  },
};
