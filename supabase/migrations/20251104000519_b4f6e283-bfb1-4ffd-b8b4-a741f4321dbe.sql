-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Perfis são criados automaticamente"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar tabela de bombonas
CREATE TABLE public.bombonas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- Química, Alimentícia, Farmacêutica
  capacity INTEGER NOT NULL, -- em litros
  material TEXT NOT NULL, -- PEAD, PP, Inox, etc
  color TEXT,
  status TEXT DEFAULT 'available', -- available, in-use, maintenance, cleaning
  current_product TEXT,
  last_wash_date TIMESTAMP WITH TIME ZONE,
  total_cycles INTEGER DEFAULT 0,
  location_lat DECIMAL,
  location_lng DECIMAL,
  location_address TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela bombonas
ALTER TABLE public.bombonas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para bombonas
CREATE POLICY "Usuários podem ver suas próprias bombonas"
  ON public.bombonas FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Usuários podem criar bombonas"
  ON public.bombonas FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Usuários podem atualizar suas bombonas"
  ON public.bombonas FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Usuários podem deletar suas bombonas"
  ON public.bombonas FOR DELETE
  USING (auth.uid() = owner_id);

-- Criar tabela de histórico de rastreamento
CREATE TABLE public.tracking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bombona_id UUID REFERENCES public.bombonas(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  location_lat DECIMAL,
  location_lng DECIMAL,
  location_address TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela tracking_history
ALTER TABLE public.tracking_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tracking_history
CREATE POLICY "Usuários podem ver histórico de suas bombonas"
  ON public.tracking_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bombonas
      WHERE bombonas.id = tracking_history.bombona_id
      AND bombonas.owner_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem adicionar histórico de suas bombonas"
  ON public.tracking_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bombonas
      WHERE bombonas.id = tracking_history.bombona_id
      AND bombonas.owner_id = auth.uid()
    )
  );

-- Criar tabela de produtos compatíveis
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- Químicos, Alimentícios, Farmacêuticos, Especiais
  subcategory TEXT,
  compatible_materials TEXT[], -- Array de materiais compatíveis
  danger_level TEXT, -- low, medium, high
  requires_certification BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela products (público para leitura)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Produtos são visíveis para todos usuários autenticados"
  ON public.products FOR SELECT
  USING (auth.role() = 'authenticated');

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bombonas_updated_at
  BEFORE UPDATE ON public.bombonas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns produtos de exemplo
INSERT INTO public.products (name, category, subcategory, compatible_materials, danger_level, requires_certification) VALUES
('Ácido Sulfúrico', 'Químicos', 'Ácidos', ARRAY['PEAD', 'PP'], 'high', true),
('Soda Cáustica', 'Químicos', 'Bases', ARRAY['PEAD', 'PP'], 'high', true),
('Óleo de Soja', 'Alimentícios', 'Óleos', ARRAY['PEAD', 'PP', 'Inox'], 'low', false),
('Álcool Isopropílico', 'Químicos', 'Solventes', ARRAY['PEAD', 'PP', 'Inox'], 'medium', false),
('Glicerina', 'Farmacêuticos', 'Excipientes', ARRAY['PEAD', 'PP', 'Inox'], 'low', true),
('Água Ultrapura', 'Especiais', 'Água', ARRAY['Inox'], 'low', true);
