// src/services/lavagemService.ts
import { supabase } from '@/integrations/supabase/client';
import { Bombona, Lavagem, LavagemWithBombona, NewLavagem, LavagemStats, LavagemFilters } from './types';

export const lavagemService = {
  async fetchLavagens(): Promise<LavagemWithBombona[]> {
    try {
      const { data: lavagensData, error } = await supabase
        .from('lavagens')
        .select('*')
        .order('data_lavagem', { ascending: false });

      if (error) throw error;

      const lavagensComBombonas: LavagemWithBombona[] = [];

      for (const lavagem of lavagensData || []) {
        const { data: bombonaData } = await supabase
          .from('bombonas')
          .select('*')
          .eq('id', lavagem.bombona_id)
          .single();

        lavagensComBombonas.push({
          ...lavagem,
          bombona_nome: bombonaData?.name || 'N/A',
          bombona_qr_code: bombonaData?.qr_code || 'N/A',
          bombona_capacidade: bombonaData?.capacity || 0,
          bombona_material: bombonaData?.material || 'N/A',
          bombona_status: bombonaData?.status || 'N/A'
        });
      }

      return lavagensComBombonas;
    } catch (error) {
      console.error('Erro ao buscar lavagens:', error);
      throw error;
    }
  },

  async fetchLavagensComFiltros(filters: LavagemFilters): Promise<LavagemWithBombona[]> {
    try {
      let query = supabase
        .from('lavagens')
        .select('*');

      if (filters.data_inicio) {
        query = query.gte('data_lavagem', filters.data_inicio);
      }
      
      if (filters.data_fim) {
        query = query.lte('data_lavagem', filters.data_fim);
      }

      const { data: lavagensData, error } = await query.order('data_lavagem', { ascending: false });

      if (error) throw error;

      let lavagensFiltradas = lavagensData || [];
      
      if (filters.material) {
        const lavagensComMaterial = [];
        
        for (const lavagem of lavagensFiltradas) {
          const { data: bombonaData } = await supabase
            .from('bombonas')
            .select('material')
            .eq('id', lavagem.bombona_id)
            .single();

          if (bombonaData?.material === filters.material) {
            lavagensComMaterial.push(lavagem);
          }
        }
        
        lavagensFiltradas = lavagensComMaterial;
      }

      const lavagensComBombonas: LavagemWithBombona[] = [];

      for (const lavagem of lavagensFiltradas) {
        const { data: bombonaData } = await supabase
          .from('bombonas')
          .select('*')
          .eq('id', lavagem.bombona_id)
          .single();

        lavagensComBombonas.push({
          ...lavagem,
          bombona_nome: bombonaData?.name || 'N/A',
          bombona_qr_code: bombonaData?.qr_code || 'N/A',
          bombona_capacidade: bombonaData?.capacity || 0,
          bombona_material: bombonaData?.material || 'N/A',
          bombona_status: bombonaData?.status || 'N/A'
        });
      }

      return lavagensComBombonas;
    } catch (error) {
      console.error('Erro ao buscar lavagens com filtros:', error);
      throw error;
    }
  },

  async fetchBombonasParaLavagem(): Promise<Bombona[]> {
    try {
      const { data, error } = await supabase
        .from('bombonas')
        .select('*')
        .in('status', ['available', 'in_use'])
        .order('name');

      if (error) throw error;

      return (data || []).map(bombona => ({
        ...bombona,
        status: bombona.status as 'available' | 'in_use' | 'maintenance' | 'washing' | 'lost'
      }));
    } catch (error) {
      console.error('Erro ao buscar bombonas para lavagem:', error);
      throw error;
    }
  },

  async fetchLavagemById(id: string): Promise<LavagemWithBombona | null> {
    try {
      const { data: lavagemData, error } = await supabase
        .from('lavagens')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!lavagemData) return null;

      const { data: bombonaData } = await supabase
        .from('bombonas')
        .select('*')
        .eq('id', lavagemData.bombona_id)
        .single();

      return {
        ...lavagemData,
        bombona_nome: bombonaData?.name || 'N/A',
        bombona_qr_code: bombonaData?.qr_code || 'N/A',
        bombona_capacidade: bombonaData?.capacity || 0,
        bombona_material: bombonaData?.material || 'N/A',
        bombona_status: bombonaData?.status || 'N/A'
      };
    } catch (error) {
      console.error('Erro ao buscar lavagem por ID:', error);
      throw error;
    }
  },

  async createLavagem(lavagemData: NewLavagem): Promise<Lavagem | null> {
    try {
      const { data: bombona, error: bombonaError } = await supabase
        .from('bombonas')
        .select('total_cycles, current_product')
        .eq('id', lavagemData.bombona_id)
        .single();

      if (bombonaError) throw bombonaError;

      const ciclosAntes = bombona?.total_cycles || 0;
      const ciclosDepois = ciclosAntes + 1;

      const { data, error } = await supabase
        .from('lavagens')
        .insert({
          bombona_id: lavagemData.bombona_id,
          data_lavagem: lavagemData.data_lavagem,
          produto_anterior: lavagemData.produto_anterior,
          produto_novo: lavagemData.produto_novo,
          observacoes: lavagemData.observacoes,
          ciclos_antes: ciclosAntes,
          ciclos_depois: ciclosDepois,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      const { error: updateError } = await supabase
        .from('bombonas')
        .update({
          total_cycles: ciclosDepois,
          current_product: lavagemData.produto_novo || null,
          last_wash_date: lavagemData.data_lavagem,
          status: 'available',
          updated_at: new Date().toISOString()
        })
        .eq('id', lavagemData.bombona_id);

      if (updateError) throw updateError;

      return data;
    } catch (error) {
      console.error('Erro ao criar lavagem:', error);
      throw error;
    }
  },

  async deleteLavagem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('lavagens')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Erro ao deletar lavagem:', error);
      throw error;
    }
  },

  async fetchLavagemStats(): Promise<LavagemStats> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      const { count: totalLavagens, error: totalError } = await supabase
        .from('lavagens')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      const { count: lavagensMesAtual, error: mesAtualError } = await supabase
        .from('lavagens')
        .select('*', { count: 'exact', head: true })
        .gte('data_lavagem', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lte('data_lavagem', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`);

      if (mesAtualError) throw mesAtualError;

      const { count: lavagensMesAnterior, error: mesAnteriorError } = await supabase
        .from('lavagens')
        .select('*', { count: 'exact', head: true })
        .gte('data_lavagem', `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-01`)
        .lte('data_lavagem', `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-31`);

      if (mesAnteriorError) throw mesAnteriorError;

      const { count: bombonasParaLavagem, error: paraLavagemError } = await supabase
        .from('bombonas')
        .select('*', { count: 'exact', head: true })
        .in('status', ['washing', 'in_use']);

      if (paraLavagemError) throw paraLavagemError;

      const { data: bombonasData, error: bombonasError } = await supabase
        .from('bombonas')
        .select('total_cycles');

      if (bombonasError) throw bombonasError;

      const totalCiclos = bombonasData?.reduce((sum, b) => sum + (b.total_cycles || 0), 0) || 0;
      const mediaCiclos = bombonasData && bombonasData.length > 0 ? totalCiclos / bombonasData.length : 0;

      const taxaCrescimento = lavagensMesAnterior > 0 
        ? ((lavagensMesAtual - lavagensMesAnterior) / lavagensMesAnterior) * 100 
        : lavagensMesAtual > 0 ? 100 : 0;

      return {
        total_lavagens: totalLavagens || 0,
        lavagens_mes_atual: lavagensMesAtual || 0,
        lavagens_mes_anterior: lavagensMesAnterior || 0,
        taxa_crescimento: Math.round(taxaCrescimento * 100) / 100,
        bombonas_para_lavagem: bombonasParaLavagem || 0,
        media_ciclos_por_bombona: Math.round(mediaCiclos * 100) / 100
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de lavagens:', error);
      throw error;
    }
  }
};