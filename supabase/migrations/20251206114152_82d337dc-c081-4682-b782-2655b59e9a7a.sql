-- ==========================================
-- UberFix Database Schema
-- ==========================================

-- Create enum for service types
CREATE TYPE public.service_type AS ENUM (
  'electrical',
  'plumbing',
  'ac',
  'carpentry',
  'painting',
  'general'
);

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM (
  'pending',
  'accepted',
  'in_progress',
  'completed',
  'cancelled'
);

-- Create enum for technician status
CREATE TYPE public.technician_status AS ENUM (
  'available',
  'busy',
  'offline'
);

-- ==========================================
-- 1. Branches Table (Store chains branches)
-- ==========================================
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT,
  address TEXT NOT NULL,
  branch_type TEXT NOT NULL DEFAULT 'Branch',
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  map_link TEXT,
  icon_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  chain_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 2. Technicians Table
-- ==========================================
CREATE TABLE public.technicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar_url TEXT,
  specialty service_type NOT NULL,
  secondary_skills service_type[],
  status technician_status DEFAULT 'offline',
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  rating DECIMAL(2, 1) DEFAULT 5.0,
  total_reviews INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. Service Orders Table
-- ==========================================
CREATE TABLE public.service_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  technician_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL,
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_type service_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'normal',
  status order_status DEFAULT 'pending',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_cost DECIMAL(10, 2),
  final_cost DECIMAL(10, 2),
  notes TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 4. Reviews Table
-- ==========================================
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 5. Technician Location History (for tracking)
-- ==========================================
CREATE TABLE public.technician_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- Enable RLS on all tables
-- ==========================================
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_locations ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS Policies for branches (public read)
-- ==========================================
CREATE POLICY "Branches are publicly readable"
  ON public.branches
  FOR SELECT
  USING (true);

-- ==========================================
-- RLS Policies for technicians (public read for active)
-- ==========================================
CREATE POLICY "Active technicians are publicly readable"
  ON public.technicians
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Technicians can update their own profile"
  ON public.technicians
  FOR UPDATE
  USING (user_id = auth.uid());

-- ==========================================
-- RLS Policies for service_orders
-- ==========================================
CREATE POLICY "Users can view orders they created or are assigned to"
  ON public.service_orders
  FOR SELECT
  USING (
    requested_by = auth.uid() OR
    technician_id IN (SELECT id FROM public.technicians WHERE user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create orders"
  ON public.service_orders
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own orders"
  ON public.service_orders
  FOR UPDATE
  USING (
    requested_by = auth.uid() OR
    technician_id IN (SELECT id FROM public.technicians WHERE user_id = auth.uid())
  );

-- ==========================================
-- RLS Policies for reviews
-- ==========================================
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their orders"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_orders
      WHERE id = order_id AND requested_by = auth.uid()
    )
  );

-- ==========================================
-- RLS Policies for technician_locations
-- ==========================================
CREATE POLICY "Technicians can insert their own location"
  ON public.technician_locations
  FOR INSERT
  WITH CHECK (
    technician_id IN (SELECT id FROM public.technicians WHERE user_id = auth.uid())
  );

CREATE POLICY "Locations are readable by order participants"
  ON public.technician_locations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.service_orders so
      WHERE so.technician_id = technician_locations.technician_id
      AND (so.requested_by = auth.uid() OR so.technician_id IN (SELECT id FROM public.technicians WHERE user_id = auth.uid()))
      AND so.status IN ('accepted', 'in_progress')
    )
  );

-- ==========================================
-- Function to generate order number
-- ==========================================
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.order_number := 'UF-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.service_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_number();

-- ==========================================
-- Function to update technician rating
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_technician_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.technicians
  SET 
    rating = (SELECT COALESCE(AVG(rating), 5.0) FROM public.reviews WHERE technician_id = NEW.technician_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE technician_id = NEW.technician_id)
  WHERE id = NEW.technician_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_rating_on_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_technician_rating();

-- ==========================================
-- Function to update updated_at timestamp
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_technicians_updated_at
  BEFORE UPDATE ON public.technicians
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- Indexes for performance
-- ==========================================
CREATE INDEX idx_branches_location ON public.branches (latitude, longitude);
CREATE INDEX idx_branches_active ON public.branches (is_active);
CREATE INDEX idx_technicians_status ON public.technicians (status);
CREATE INDEX idx_technicians_specialty ON public.technicians (specialty);
CREATE INDEX idx_technicians_location ON public.technicians (latitude, longitude);
CREATE INDEX idx_orders_status ON public.service_orders (status);
CREATE INDEX idx_orders_branch ON public.service_orders (branch_id);
CREATE INDEX idx_orders_technician ON public.service_orders (technician_id);
CREATE INDEX idx_locations_technician ON public.technician_locations (technician_id);