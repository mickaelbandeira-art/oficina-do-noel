
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zpoqtqfscxpozkdvlqoi.supabase.co"
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwb3F0cWZzY3hwb3prZHZscW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDQ1NDgsImV4cCI6MjA3Njk4MDU0OH0.E81MeA8I9-U0NYZysGfUHiD4xJH3thb4D1YuyhOl4To"

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
        persistSession: false
    }
});

async function resetDatabase() {
    console.log("Iniciando reset do banco de dados (christmas_players)...");

    // Delete all rows.
    const { error, count } = await supabase
        .from('christmas_players')
        .delete({ count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
        console.error("Erro ao resetar banco:", error);
    } else {
        console.log(`Sucesso! Registros removidos.`);
    }
}

resetDatabase();
