import { createClient } from '@supabase/supabase-js';

// Hardcoded values for production deployment
const supabaseUrl = 'https://cuhztjuphamulkgfhhcp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1aHp0anVwaGFtdWxrZ2ZoaGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODM1MTgsImV4cCI6MjA3NTM1OTUxOH0.SCSNk7jvn13sBkv5458m52z4f1962dbl85eUFFylTaE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
