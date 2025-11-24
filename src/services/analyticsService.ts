// src/services/analyticsService.ts
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsData, StatusData, MonthlyData, YearlyData, CyclesData } from './types';

export const analyticsService = {
  async getStatusData(): Promise<StatusData> {
    const { data, error } = await supabase
      .from('bombonas')
      .select('status');

    if (error) throw error;

    const statusCount: Record<string, number> = {
      'Disponível': 0,
      'Em Uso': 0,
      'Lavagem': 0,
      'Manutenção': 0,
      'Extraviada': 0
    };

    data?.forEach(bombona => {
      const statusMap: Record<string, string> = {
        'available': 'Disponível',
        'in_use': 'Em Uso',
        'washing': 'Lavagem',
        'maintenance': 'Manutenção',
        'lost': 'Extraviada'
      };
      
      const statusLabel = statusMap[bombona.status] || 'Disponível';
      statusCount[statusLabel]++;
    });

    const labels = Object.keys(statusCount);
    const values = Object.values(statusCount);

    return {
      labels,
      datasets: [
        {
          label: 'Bombonas por Status',
          data: values,
          backgroundColor: [
            '#10B981',
            '#3B82F6',
            '#F59E0B',
            '#EF4444',
            '#6B7280'
          ]
        }
      ]
    };
  },

  async getMonthlyData(): Promise<MonthlyData> {
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dec'];
    
    const { data, error } = await supabase
      .from('bombonas')
      .select('created_at')
      .gte('created_at', `${currentYear}-01-01`)
      .lte('created_at', `${currentYear}-12-31`);

    if (error) throw error;

    const monthlyCount = new Array(12).fill(0);
    
    data?.forEach(bombona => {
      if (bombona.created_at) {
        const month = new Date(bombona.created_at).getMonth();
        monthlyCount[month]++;
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Movimentações Mensais',
          data: monthlyCount,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }
      ]
    };
  },

  async getYearlyData(): Promise<YearlyData> {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - 4 + i).toString());
    
    const { data, error } = await supabase
      .from('bombonas')
      .select('created_at');

    if (error) throw error;

    const yearlyCount = years.map(year => {
      return data?.filter(bombona => 
        bombona.created_at && new Date(bombona.created_at).getFullYear().toString() === year
      ).length || 0;
    });

    return {
      labels: years,
      datasets: [
        {
          label: 'Bombonas por Ano',
          data: yearlyCount,
          backgroundColor: '#10B981'
        }
      ]
    };
  },

  async getCyclesData(): Promise<CyclesData> {
    const { data, error } = await supabase
      .from('bombonas')
      .select('total_cycles');

    if (error) throw error;

    const cycles = data?.map(b => b.total_cycles || 0) || [];
    const total = cycles.reduce((sum, cycle) => sum + cycle, 0);
    const average = cycles.length > 0 ? total / cycles.length : 0;
    const max = Math.max(...cycles, 0);

    return {
      total,
      average: Math.round(average * 100) / 100,
      max
    };
  },

  async getLavagensData(): Promise<MonthlyData> {
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dec'];
    
    const { data, error } = await supabase
      .from('lavagens')
      .select('data_lavagem')
      .gte('data_lavagem', `${currentYear}-01-01`)
      .lte('data_lavagem', `${currentYear}-12-31`);

    if (error) throw error;

    const monthlyLavagens = new Array(12).fill(0);
    
    data?.forEach(lavagem => {
      if (lavagem.data_lavagem) {
        const month = new Date(lavagem.data_lavagem).getMonth();
        monthlyLavagens[month]++;
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Lavagens Realizadas',
          data: monthlyLavagens,
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)'
        }
      ]
    };
  },

  async getDespachosData(): Promise<MonthlyData> {
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dec'];
    
    const { data, error } = await supabase
      .from('despachos')
      .select('data_despacho')
      .gte('data_despacho', `${currentYear}-01-01`)
      .lte('data_despacho', `${currentYear}-12-31`);

    if (error) throw error;

    const monthlyDespachos = new Array(12).fill(0);
    
    data?.forEach(despacho => {
      if (despacho.data_despacho) {
        const month = new Date(despacho.data_despacho).getMonth();
        monthlyDespachos[month]++;
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Despachos Realizados',
          data: monthlyDespachos,
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)'
        }
      ]
    };
  },

  async getMaterialDistribution(): Promise<StatusData> {
    const { data, error } = await supabase
      .from('bombonas')
      .select('material');

    if (error) throw error;

    const materialCount: Record<string, number> = {};

    data?.forEach(bombona => {
      const material = bombona.material || 'Não Informado';
      materialCount[material] = (materialCount[material] || 0) + 1;
    });

    const labels = Object.keys(materialCount);
    const values = Object.values(materialCount);

    return {
      labels,
      datasets: [
        {
          label: 'Bombonas por Material',
          data: values,
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#8B5CF6',
            '#F59E0B',
            '#EF4444'
          ]
        }
      ]
    };
  },

  async getLavagensStats() {
    const { data: lavagensData, error: lavagensError } = await supabase
      .from('lavagens')
      .select('*');

    const { data: bombonasData, error: bombonasError } = await supabase
      .from('bombonas')
      .select('total_cycles');

    if (lavagensError || bombonasError) throw lavagensError || bombonasError;

    const totalLavagens = lavagensData?.length || 0;
    const totalCiclos = bombonasData?.reduce((sum, b) => sum + (b.total_cycles || 0), 0) || 0;
    const mediaCiclos = bombonasData && bombonasData.length > 0 ? totalCiclos / bombonasData.length : 0;

    return {
      totalLavagens,
      totalCiclos,
      mediaCiclos: Math.round(mediaCiclos * 100) / 100
    };
  },

  async getDespachosStats() {
    const { data, error } = await supabase
      .from('despachos')
      .select('status');

    if (error) throw error;

    const statusCount: Record<string, number> = {
      'pendente': 0,
      'em_transito': 0,
      'entregue': 0,
      'retornado': 0
    };

    data?.forEach(despacho => {
      statusCount[despacho.status] = (statusCount[despacho.status] || 0) + 1;
    });

    return {
      totalDespachos: data?.length || 0,
      statusCount
    };
  },

  async getAllAnalyticsData(): Promise<AnalyticsData> {
    const [
      status, 
      monthly, 
      yearly, 
      cycles,
      lavagensData,
      despachosData,
      materialData,
      lavagensStats,
      despachosStats
    ] = await Promise.all([
      this.getStatusData(),
      this.getMonthlyData(),
      this.getYearlyData(),
      this.getCyclesData(),
      this.getLavagensData(),
      this.getDespachosData(),
      this.getMaterialDistribution(),
      this.getLavagensStats(),
      this.getDespachosStats()
    ]);

    return {
      status,
      monthly,
      yearly,
      cycles,
      lavagensData,
      despachosData,
      materialData,
      lavagensStats,
      despachosStats
    };
  }
};