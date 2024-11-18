export interface IUser {
  fullName?: string;
  email: string;
  phone?: string;
  country?: string;
  national_number?: number;
  businessName?: string;
  organization_number?: number;
  address?: string;
  password: string;
  otp?: string;
  jti?: string | any;
  profileImage?: string;
  role?: "1" | "2";
  deviceType?: string | any;
  deviceToken?: string | any;
  isActive?: boolean;
  isVerified?: boolean;
  isDeleted?: boolean;
  language?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
