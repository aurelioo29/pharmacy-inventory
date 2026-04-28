import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { settingService } from "../services/setting-service";
import type { UpdateSettingsPayload } from "../types/setting";

export const SETTINGS_QUERY_KEY = "settings";

export function useSettings() {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY],
    queryFn: () => settingService.getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) =>
      settingService.updateSettings(payload),
    onSuccess: () => {
      message.success("Settings berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal memperbarui settings");
    },
  });
}
