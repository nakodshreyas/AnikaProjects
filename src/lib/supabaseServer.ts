import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side environment variables (Node.js process.env)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';

// Cron jobs and background tasks usually require the service role key to bypass RLS
const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

export const isSupabaseServerConfigured = Boolean(
    supabaseUrl &&
    supabaseServiceKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseServiceKey !== 'your-anon-key'
);

// Initialize the Supabase server client with session persistence disabled (best practice for servers/cron)
export const supabaseServer: SupabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceKey || 'placeholder-key',
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    }
);