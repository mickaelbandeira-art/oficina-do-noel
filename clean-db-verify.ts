
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zpoqtqfscxpozkdvlqoi.supabase.co"
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwb3F0cWZzY3hwb3prZHZscW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDQ1NDgsImV4cCI6MjA3Njk4MDU0OH0.E81MeA8I9-U0NYZysGfUHiD4xJH3thb4D1YuyhOl4To"

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
        persistSession: false
    }
});

async function resetDatabase() {
    console.log("--- Diagnóstico e Limpeza ---");

    // 1. Check count before
    const { count: countBefore, error: countError } = await supabase
        .from('christmas_players')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error("Erro ao ler contagem inicial:", countError);
    } else {
        console.log(`Registros encontrados antes da limpeza: ${countBefore}`);
    }

    // 2. Try Delete
    console.log("Tentando deletar...");
    const { error: deleteError, count: deleteCount, data } = await supabase
        .from('christmas_players')
        .delete({ count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete not-null IDs (all)

    if (deleteError) {
        console.error("Erro ao deletar:", deleteError);
    } else {
        console.log(`Comando de delete executado. Registros deletados reportados: ${deleteCount}`);
    }

    // 3. Check count after
    const { count: countAfter, error: countAfterError } = await supabase
        .from('christmas_players')
        .select('*', { count: 'exact', head: true });

    if (countAfterError) {
        console.error("Erro ao ler contagem final:", countAfterError);
    } else {
        console.log(`Registros restantes no banco: ${countAfter}`);
    }

    if (countBefore !== 0 && countAfter !== 0) {
        console.warn("ALERTA: O banco não foi limpo. Provavelmente Row Level Security (RLS) está impedindo a deleção com a chave pública.");
    }
}

resetDatabase();
