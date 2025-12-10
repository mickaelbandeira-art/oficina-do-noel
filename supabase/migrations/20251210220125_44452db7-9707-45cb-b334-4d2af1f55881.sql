-- Tabela de perguntas do quiz natalino
CREATE TABLE public.christmas_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de jogadores/participantes
CREATE TABLE public.christmas_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  matricula TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_time_seconds INTEGER,
  answers JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_christmas_players_score ON public.christmas_players(score DESC, total_time_seconds ASC);
CREATE INDEX idx_christmas_questions_order ON public.christmas_questions(order_index ASC);
CREATE UNIQUE INDEX idx_christmas_players_matricula ON public.christmas_players(matricula);

-- Enable RLS
ALTER TABLE public.christmas_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.christmas_players ENABLE ROW LEVEL SECURITY;

-- Políticas para perguntas (públicas para leitura, apenas admin pode modificar)
CREATE POLICY "Questions are viewable by everyone" 
ON public.christmas_questions 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage questions" 
ON public.christmas_questions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Políticas para jogadores (podem se registrar e ver ranking)
CREATE POLICY "Anyone can register as player" 
ON public.christmas_players 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Players can view all results" 
ON public.christmas_players 
FOR SELECT 
USING (true);

CREATE POLICY "Players can update their own game" 
ON public.christmas_players 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can manage players" 
ON public.christmas_players 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_christmas_questions_updated_at
BEFORE UPDATE ON public.christmas_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir 10 perguntas de exemplo sobre o Natal
INSERT INTO public.christmas_questions (question, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES
('Em que país surgiu a tradição da árvore de Natal?', 'Estados Unidos', 'Inglaterra', 'Alemanha', 'França', 'C', 1),
('Qual é o nome das renas do Papai Noel que começa com a letra "R"?', 'Rudolf e Rodolfo', 'Rudolf e Relâmpago', 'Rudolf e Raio', 'Apenas Rudolf', 'D', 2),
('O que significa a palavra "Natal" em latim?', 'Presente', 'Nascimento', 'Celebração', 'Inverno', 'B', 3),
('Em que data é comemorado o Natal na maioria dos países ocidentais?', '24 de dezembro', '25 de dezembro', '31 de dezembro', '6 de janeiro', 'B', 4),
('Qual flor é tradicionalmente associada ao Natal no Brasil?', 'Rosa', 'Lírio', 'Bico-de-papagaio', 'Orquídea', 'C', 5),
('Quantas renas puxam o trenó do Papai Noel na história original?', '6 renas', '8 renas', '9 renas', '12 renas', 'B', 6),
('Qual país inventou o panetone?', 'Brasil', 'França', 'Itália', 'Portugal', 'C', 7),
('O que os Três Reis Magos levaram para Jesus?', 'Ouro, prata e bronze', 'Ouro, incenso e mirra', 'Ouro, vinho e pão', 'Ouro, seda e especiarias', 'B', 8),
('Em que século surgiu a figura do Papai Noel com roupa vermelha?', 'Século XVIII', 'Século XIX', 'Século XX', 'Século XVII', 'B', 9),
('Qual é a saudação tradicional de Natal em inglês?', 'Happy Holidays', 'Merry Christmas', 'Season Greetings', 'Joyful Christmas', 'B', 10);