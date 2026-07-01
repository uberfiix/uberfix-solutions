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

const uuid = z.string().uuid();
const requestSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(2000).optional(),
  service_type: z.string().trim().min(1).max(64),
  branch_id: uuid.optional(),
  technician_id: uuid.optional(),
  scheduled_at: z.string().datetime().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  images: z.array(z.string().url().max(500)).max(10).optional(),
});

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = await req.json().catch(() => null);
    const parsed = requestSchema.safeParse(raw);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const requestData = parsed.data;

    const { data: order, error: orderError } = await supabase
      .from("service_orders")
      .insert({
        title: requestData.title,
        description: requestData.description ?? null,
        service_type: requestData.service_type,
        branch_id: requestData.branch_id ?? null,
        technician_id: requestData.technician_id ?? null,
        scheduled_at: requestData.scheduled_at ?? null,
        priority: requestData.priority ?? "normal",
        images: requestData.images ?? null,
        requested_by: user.id,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      const status = orderError.code === "42501" ? 403 : 400;
      return new Response(JSON.stringify({ error: "Could not create order" }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, order, message: "تم إنشاء طلب الصيانة بنجاح" }),
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
