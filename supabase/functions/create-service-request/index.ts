import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ServiceRequestInput {
  title: string;
  description?: string;
  service_type: string;
  branch_id?: string;
  technician_id?: string;
  scheduled_at?: string;
  priority?: string;
  images?: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestData: ServiceRequestInput = await req.json();
    console.log("Creating service request for user:", user.id);
    console.log("Request data:", requestData);

    // Validate required fields
    if (!requestData.title || !requestData.service_type) {
      return new Response(
        JSON.stringify({ error: "title and service_type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the service order
    const { data: order, error: orderError } = await supabase
      .from("service_orders")
      .insert({
        title: requestData.title,
        description: requestData.description || null,
        service_type: requestData.service_type,
        branch_id: requestData.branch_id || null,
        technician_id: requestData.technician_id || null,
        scheduled_at: requestData.scheduled_at || null,
        priority: requestData.priority || "normal",
        images: requestData.images || null,
        requested_by: user.id,
        status: "pending"
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(
        JSON.stringify({ error: orderError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Order created successfully:", order.id);

    // If technician is specified, we could notify them here
    // For now, just return the created order

    return new Response(
      JSON.stringify({
        success: true,
        order: order,
        message: "تم إنشاء طلب الصيانة بنجاح"
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
