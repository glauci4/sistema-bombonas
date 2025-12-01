// src/services/trackingService.ts
import { supabase } from '@/integrations/supabase/client';
import { LocationHistory } from './types'; // Removido NewLocationHistory

export const trackingService = {
  // Atualizar localização de uma bombona
  async updateBombonaLocation(bombonaId: string, lat: number, lng: number, address: string) {
    const { data, error } = await supabase
      .from('bombonas')
      .update({
        location_lat: lat,
        location_lng: lng,
        location_address: address,
        updated_at: new Date().toISOString()
      })
      .eq('id', bombonaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Registrar histórico de localização
  async registerLocationHistory(bombonaId: string, lat: number, lng: number, address: string, notes?: string) {
    try {
      const { data, error } = await supabase
        .from('location_history')
        .insert({
          bombona_id: bombonaId,
          latitude: lat,
          longitude: lng,
          address: address,
          notes: notes || null
        })
        .select()
        .single();

      if (error) {
        console.warn('Tabela location_history não encontrada. Criando registro em bombonas:', error);
        return await this.updateBombonaLocation(bombonaId, lat, lng, address);
      }

      return data;
    } catch (error) {
      console.error('Erro ao registrar histórico:', error);
      return await this.updateBombonaLocation(bombonaId, lat, lng, address);
    }
  },

  // Buscar histórico de localização
  async getLocationHistory(bombonaId: string): Promise<LocationHistory[]> {
    try {
      const { data, error } = await supabase
        .from('location_history')
        .select('*')
        .eq('bombona_id', bombonaId)
        .order('recorded_at', { ascending: false });

      if (error) {
        console.warn('Erro ao buscar histórico, retornando array vazio:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  },

  // Buscar localização atual de bombonas ativas
  async getActiveBombonasLocations() {
    const { data, error } = await supabase
      .from('bombonas')
      .select('*')
      .in('status', ['available', 'in_use'])
      .not('location_lat', 'is', null)
      .not('location_lng', 'is', null);

    if (error) throw error;
    return data || [];
  }
};