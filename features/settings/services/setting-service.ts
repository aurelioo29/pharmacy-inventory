import { apiFetch } from "@/lib/api-fetch";
import type { SettingsResponse, UpdateSettingsPayload } from "../types/setting";

export const settingService = {
  getSettings() {
    return apiFetch<SettingsResponse>("/api/settings");
  },

  updateSettings(payload: UpdateSettingsPayload) {
    return apiFetch<SettingsResponse>("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
