
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wmxscmwtaqyduotuectx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndteHNjbXd0YXF5ZHVvdHVlY3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyOTAwNjksImV4cCI6MjA2Mzg2NjA2OX0.QydAwz1AUU0GYB8I3aR6uXvzd4c52HWBpNiCnbhC-OU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
