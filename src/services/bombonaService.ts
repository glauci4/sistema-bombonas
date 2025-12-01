// src/services/bombonaService.ts
import { supabase } from '@/integrations/supabase/client';
import { Bombona, NewBombona, UpdateBombona, BombonaStats, BombonaStatus, convertBombonaFromDB } from './types';

export const bombonaService = {
  async fetchBombonas(): Promise<Bombona[]> {
    try {
      const { data, error } = await supabase
        .from('bombonas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(convertBombonaFromDB);
    } catch (error) {
      console.error('Erro ao buscar bombonas:', error);
      throw error;
    }
  },

  async fetchBombonaById(id: string): Promise<Bombona | null> {
    try {
      const { data, error } = await supabase
        .from('bombonas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data ? convertBombonaFromDB(data) : null;
    } catch (error) {
      console.error('Erro ao buscar bombona por ID:', error);
      throw error;
    }
  },

  async createBombona(bombonaData: NewBombona): Promise<Bombona | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('bombonas')
        .insert({
          ...bombonaData,
          owner_id: userId
        })
        .select()
        .single();

      if (error) throw error;

      return data ? convertBombonaFromDB(data) : null;
    } catch (error) {
      console.error('Erro ao criar bombona:', error);
      throw error;
    }
  },

  async updateBombona(id: string, updates: UpdateBombona): Promise<Bombona | null> {
    try {
      const { data, error } = await supabase
        .from('bombonas')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data ? convertBombonaFromDB(data) : null;
    } catch (error) {
      console.error('Erro ao atualizar bombona:', error);
      throw error;
    }
  },

  async updateBombonaStatus(id: string, status: BombonaStatus): Promise<Bombona | null> {
    try {
      const { data, error } = await supabase
        .from('bombonas')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data ? convertBombonaFromDB(data) : null;
    } catch (error) {
      console.error('Erro ao atualizar status da bombona:', error);
      throw error;
    }
  },

  async deleteBombona(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bombonas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Erro ao deletar bombona:', error);
      throw error;
    }
  },

  async fetchBombonaStats(): Promise<BombonaStats> {
    try {
      const { data, error } = await supabase
        .from('bombonas')
        .select('status, total_cycles');

      if (error) throw error;

      const stats: BombonaStats = {
        total: data?.length || 0,
        available: 0,
        in_use: 0,
        maintenance: 0,
        washing: 0,
        lost: 0,
        total_cycles: 0,
        average_cycles: 0
      };

      data?.forEach(bombona => {
        const status = bombona.status as keyof BombonaStats;
        if (status in stats) {
          (stats[status] as number)++;
        }
        stats.total_cycles += bombona.total_cycles || 0;
      });

      stats.average_cycles = stats.total > 0 ? stats.total_cycles / stats.total : 0;

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de bombonas:', error);
      throw error;
    }
  }
};