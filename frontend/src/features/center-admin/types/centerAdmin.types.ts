export interface CenterInfo {
  id: string | number;
  name: string;
  address: string;
  phone: string;
  email: string;
  monthlyFee: number;
  description: string;
  images: string[];
}

export type UpdateCenterPayload = Partial<Omit<CenterInfo, "id">>;