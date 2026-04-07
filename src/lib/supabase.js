import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ttqpcegjbduahikteuix.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0cXBjZWdqYmR1YWhpa3RldWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNTM5NTgsImV4cCI6MjA5MDcyOTk1OH0.Io6-_GZvXfqm9vyEZwQqSJd3NBhBAy_7AqdnaXgrHZs";

export const supabase = createClient(supabaseUrl, supabaseKey);