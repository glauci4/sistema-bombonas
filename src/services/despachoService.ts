import { supabase } from '@/integrations/supabase/client';
import { Despacho, NewDespacho, DespachoLocation } from './types';

// Interface para o tipo retornado pela query com join
interface DespachoWithBombona {
  id: string;
  bombona_id: string;
  destino: string;
  endereco: string;
  latitude: number | null;
  longitude: number | null;
  data_despacho: string;
  data_prevista_retorno: string | null;
  responsavel: string;
  observacoes: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  bombonas: {
    name: string;
    status: string;
  } | null;
}

export const despachoService = {
  async createDespacho(despacho: NewDespacho) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('despachos')
      .insert([{
        bombona_id: despacho.bombona_id,
        destino: despacho.destino,
        endereco: despacho.endereco,
        latitude: despacho.latitude,
        longitude: despacho.longitude,
        data_despacho: despacho.data_despacho,
        data_prevista_retorno: despacho.data_prevista_retorno,
        responsavel: despacho.responsavel,
        observacoes: despacho.observacoes,
        status: 'pendente',
        created_by: user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Despacho;
  },

  async getDespachosByBombona(bombonaId: string) {
    const { data, error } = await supabase
      .from('despachos')
      .select('*')
      .eq('bombona_id', bombonaId)
      .order('data_despacho', { ascending: false });

    if (error) throw error;
    return (data || []) as Despacho[];
  },

  async getUserDespachos() {
    const { data, error } = await supabase
      .from('despachos')
      .select(`
        *,
        bombonas (
          name,
          status
        )
      `)
      .order('data_despacho', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(item => {
      const despachoWithBombona = item as unknown as DespachoWithBombona;
      return {
        ...despachoWithBombona,
        bombona_nome: despachoWithBombona.bombonas?.name || 'N/A',
        bombona_status: despachoWithBombona.bombonas?.status || 'unknown'
      };
    }) as (Despacho & { bombona_nome: string; bombona_status: string })[];
  },

  async updateDespachoStatus(despachoId: string, status: Despacho['status']) {
    const { data, error } = await supabase
      .from('despachos')
      .update({ status })
      .eq('id', despachoId)
      .select()
      .single();

    if (error) throw error;
    return data as Despacho;
  },

  async getDespachosForMap() {
    const { data, error } = await supabase
      .from('despachos')
      .select(`
        id,
        bombona_id,
        destino,
        endereco,
        latitude,
        longitude,
        data_despacho,
        responsavel,
        status,
        bombonas (
          name,
          status
        )
      `)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .eq('status', 'em_transito');

    if (error) throw error;
    
    return (data || []).map(item => {
      const despachoWithBombona = item as unknown as DespachoWithBombona;
      return {
        id: despachoWithBombona.id,
        bombona_id: despachoWithBombona.bombona_id,
        destino: despachoWithBombona.destino,
        endereco: despachoWithBombona.endereco,
        latitude: despachoWithBombona.latitude as number,
        longitude: despachoWithBombona.longitude as number,
        data_despacho: despachoWithBombona.data_despacho,
        responsavel: despachoWithBombona.responsavel,
        status: despachoWithBombona.status,
        bombona_nome: despachoWithBombona.bombonas?.name || 'N/A',
        bombona_status: despachoWithBombona.bombonas?.status || 'unknown'
      };
    }) as DespachoLocation[];
  },

  async deleteDespacho(despachoId: string) {
    const { error } = await supabase
      .from('despachos')
      .delete()
      .eq('id', despachoId);

    if (error) throw error;
  }
};