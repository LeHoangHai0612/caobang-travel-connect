export interface Guide {
  id: string;
  name: string;
  specialty: string;
  role: string;
  rating: number;
  image_url: string;
  zalo_number: string;
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
  created_at: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
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
