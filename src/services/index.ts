// Exportações principais do serviço de relatórios
export { relatoriosService } from './relatoriosService';
export type { DadosMensais, DadoAnual, DadosAnalytics } from './types';

// Exportações dos serviços de Analytics
export { pdfAnalyticsService } from './pdfAnalyticsService';

// Exportações de tipos adicionais
export type { 
  AnalyticsData, 
  StatusData, 
  MonthlyData, 
  YearlyData, 
  CyclesData,
  PDFData 
} from './types';