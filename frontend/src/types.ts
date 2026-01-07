export type Complexion =
  | "Fair"
  | "Medium"
  | "Wheatish"
  | "Olive"
  | "Dark";

export interface Profile {
  _id: string;
  name: string;
  age: number;
  height: string;
  complexion: Complexion;
  location: string;
  imageUrl: string;
  galleryImages?: string[];
  description: string;
  contactInfo: string;
  isFeatured: boolean;
  contactClicks: number;
  createdAt: string;
}

export interface DashboardStats {
  totalProfiles: number;
  featuredCount: number;
  totalContactClicks: number;
  locationCounts: Record<string, number>;
}
