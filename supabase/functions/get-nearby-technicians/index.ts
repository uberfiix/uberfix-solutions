import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const ALLOWED_ORIGINS = [
  "https://uber-fix.lovable.app",
  "https://id-preview--bf927a45-cb2d-42b7-a790-73313093f2cd.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
];

function buildCorsHeaders(origin: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

const nearbySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius_km: z.number().min(0.1).max(100).optional(),
  specialty: z.string().max(64).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const raw = await req.json().catch(() => null);
    const parsed = nearbySchema.safeParse(raw);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { latitude, longitude, radius_km = 10, specialty, limit = 50 } = parsed.data;

    const latDelta = radius_km / 111.32;
    const lonDelta = radius_km / (111.32 * Math.cos((latitude * Math.PI) / 180));

    let query = supabase
      .from("technicians")
      .select("*")
      .eq("is_active", true)
      .gte("latitude", latitude - latDelta)
      .lte("latitude", latitude + latDelta)
      .gte("longitude", longitude - lonDelta)
      .lte("longitude", longitude + lonDelta);

    if (specialty && specialty !== "all") query = query.eq("specialty", specialty);

    const { data: technicians, error } = await query.limit(limit);
    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: "Query failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = (technicians || [])
      .map((tech) => ({
        ...tech,
        distance_km:
          Math.round(
            calculateDistance(latitude, longitude, Number(tech.latitude), Number(tech.longitude)) *
              100
          ) / 100,
      }))
      .filter((t) => t.distance_km <= radius_km)
      .sort((a, b) => {
        if (a.status === "available" && b.status !== "available") return -1;
        if (a.status !== "available" && b.status === "available") return 1;
        return a.distance_km - b.distance_km;
      });

    return new Response(
      JSON.stringify({
        technicians: result,
        count: result.length,
        search_center: { latitude, longitude },
        radius_km,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
