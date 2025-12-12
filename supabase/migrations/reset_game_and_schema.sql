-- ZERAR O JOGO E CORRIGIR SCHEMA
-- Este script apaga todos os jogadores e garante que a coluna necessária existe.

-- 1. Limpar todos os jogadores (Reiniciar o jogo)
TRUNCATE TABLE christmas_players;

-- 2. Garantir que a coluna quiz_attempts existe
-- (Caso o script anterior não tenha funcionado)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'christmas_players' AND column_name = 'quiz_attempts') THEN
        ALTER TABLE christmas_players ADD COLUMN quiz_attempts INTEGER DEFAULT 0;
    END IF;
END $$;
