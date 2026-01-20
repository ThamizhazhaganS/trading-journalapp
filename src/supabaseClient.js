
import { createClient } from '@supabase/supabase-js';

// NOTE: You need to create a project at https://supabase.com
// Then create a .env.local file with:
// VITE_SUPABASE_URL=your_project_url
// VITE_SUPABASE_ANON_KEY=your_anon_key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.warn('Supabase credentials missing. Cloud modes will be disabled.');
}

export { supabase };
