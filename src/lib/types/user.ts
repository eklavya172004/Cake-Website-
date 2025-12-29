export interface Address {
  label?: string;          // Home / Work
  name?: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

// shared between client and server
// Shared User Data Transfer Object
// shared domain types 
export interface UserDTO {
  id: string;
  email: string;
  phone?: string;
  name: string;
  avatar?: string;
  savedAddresses: Address[];
  fcmToken?: string;
  createdAt: string;
  updatedAt: string;
}
