// UberFix Types

export type ServiceType = 'electrical' | 'plumbing' | 'ac' | 'carpentry' | 'painting' | 'general';

export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export type TechnicianStatus = 'available' | 'busy' | 'offline';

export interface Branch {
  id: string;
  branch_code: string;
  name: string;
  name_ar?: string;
  address: string;
  branch_type: string;
  latitude: number;
  longitude: number;
  map_link?: string;
  icon_url?: string;
  phone?: string;
  is_active: boolean;
  chain_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Technician {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  avatar_url?: string;
  specialty: ServiceType;
  secondary_skills?: ServiceType[];
  status: TechnicianStatus;
  latitude?: number;
  longitude?: number;
  rating: number;
  total_reviews: number;
  total_orders: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceOrder {
  id: string;
  order_number: string;
  branch_id?: string;
  technician_id?: string;
  requested_by?: string;
  service_type: ServiceType;
  title: string;
  description?: string;
  priority: string;
  status: OrderStatus;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  estimated_cost?: number;
  final_cost?: number;
  notes?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
  // Relations
  branch?: Branch;
  technician?: Technician;
}

export interface Review {
  id: string;
  order_id: string;
  technician_id: string;
  reviewer_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface MapMarker {
  id: string;
  type: 'technician' | 'branch';
  name: string;
  specialty?: ServiceType;
  location: string;
  latitude: number;
  longitude: number;
  status?: TechnicianStatus;
  rating?: number;
  icon?: string;
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  electrical: 'كهرباء',
  plumbing: 'سباكة',
  ac: 'تكييف',
  carpentry: 'نجارة',
  painting: 'دهانات',
  general: 'عام'
};

export const STATUS_LABELS: Record<TechnicianStatus, string> = {
  available: 'متاح',
  busy: 'مشغول',
  offline: 'غير متصل'
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  accepted: 'مقبول',
  in_progress: 'جاري التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي'
};
