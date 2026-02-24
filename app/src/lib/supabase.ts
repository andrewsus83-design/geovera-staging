import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vozjwptzutolvkvfpknk.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvemp3cHR6dXRvbHZrdmZwa25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODI0NzcsImV4cCI6MjA4NTQ1ODQ3N30.p-RiTR1Iva9Y4KiZu8gnF2CZjvnMWNAHUVCbp57PDF8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
