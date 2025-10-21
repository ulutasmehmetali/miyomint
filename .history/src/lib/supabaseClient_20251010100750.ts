import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nnkbpdhbczjrbqsfvord.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_wJ7aDrViXWymMyyqebcfIA_0gpOI2QQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
