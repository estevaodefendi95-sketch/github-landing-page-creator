import { createClient } from "@supabase/supabase-js";

// Projeto Supabase da Nortyx — usado para guardar o conteúdo editável da landing page.
// A chave abaixo é a "publishable/anon key", segura para uso no navegador.
const SUPABASE_URL = "https://jilihppnjxhsjnkftofk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_PWtYOGBppxyaiGpQfUAdFA_Twg4F5Ka";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
