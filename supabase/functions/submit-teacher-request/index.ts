// Supabase Edge Function: submit-teacher-request
// Server-side validation, rate limiting, and private teacher request submission

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory rate limiter per IP
const ipHits = new Map<string, { count: number; expiresAt: number }>();

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for') || 'anon';
    const now = Date.now();

    // 1. Rate Limiting Check: 5 requests per 10 minutes
    const record = ipHits.get(clientIp);
    if (record && now < record.expiresAt) {
      if (record.count >= 5) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please wait before submitting another request.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      record.count += 1;
    } else {
      ipHits.set(clientIp, { count: 1, expiresAt: now + 10 * 60 * 1000 });
    }

    const payload = await req.json();

    // 2. Honeypot Anti-Spam Check
    if (payload.website && payload.website.trim().length > 0) {
      return new Response(
        JSON.stringify({ error: 'Spam detected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Validation
    if (!payload.teacher_name || payload.teacher_name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Valid teacher name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.school_name || !payload.district || !payload.phone_number || !payload.description) {
      return new Response(
        JSON.stringify({ error: 'All required fields must be filled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Generate Reference Number: LPR-2026-XXXXX
    const year = new Date().getFullYear();
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    const ref_number = `LPR-${year}-${code}`;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 5. Insert into teacher_requests (status strictly default 'pending', admin_notes empty)
    const { data, error: insertError } = await supabase
      .from('teacher_requests')
      .insert({
        ref_number,
        teacher_name: payload.teacher_name.trim(),
        school_name: payload.school_name.trim(),
        district: payload.district,
        phone_number: payload.phone_number.trim(),
        email: (payload.email || '').trim(),
        class_level: Number(payload.class_level),
        subject: payload.subject,
        request_type: payload.request_type,
        description: payload.description.trim(),
        status: 'pending',
        admin_notes: '',
      })
      .select('id, ref_number, created_at')
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Failed to save request to database', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return reference number ONLY after confirmed DB insert!
    return new Response(
      JSON.stringify({
        success: true,
        ref_number: data.ref_number,
        id: data.id,
        created_at: data.created_at,
        message: 'Request submitted successfully. Keep your reference number to track status.',
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
