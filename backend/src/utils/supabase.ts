import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for frontend authentication
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Service client for admin operations
export const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);

export default supabaseClient;
