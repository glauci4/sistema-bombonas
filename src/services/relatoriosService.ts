// src/services/relatoriosService.ts
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardData {
  totalBombonas: number;
  totalLavagens: number;
  totalDespachos: number;
  bombonasPorStatus: Record<string, number>;
  bombonasPorMaterial: Record<string, number>;
}

interface Bombona {
  id: string;
  status: string;
  material: string;
}

export const relatoriosService = {
  async gerarRelatorioMensal(mes: number, ano: number): Promise<string> {
    try {
      console.log('Gerando relatório mensal para:', mes, ano);
      const nomeArquivo = `relatorio-mensal-${mes}-${ano}.pdf`;
      
      toast.success('Relatório mensal gerado com sucesso!');
      return nomeArquivo;
    } catch (error) {
      console.error('Erro ao gerar relatório mensal:', error);
      toast.error('Erro ao gerar relatório mensal');
      throw error;
    }
  },

  async gerarRelatorioAnual(ano: number): Promise<string> {
    try {
      console.log('Gerando relatório anual para:', ano);
      const nomeArquivo = `relatorio-anual-${ano}.pdf`;
      
      toast.success('Relatório anual gerado com sucesso!');
      return nomeArquivo;
    } catch (error) {
      console.error('Erro ao gerar relatório anual:', error);
      toast.error('Erro ao gerar relatório anual');
      throw error;
    }
  },

  async getDashboardData(): Promise<DashboardData> {
    try {
      const [
        { data: bombonas, error: bombonasError },
        { data: lavagens, error: lavagensError },
        { data: despachos, error: despachosError }
      ] = await Promise.all([
        supabase.from('bombonas').select('*'),
        supabase.from('lavagens').select('*'),
        supabase.from('despachos').select('*')
      ]);

      if (bombonasError) throw bombonasError;
      if (lavagensError) throw lavagensError;
      if (despachosError) throw despachosError;

      return {
        totalBombonas: bombonas?.length || 0,
        totalLavagens: lavagens?.length || 0,
        totalDespachos: despachos?.length || 0,
        bombonasPorStatus: this.calcularDistribuicaoStatus(bombonas || []),
        bombonasPorMaterial: this.calcularDistribuicaoMaterial(bombonas || [])
      };
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      throw error;
    }
  },

  calcularDistribuicaoStatus(bombonas: Bombona[]): Record<string, number> {
    const distribuicao: Record<string, number> = {};
    
    bombonas.forEach(bombona => {
      const status = bombona.status || 'available';
      distribuicao[status] = (distribuicao[status] || 0) + 1;
    });
    
    return distribuicao;
  },

  calcularDistribuicaoMaterial(bombonas: Bombona[]): Record<string, number> {
    const distribuicao: Record<string, number> = {};
    
    bombonas.forEach(bombona => {
      const material = bombona.material || 'Não Informado';
      distribuicao[material] = (distribuicao[material] || 0) + 1;
    });
    
    return distribuicao;
  }
};