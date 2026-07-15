import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jilihppnjxhsjnkftofk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_PWtYOGBppxyaiGpQfUAdFA_Twg4F5Ka";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
