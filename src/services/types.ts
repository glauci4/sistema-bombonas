export interface DadosMensais {
    total_bombonas: number;
    bombonas_ativas: number;
    bombonas_em_uso: number;
    total_usuarios: number;
    produtos_mais_utilizados: string;
    ciclos_mensais: number;
  }
  
  export interface DadoAnual {
    mes: string;
    total_bombonas: number;
    bombonas_ativas: number;
    bombonas_em_uso: number;
    novos_usuarios: number;
  }
  
  export interface DadosAnalytics {
    resumo_geral: {
      total_bombonas_historico: number;
      total_usuarios: number;
      total_ciclos: number;
      taxa_reutilizacao: number;
    };
    evolucao_mensal: DadoAnual[];
    produtos_populares: Array<{ produto: string; uso_count: number }>;
    distribuicao_status: {
      ativas: number;
      em_uso: number;
      inativas: number;
    };
  }