import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://liapqgqzylrwygdfejzg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpYXBxZ3F6eWxyd3lnZGZlanpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDkwMjUsImV4cCI6MjA2NzAyNTAyNX0.If92TB363y0E-84xzfpGAwgPuD22Qiu4xeK3tpAZXgI';

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export default supabase;