export interface Guide {
  id: string;
  name: string;
  specialty: string;
  role: string;
  rating: number;
  image_url: string;
  zalo_number: string;
  bio: string;
  years_experience: number;
  languages: string;
  is_active: boolean;
  created_at: string;
}

export interface Destination {
  id: string;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface Review {
  id: string;
  reviewer_name: string;
  reviewer_location: string;
  stars: number;
  review_text: string;
  avatar_url: string;
  is_approved: boolean;
  user_id?: string | null;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  package_type: string;
  client_name: string;
  email: string;
  phone: string;
  preferred_date?: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  user_id?: string;
  guide_id?: string;
  points_earned: number;
  discount_pct: number;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
