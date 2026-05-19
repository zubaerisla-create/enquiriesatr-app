import { api } from "./api";

export type SupportContactData = {
  email: string;
  phone: string;
};

export async function getSupportContact(): Promise<SupportContactData> {
  const response = await api.get<SupportContactData>("/admin/support-contact/", {
    requireAuth: true,
  });
  return response.data;
}
