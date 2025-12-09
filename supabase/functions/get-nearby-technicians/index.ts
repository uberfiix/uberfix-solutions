import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NearbyRequest {
  latitude: number;
  longitude: number;
  radius_km?: number;
  specialty?: string;
  limit?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { latitude, longitude, radius_km = 10, specialty, limit = 50 }: NearbyRequest = await req.json();

    console.log(`Searching technicians near [${latitude}, ${longitude}] within ${radius_km}km`);

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: "latitude and longitude are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate bounding box for initial filtering
    const latDelta = radius_km / 111.32;
    const lonDelta = radius_km / (111.32 * Math.cos(latitude * Math.PI / 180));

    let query = supabase
      .from("technicians")
      .select("*")
      .eq("is_active", true)
      .gte("latitude", latitude - latDelta)
      .lte("latitude", latitude + latDelta)
      .gte("longitude", longitude - lonDelta)
      .lte("longitude", longitude + lonDelta);

    // Filter by specialty if provided
    if (specialty && specialty !== "all") {
      query = query.eq("specialty", specialty);
    }

    const { data: technicians, error } = await query.limit(limit);

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate actual distance and sort by distance
    const techniciansWithDistance = (technicians || [])
      .map((tech) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          Number(tech.latitude),
          Number(tech.longitude)
        );
        return { ...tech, distance_km: Math.round(distance * 100) / 100 };
      })
      .filter((tech) => tech.distance_km <= radius_km)
      .sort((a, b) => {
        // Sort by availability first, then by distance
        if (a.status === "available" && b.status !== "available") return -1;
        if (a.status !== "available" && b.status === "available") return 1;
        return a.distance_km - b.distance_km;
      });

    console.log(`Found ${techniciansWithDistance.length} technicians`);

    return new Response(
      JSON.stringify({
        technicians: techniciansWithDistance,
        count: techniciansWithDistance.length,
        search_center: { latitude, longitude },
        radius_km
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
