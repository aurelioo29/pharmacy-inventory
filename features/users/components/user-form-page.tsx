"use client";

import { Checkbox, DatePicker, Form, Input } from "antd";
import type { MenuProps } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import FilterDropdown from "@/components/ui/filters/filter-dropdown";
import FormActions from "@/components/ui/form/form-actions";
import FormCard from "@/components/ui/form/form-card";
import FormDropdownField from "@/components/ui/form/form-dropdown-field";
import FormPageShell from "@/components/ui/form/form-page-shell";
import RequiredLabel from "@/components/ui/required-label";

import {
  useCreateUser,
  useRoles,
  useUpdateUser,
  useUser,
} from "../hooks/use-users";
import type { CreateUserPayload, UpdateUserPayload } from "../types/user";

type UserFormPageProps = {
  mode: "create" | "edit";
  userId?: string;
};

type UserFormValues = {
  name: string;
  username: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  roleIds: string[];
  isActive?: boolean;
  birthPlace?: string;
  birthDate?: Dayjs | null;
  religion?: string | null;
  education?: string | null;
  bloodType?: string | null;
  maritalStatus?: string | null;
  gender?: string | null;
};

const religionOptions = [
  "Islam",
  "Kristen",
  "Katolik",
  "Buddha",
  "Konghucu",
  "Other",
];

const educationOptions = ["SD", "SMP", "SMA/SMK", "D1", "D2", "D3", "D4", "S1"];

const bloodTypeOptions = ["A", "B", "AB", "O", "-"];

const maritalStatusOptions = [
  "BELUM KAWIN",
  "KAWIN",
  "CERAI HIDUP",
  "CERAI MATI",
];

const genderOptions = ["Laki-laki", "Perempuan"];

function createDropdownItems(
  options: string[],
  fieldName: keyof UserFormValues,
  form: ReturnType<typeof Form.useForm<UserFormValues>>[0],
): MenuProps["items"] {
  return options.map((item) => ({
    key: item,
    label: item,
    onClick: () => form.setFieldValue(fieldName, item),
  }));
}

export default function UserFormPage({ mode, userId }: UserFormPageProps) {
  const router = useRouter();
  const [form] = Form.useForm<UserFormValues>();

  const rolesQuery = useRoles();
  const userQuery = useUser(userId || "");

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const user = userQuery.data?.data;
  const roles = rolesQuery.data?.data || [];

  const religion = Form.useWatch("religion", form);
  const education = Form.useWatch("education", form);
  const bloodType = Form.useWatch("bloodType", form);
  const maritalStatus = Form.useWatch("maritalStatus", form);
  const gender = Form.useWatch("gender", form);

  useEffect(() => {
    if (mode === "edit" && user) {
      form.setFieldsValue({
        name: user.name,
        username: user.username,
        email: user.email || "",
        roleIds: user.roles.map((item) => item.role.id),
        isActive: user.isActive,
        birthPlace: user.birthPlace || "",
        birthDate: user.birthDate ? dayjs(user.birthDate) : null,
        religion: user.religion || null,
        education: user.education || null,
        bloodType: user.bloodType || null,
        maritalStatus: user.maritalStatus || null,
        gender: user.gender || null,
      });
    }

    if (mode === "create") {
      form.setFieldsValue({
        isActive: true,
        roleIds: [],
        religion: null,
        education: null,
        bloodType: null,
        maritalStatus: null,
        gender: null,
      });
    }
  }, [mode, user, form]);

  const religionItems = useMemo(
    () => createDropdownItems(religionOptions, "religion", form),
    [form],
  );

  const educationItems = useMemo(
    () => createDropdownItems(educationOptions, "education", form),
    [form],
  );

  const bloodTypeItems = useMemo(
    () => createDropdownItems(bloodTypeOptions, "bloodType", form),
    [form],
  );

  const maritalStatusItems = useMemo(
    () => createDropdownItems(maritalStatusOptions, "maritalStatus", form),
    [form],
  );

  const genderItems = useMemo(
    () => createDropdownItems(genderOptions, "gender", form),
    [form],
  );

  function handleFinish(values: UserFormValues) {
    const basePayload = {
      name: values.name,
      username: values.username,
      email: values.email || null,
      roleIds: values.roleIds,
      birthPlace: values.birthPlace || null,
      birthDate: values.birthDate ? values.birthDate.toISOString() : null,
      religion: values.religion || null,
      education: values.education || null,
      bloodType: values.bloodType || null,
      maritalStatus: values.maritalStatus || null,
      gender: values.gender || null,
    };

    if (mode === "create") {
      createUser.mutate(
        {
          ...basePayload,
          password: values.password || "",
        } as CreateUserPayload,
        {
          onSuccess: () => router.push("/master_data/users"),
        },
      );

      return;
    }

    if (!userId) return;

    updateUser.mutate(
      {
        id: userId,
        payload: {
          ...basePayload,
          password: values.password || undefined,
          isActive: values.isActive,
        } as UpdateUserPayload,
      },
      {
        onSuccess: () => router.push("/master_data/users"),
      },
    );
  }

  const loading =
    createUser.isPending || updateUser.isPending || userQuery.isLoading;

  return (
    <FormPageShell
      backText="Back to Users"
      onBack={() => router.push("/master_data/users")}
    >
      <FormCard>
        <Form<UserFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleFinish}
        >
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item
              label={<RequiredLabel required>Name</RequiredLabel>}
              name="name"
              rules={[{ required: true, message: "Name wajib diisi" }]}
            >
              <Input className="his-form-input" placeholder="Masukkan name" />
            </Form.Item>

            <Form.Item
              label={<RequiredLabel required>Username</RequiredLabel>}
              name="username"
              rules={[
                { required: true, message: "Username wajib diisi" },
                { min: 3, message: "Username minimal 3 karakter" },
              ]}
            >
              <Input
                className="his-form-input"
                placeholder="Masukkan username"
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ type: "email", message: "Format email tidak valid" }]}
            >
              <Input className="his-form-input" placeholder="Email optional" />
            </Form.Item>

            <Form.Item label="Birth Place" name="birthPlace">
              <Input className="his-form-input" placeholder="Tempat lahir" />
            </Form.Item>

            <Form.Item label="Birth Date" name="birthDate">
              <DatePicker
                className="his-form-input w-full"
                format="DD-MM-YYYY"
                placeholder="Select date"
              />
            </Form.Item>

            <FormDropdownField
              label="Religion"
              name="religion"
              value={religion}
              placeholder="Pilih agama"
              items={religionItems}
            />

            <FormDropdownField
              label="Education"
              name="education"
              value={education}
              placeholder="Pilih pendidikan"
              items={educationItems}
            />

            <FormDropdownField
              label="Blood Type"
              name="bloodType"
              value={bloodType}
              placeholder="Pilih golongan darah"
              items={bloodTypeItems}
            />

            <FormDropdownField
              label="Marital Status"
              name="maritalStatus"
              value={maritalStatus}
              placeholder="Pilih status perkawinan"
              items={maritalStatusItems}
            />

            <FormDropdownField
              label="Gender"
              name="gender"
              value={gender}
              placeholder="Pilih gender"
              items={genderItems}
            />

            <Form.Item
              label={
                <RequiredLabel required={mode === "create"}>
                  {mode === "create" ? "Password" : "Password Baru"}
                </RequiredLabel>
              }
              name="password"
              rules={
                mode === "create"
                  ? [
                      { required: true, message: "Password wajib diisi" },
                      { min: 6, message: "Password minimal 6 karakter" },
                    ]
                  : [{ min: 6, message: "Password minimal 6 karakter" }]
              }
            >
              <Input.Password
                className="his-form-input"
                placeholder="Masukkan password"
              />
            </Form.Item>

            <Form.Item
              label={
                <RequiredLabel required={mode === "create"}>
                  Confirm Password
                </RequiredLabel>
              }
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const password = getFieldValue("password");

                    if (!password && mode === "edit") return Promise.resolve();

                    if (!value && mode === "create") {
                      return Promise.reject(
                        new Error("Confirm password wajib diisi"),
                      );
                    }

                    if (password && password !== value) {
                      return Promise.reject(new Error("Password tidak sama"));
                    }

                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input.Password
                className="his-form-input"
                placeholder="Ulangi password"
              />
            </Form.Item>

            <Form.Item
              label="Role"
              name="roleIds"
              rules={[{ required: true, message: "Role wajib dipilih" }]}
              className="md:col-span-2"
            >
              <Checkbox.Group className="w-full">
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {roles.map((role) => (
                    <Checkbox key={role.id} value={role.id}>
                      {role.name}
                    </Checkbox>
                  ))}
                </div>
              </Checkbox.Group>
            </Form.Item>
          </div>

          <FormActions loading={loading} onSave={() => form.submit()} />
        </Form>
      </FormCard>
    </FormPageShell>
  );
}
