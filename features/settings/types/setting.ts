export type Setting = {
  id: string;
  key: string;
  value: string;
  type: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SettingsResponse = {
  settings: Setting[];
};

export type UpdateSettingPayload = {
  key: string;
  value: string;
  type?: string;
  description?: string | null;
};

export type UpdateSettingsPayload = {
  settings: UpdateSettingPayload[];
};
