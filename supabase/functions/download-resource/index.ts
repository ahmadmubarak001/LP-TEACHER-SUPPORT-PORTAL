// Supabase Edge Function: download-resource
// Securely verifies published status and issues short-lived signed URL from private Storage

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { resourceId } = await req.json();

    if (!resourceId) {
      return new Response(
        JSON.stringify({ error: 'Missing resourceId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: missing service keys' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch resource record
    const { data: resource, error: dbError } = await supabase
      .from('resources')
      .select('id, title_en, title_ml, file_path, status, downloads_count')
      .eq('id', resourceId)
      .single();

    if (dbError || !resource) {
      return new Response(
        JSON.stringify({ error: 'Resource not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Strict Check: Only published resources are downloadable!
    if (resource.status !== 'published') {
      return new Response(
        JSON.stringify({
          error: 'Access denied: Draft and archived resources are not publicly accessible.',
          status: resource.status,
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Generate short-lived (60 seconds) signed URL from private bucket
    const expiresIn = 60; // 60 seconds
    const { data: signedData, error: storageError } = await supabase.storage
      .from('educational-resources')
      .createSignedUrl(resource.file_path, expiresIn);

    if (storageError || !signedData?.signedUrl) {
      return new Response(
        JSON.stringify({ error: 'Failed to create signed URL from private storage', details: storageError?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Increment download counter asynchronously
    await supabase
      .from('resources')
      .update({ downloads_count: (resource.downloads_count || 0) + 1 })
      .eq('id', resourceId);

    return new Response(
      JSON.stringify({
        success: true,
        signedUrl: signedData.signedUrl,
        expiresInSeconds: expiresIn,
        resourceId: resource.id,
        filename: resource.file_path.split('/').pop() || 'resource.pdf',
        title_ml: resource.title_ml,
        title_en: resource.title_en,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
