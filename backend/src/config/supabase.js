import { createClient } from '@supabase/supabase-js';
import env from "dotenv";
env.config()
const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; 
export const supabase = createClient(supabaseUrl, supabaseKey);
