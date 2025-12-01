import { supabase } from '@/integrations/supabase/client';
import { Bombona, Lavagem, LavagemWithBombona, NewLavagem, LavagemStats, LavagemFilters } from './types';

export const lavagemService = {
  async fetchLavagens(): Promise<LavagemWithBombona[]> {
    try {
      const { data: lavagensData, error } = await supabase
        .from('lavagens')
        .select(`
          *,
          bombonas (
            name,
            qr_code,
            capacity,
            material,
            status,
            total_cycles,
            last_wash_date
          )
        `)
        .order('data_lavagem', { ascending: false });

      if (error) throw error;

      const lavagensComBombonas: LavagemWithBombona[] = (lavagensData || []).map(lavagem => ({
        ...lavagem,
        bombona_nome: lavagem.bombonas?.name || 'N/A',
        bombona_qr_code: lavagem.bombonas?.qr_code || 'N/A',
        bombona_capacidade: lavagem.bombonas?.capacity || 0,
        bombona_material: lavagem.bombonas?.material || 'N/A',
        bombona_status: lavagem.bombonas?.status || 'N/A'
      }));

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
        .select(`
          *,
          bombonas (
            name,
            qr_code,
            capacity,
            material,
            status,
            total_cycles,
            last_wash_date
          )
        `);

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
        lavagensFiltradas = lavagensFiltradas.filter(lavagem => 
          lavagem.bombonas?.material === filters.material
        );
      }

      const lavagensComBombonas: LavagemWithBombona[] = lavagensFiltradas.map(lavagem => ({
        ...lavagem,
        bombona_nome: lavagem.bombonas?.name || 'N/A',
        bombona_qr_code: lavagem.bombonas?.qr_code || 'N/A',
        bombona_capacidade: lavagem.bombonas?.capacity || 0,
        bombona_material: lavagem.bombonas?.material || 'N/A',
        bombona_status: lavagem.bombonas?.status || 'N/A'
      }));

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
        .select(`
          *,
          bombonas (
            name,
            qr_code,
            capacity,
            material,
            status,
            total_cycles,
            last_wash_date
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar lavagem por ID:', error);
        return null;
      }

      if (!lavagemData) return null;

      return {
        ...lavagemData,
        bombona_nome: lavagemData.bombonas?.name || 'N/A',
        bombona_qr_code: lavagemData.bombonas?.qr_code || 'N/A',
        bombona_capacidade: lavagemData.bombonas?.capacity || 0,
        bombona_material: lavagemData.bombonas?.material || 'N/A',
        bombona_status: lavagemData.bombonas?.status || 'N/A'
      };
    } catch (error) {
      console.error('Erro ao buscar lavagem por ID:', error);
      return null;
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

      const firstDayCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
      const lastDayCurrentMonth = new Date(currentYear, currentMonth, 0);
      
      const firstDayLastMonth = new Date(lastMonthYear, lastMonth - 1, 1);
      const lastDayLastMonth = new Date(lastMonthYear, lastMonth, 0);

      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      const { data: totalLavagensData, error: totalError } = await supabase
        .from('lavagens')
        .select('id');

      if (totalError) throw totalError;

      const { data: lavagensMesAtualData, error: mesAtualError } = await supabase
        .from('lavagens')
        .select('id')
        .gte('data_lavagem', formatDate(firstDayCurrentMonth))
        .lte('data_lavagem', formatDate(lastDayCurrentMonth));

      if (mesAtualError) throw mesAtualError;

      const { data: lavagensMesAnteriorData, error: mesAnteriorError } = await supabase
        .from('lavagens')
        .select('id')
        .gte('data_lavagem', formatDate(firstDayLastMonth))
        .lte('data_lavagem', formatDate(lastDayLastMonth));

      if (mesAnteriorError) throw mesAnteriorError;

      const { data: bombonasParaLavagemData, error: paraLavagemError } = await supabase
        .from('bombonas')
        .select('id')
        .in('status', ['washing', 'in_use']);

      if (paraLavagemError) throw paraLavagemError;

      const { data: bombonasData, error: bombonasError } = await supabase
        .from('bombonas')
        .select('total_cycles');

      if (bombonasError) throw bombonasError;

      const totalLavagens = totalLavagensData?.length || 0;
      const lavagensMesAtual = lavagensMesAnteriorData?.length || 0;
      const lavagensMesAnterior = lavagensMesAnteriorData?.length || 0;
      const bombonasParaLavagem = bombonasParaLavagemData?.length || 0;

      const totalCiclos = bombonasData?.reduce((sum, b) => sum + (b.total_cycles || 0), 0) || 0;
      const mediaCiclos = bombonasData && bombonasData.length > 0 ? totalCiclos / bombonasData.length : 0;

      let taxaCrescimento = 0;
      if (lavagensMesAnterior > 0) {
        taxaCrescimento = ((lavagensMesAtual - lavagensMesAnterior) / lavagensMesAnterior) * 100;
      } else if (lavagensMesAtual > 0) {
        taxaCrescimento = 100;
      }

      return {
        total_lavagens: totalLavagens,
        lavagens_mes_atual: lavagensMesAtual,
        lavagens_mes_anterior: lavagensMesAnterior,
        taxa_crescimento: Math.round(taxaCrescimento * 100) / 100,
        bombonas_para_lavagem: bombonasParaLavagem,
        media_ciclos_por_bombona: Math.round(mediaCiclos * 100) / 100
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de lavagens:', error);
      
      return {
        total_lavagens: 0,
        lavagens_mes_atual: 0,
        lavagens_mes_anterior: 0,
        taxa_crescimento: 0,
        bombonas_para_lavagem: 0,
        media_ciclos_por_bombona: 0
      };
    }
  },

  async fetchBombonasPrecisandoLavagem(): Promise<Bombona[]> {
    try {
      const { data, error } = await supabase
        .from('bombonas')
        .select('*')
        .or('status.eq.washing,status.eq.in_use')
        .order('last_wash_date', { ascending: true, nullsFirst: true });

      if (error) throw error;

      const bombonasComNecessidade = (data || []).filter(bombona => {
        if (bombona.status === 'washing') return true;
        
        if (bombona.last_wash_date) {
          const ultimaLavagem = new Date(bombona.last_wash_date);
          const hoje = new Date();
          const diferencaDias = Math.floor((hoje.getTime() - ultimaLavagem.getTime()) / (1000 * 60 * 60 * 24));
          
          return diferencaDias >= 7;
        }
        
        return true;
      });

      return bombonasComNecessidade.map(bombona => ({
        ...bombona,
        status: bombona.status as 'available' | 'in_use' | 'maintenance' | 'washing' | 'lost'
      }));
    } catch (error) {
      console.error('Erro ao buscar bombonas precisando de lavagem:', error);
      throw error;
    }
  },

  async checkBombonaNeedsWash(bombonaId: string): Promise<{ precisaLavagem: boolean; motivo?: string }> {
    try {
      const { data: bombona, error } = await supabase
        .from('bombonas')
        .select('status, last_wash_date, total_cycles')
        .eq('id', bombonaId)
        .single();

      if (error) throw error;

      if (!bombona) {
        return { precisaLavagem: false };
      }

      if (bombona.status === 'washing') {
        return { precisaLavagem: true, motivo: 'Status: Aguardando lavagem' };
      }

      if (bombona.last_wash_date) {
        const ultimaLavagem = new Date(bombona.last_wash_date);
        const hoje = new Date();
        const diferencaDias = Math.floor((hoje.getTime() - ultimaLavagem.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diferencaDias >= 7) {
          return { precisaLavagem: true, motivo: `Última lavagem há ${diferencaDias} dias` };
        }
      }

      if (bombona.total_cycles && bombona.total_cycles >= 10) {
        return { precisaLavagem: true, motivo: `Alto número de ciclos: ${bombona.total_cycles}` };
      }

      return { precisaLavagem: false };
    } catch (error) {
      console.error('Erro ao verificar necessidade de lavagem:', error);
      return { precisaLavagem: false };
    }
  }
};