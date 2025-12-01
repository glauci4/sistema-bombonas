// src/services/pdfAnalyticsService.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalyticsData } from './types';

export interface PDFData {
  imageData: string;
  analyticsData: AnalyticsData;
  generatedAt: string;
  reportType?: string;
  period?: string;
}

export interface MonthlyPDFData {
  analyticsData: AnalyticsData;
  generatedAt: string;
  period: string;
}

export interface YearlyPDFData {
  analyticsData: AnalyticsData;
  generatedAt: string;
  period: string;
}

// Cores profissionais atualizadas
const BRAND_COLORS = {
  primary: [59, 130, 246] as [number, number, number], // Azul profissional
  secondary: [16, 185, 129] as [number, number, number], // Verde suave
  accent: [139, 92, 246] as [number, number, number],
  success: [16, 185, 129] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  error: [239, 68, 68] as [number, number, number],
  dark: [31, 41, 55] as [number, number, number], // Cinza escuro
  light: [249, 250, 251] as [number, number, number] // Cinza claro
};

const COMPANY_NAME = 'BonnaTech';

// Funções auxiliares atualizadas
const addCoverPage = (pdf: jsPDF, title: string, generatedAt: string, period?: string) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Fundo profissional - gradiente azul suave
  pdf.setFillColor(BRAND_COLORS.light[0], BRAND_COLORS.light[1], BRAND_COLORS.light[2]);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Header com azul profissional
  pdf.setFillColor(BRAND_COLORS.primary[0], BRAND_COLORS.primary[1], BRAND_COLORS.primary[2]);
  pdf.rect(0, 0, pageWidth, 120, 'F');
  
  // Logo/Título
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text(COMPANY_NAME, pageWidth / 2, 60, { align: 'center' });
  
  pdf.setFontSize(20);
  pdf.text(title, pageWidth / 2, 80, { align: 'center' });
  
  if (period) {
    pdf.setFontSize(14);
    pdf.text(period, pageWidth / 2, 100, { align: 'center' });
  }
  
  // Informações de geração
  pdf.setFontSize(11);
  pdf.setTextColor(BRAND_COLORS.dark[0], BRAND_COLORS.dark[1], BRAND_COLORS.dark[2]);
  pdf.text(`Gerado em: ${generatedAt}`, pageWidth / 2, pageHeight - 40, { align: 'center' });
  
  // Rodapé
  pdf.setFontSize(10);
  pdf.text('Sistema de Gestão de Bombonas Sustentáveis', pageWidth / 2, pageHeight - 25, { align: 'center' });
};

const addHeader = (pdf: jsPDF, title: string) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Header moderno com borda inferior
  pdf.setFillColor(BRAND_COLORS.primary[0], BRAND_COLORS.primary[1], BRAND_COLORS.primary[2]);
  pdf.rect(20, 20, pageWidth - 40, 12, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, pageWidth / 2, 27, { align: 'center' });
  
  pdf.setTextColor(BRAND_COLORS.dark[0], BRAND_COLORS.dark[1], BRAND_COLORS.dark[2]);
};

const addMetricRow = (pdf: jsPDF, label: string, value: string, y: number) => {
  pdf.setFontSize(10);
  pdf.setTextColor(BRAND_COLORS.dark[0], BRAND_COLORS.dark[1], BRAND_COLORS.dark[2]);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${label}:`, 25, y);
  pdf.setFont('helvetica', 'bold');
  pdf.text(value, 120, y);
  pdf.setFont('helvetica', 'normal');
};

const addKPIBox = (pdf: jsPDF, label: string, value: string, x: number, y: number) => {
  const boxWidth = 75;
  const boxHeight = 28;
  
  // Caixa com sombra sutil e borda azul
  pdf.setFillColor(255, 255, 255);
  pdf.rect(x, y, boxWidth, boxHeight, 'F');
  
  // Borda azul
  pdf.setDrawColor(BRAND_COLORS.primary[0], BRAND_COLORS.primary[1], BRAND_COLORS.primary[2]);
  pdf.setLineWidth(0.5);
  pdf.rect(x, y, boxWidth, boxHeight);
  
  // Texto do label
  pdf.setFontSize(9);
  pdf.setTextColor(BRAND_COLORS.dark[0], BRAND_COLORS.dark[1], BRAND_COLORS.dark[2]);
  pdf.text(label, x + 5, y + 8);
  
  // Valor
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(BRAND_COLORS.primary[0], BRAND_COLORS.primary[1], BRAND_COLORS.primary[2]);
  pdf.text(value, x + 5, y + 20);
  
  pdf.setFont('helvetica', 'normal');
};

const addSummary = (pdf: jsPDF, data: AnalyticsData) => {
  let yPosition = 50;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(BRAND_COLORS.dark[0], BRAND_COLORS.dark[1], BRAND_COLORS.dark[2]);
  
  // Resumo executivo
  pdf.text('Este relatório apresenta uma análise completa do sistema ' + COMPANY_NAME + ',', 25, yPosition);
  yPosition += 12;
  pdf.text('incluindo métricas de desempenho, distribuição de ativos e tendências operacionais.', 25, yPosition);
  yPosition += 20;
  
  // Métricas principais em formato de grid
  const metrics = [
    { label: 'Total de Lavagens', value: data.lavagensStats.totalLavagens.toString() },
    { label: 'Total de Despachos', value: data.despachosStats.totalDespachos.toString() },
    { label: 'Ciclos Totais', value: data.cycles.total.toString() },
    { label: 'Média de Ciclos', value: data.cycles.average.toString() }
  ];
  
  metrics.forEach((metric, index) => {
    const x = 25 + (index % 2) * 90;
    const y = yPosition + Math.floor(index / 2) * 35;
    addKPIBox(pdf, metric.label, metric.value, x, y);
  });
  
  yPosition += 75;
  
  // Status dos despachos
  pdf.setFont('helvetica', 'bold');
  pdf.text('Status dos Despachos:', 25, yPosition);
  yPosition += 12;
  pdf.setFont('helvetica', 'normal');
  
  const statusCount = data.despachosStats.statusCount;
  const statuses = [
    { label: 'Pendentes', value: statusCount.pendente?.toString() || '0' },
    { label: 'Em Trânsito', value: statusCount.em_transito?.toString() || '0' },
    { label: 'Entregues', value: statusCount.entregue?.toString() || '0' },
    { label: 'Retornados', value: statusCount.retornado?.toString() || '0' }
  ];
  
  statuses.forEach((status, index) => {
    const x = 25 + (index % 2) * 90;
    const y = yPosition + Math.floor(index / 2) * 10;
    addMetricRow(pdf, status.label, status.value, y);
  });
};

const addExecutiveSummary = (pdf: jsPDF, data: AnalyticsData, type: 'mensal' | 'anual') => {
  let yPosition = 50;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const periodText = type === 'mensal' ? 'do mês' : 'do ano';
  
  pdf.text(`Relatório ${type} contendo as principais métricas e indicadores de desempenho ${periodText}.`, 25, yPosition);
  yPosition += 20;
  
  // KPIs principais
  pdf.setFont('helvetica', 'bold');
  pdf.text('PRINCIPAIS INDICADORES:', 25, yPosition);
  yPosition += 15;
  
  pdf.setFont('helvetica', 'normal');
  addKPIBox(pdf, 'Lavagens Realizadas', data.lavagensStats.totalLavagens.toString(), 25, yPosition);
  addKPIBox(pdf, 'Despachos Concluídos', data.despachosStats.totalDespachos.toString(), 105, yPosition);
  yPosition += 30;
  
  addKPIBox(pdf, 'Ciclos Totais', data.cycles.total.toString(), 25, yPosition);
  addKPIBox(pdf, 'Eficiência Média', data.cycles.average.toString() + ' ciclos/bombona', 105, yPosition);
};

const addKPIOverview = (pdf: jsPDF, data: AnalyticsData) => {
  let yPosition = 50;
  
  // Distribuição por Status
  pdf.setFont('helvetica', 'bold');
  pdf.text('DISTRIBUIÇÃO POR STATUS:', 25, yPosition);
  yPosition += 15;
  
  pdf.setFont('helvetica', 'normal');
  if (data.status?.labels && data.status.datasets?.[0]?.data) {
    data.status.labels.forEach((label, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 50;
        pdf.setFont('helvetica', 'bold');
        pdf.text('DISTRIBUIÇÃO POR STATUS (continuação):', 25, yPosition);
        yPosition += 15;
        pdf.setFont('helvetica', 'normal');
      }
      
      addMetricRow(pdf, label, data.status.datasets[0].data[index].toString(), yPosition);
      yPosition += 8;
    });
  }
  
  yPosition += 10;
  
  // Distribuição por Material
  pdf.setFont('helvetica', 'bold');
  pdf.text('DISTRIBUIÇÃO POR MATERIAL:', 25, yPosition);
  yPosition += 15;
  
  pdf.setFont('helvetica', 'normal');
  if (data.materialData?.labels && data.materialData.datasets?.[0]?.data) {
    data.materialData.labels.forEach((label, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 50;
      }
      
      addMetricRow(pdf, label, data.materialData.datasets[0].data[index].toString(), yPosition);
      yPosition += 8;
    });
  }
};

const addTrendsAnalysis = (pdf: jsPDF, data: AnalyticsData) => {
  let yPosition = 50;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('ANÁLISE DE TENDÊNCIAS:', 25, yPosition);
  yPosition += 15;
  
  pdf.setFont('helvetica', 'normal');
  
  // Movimentações mensais
  if (data.monthly?.labels && data.monthly.datasets?.[0]?.data) {
    pdf.text('Movimentações Mensais:', 25, yPosition);
    yPosition += 10;
    
    data.monthly.labels.forEach((month, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 50;
      }
      
      addMetricRow(pdf, month, data.monthly.datasets[0].data[index].toString(), yPosition);
      yPosition += 8;
    });
  }
  
  yPosition += 15;
  
  // Lavagens realizadas
  if (data.lavagensData?.labels && data.lavagensData.datasets?.[0]?.data) {
    pdf.text('Lavagens Realizadas:', 25, yPosition);
    yPosition += 10;
    
    data.lavagensData.labels.forEach((month, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 50;
      }
      
      addMetricRow(pdf, month, data.lavagensData.datasets[0].data[index].toString(), yPosition);
      yPosition += 8;
    });
  }
};

const addYearlyOverview = (pdf: jsPDF, data: AnalyticsData) => {
  let yPosition = 50;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text('Visão consolidada do desempenho anual do sistema ' + COMPANY_NAME + ',', 25, yPosition);
  yPosition += 15;
  pdf.text('apresentando métricas acumuladas e análise comparativa.', 25, yPosition);
  yPosition += 25;
  
  // Bombonas por ano
  if (data.yearly?.labels && data.yearly.datasets?.[0]?.data) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('EVOLUÇÃO ANUAL:', 25, yPosition);
    yPosition += 15;
    
    pdf.setFont('helvetica', 'normal');
    data.yearly.labels.forEach((year, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 50;
      }
      
      addMetricRow(pdf, year, data.yearly.datasets[0].data[index].toString() + ' bombonas', yPosition);
      yPosition += 8;
    });
  }
};

const addComparativeAnalysis = (pdf: jsPDF, data: AnalyticsData) => {
  let yPosition = 50;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('ANÁLISE COMPARATIVA:', 25, yPosition);
  yPosition += 15;
  
  pdf.setFont('helvetica', 'normal');
  
  // Comparativo de eficiência
  const efficiency = data.cycles.average;
  let efficiencyRating = 'Excelente';
  
  if (efficiency < 5) {
    efficiencyRating = 'Baixa';
  } else if (efficiency < 10) {
    efficiencyRating = 'Média';
  }
  
  pdf.text('Eficiência do Sistema:', 25, yPosition);
  yPosition += 8;
  pdf.text(`Média de ${efficiency} ciclos por bombona - Classificação: ${efficiencyRating}`, 25, yPosition);
  yPosition += 20;
  
  // Estatísticas de uso
  pdf.text('Taxa de Utilização:', 25, yPosition);
  yPosition += 8;
  
  const totalBombonas = data.status?.datasets?.[0]?.data?.reduce((a, b) => a + b, 0) || 0;
  const bombonasEmUso = data.status?.datasets?.[0]?.data?.[1] || 0; // Em Uso
  const utilizationRate = totalBombonas > 0 ? (bombonasEmUso / totalBombonas * 100).toFixed(1) : '0';
  
  pdf.text(`${utilizationRate}% das bombonas estão em uso ativo`, 25, yPosition);
};

const addDetailedAnalysis = (pdf: jsPDF, data: AnalyticsData) => {
  let yPosition = 50;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text('Análise detalhada do desempenho operacional e métricas do sistema.', 25, yPosition);
  yPosition += 20;
  
  // Estatísticas operacionais
  pdf.setFont('helvetica', 'bold');
  pdf.text('ESTATÍSTICAS OPERACIONAIS:', 25, yPosition);
  yPosition += 15;
  
  pdf.setFont('helvetica', 'normal');
  addMetricRow(pdf, 'Total de Operações de Lavagem', data.lavagensStats.totalLavagens.toString(), yPosition);
  yPosition += 10;
  addMetricRow(pdf, 'Total de Despachos Realizados', data.despachosStats.totalDespachos.toString(), yPosition);
  yPosition += 10;
  addMetricRow(pdf, 'Ciclos de Vida Totais', data.cycles.total.toString(), yPosition);
  yPosition += 10;
  addMetricRow(pdf, 'Durabilidade Média', data.cycles.average.toString() + ' ciclos/bombona', yPosition);
  yPosition += 20;
  
  // Status do sistema
  pdf.setFont('helvetica', 'bold');
  pdf.text('SAÚDE DO SISTEMA:', 25, yPosition);
  yPosition += 15;
  
  pdf.setFont('helvetica', 'normal');
  const statusCount = data.despachosStats.statusCount;
  addMetricRow(pdf, 'Despachos Pendentes', statusCount.pendente?.toString() || '0', yPosition);
  yPosition += 8;
  addMetricRow(pdf, 'Em Trânsito', statusCount.em_transito?.toString() || '0', yPosition);
  yPosition += 8;
  addMetricRow(pdf, 'Entregues com Sucesso', statusCount.entregue?.toString() || '0', yPosition);
  yPosition += 8;
  addMetricRow(pdf, 'Retornados à Base', statusCount.retornado?.toString() || '0', yPosition);
};

const addImageToPDF = (pdf: jsPDF, imageData: string, startY: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const imgWidth = pageWidth - (2 * margin);
  
  try {
    pdf.addImage(imageData, 'PNG', margin, startY, imgWidth, 0);
  } catch (error) {
    console.error('Erro ao adicionar imagem ao PDF:', error);
    pdf.text('Erro ao carregar gráficos. Tente gerar o relatório novamente.', margin, startY + 20);
  }
};

export const pdfAnalyticsService = {
  async generateAnalyticsPDF(pdfData: PDFData): Promise<Blob> {
    const pdf = new jsPDF();
    
    // Capa profissional
    addCoverPage(pdf, 'Relatório Analytics Completo', pdfData.generatedAt);
    
    // Sumário
    pdf.addPage();
    addHeader(pdf, 'Sumário Executivo');
    addSummary(pdf, pdfData.analyticsData);
    
    // Gráficos
    if (pdfData.imageData) {
      pdf.addPage();
      addHeader(pdf, 'Análise Visual e Gráficos');
      addImageToPDF(pdf, pdfData.imageData, 50);
    }
    
    // Análise Detalhada
    pdf.addPage();
    addHeader(pdf, 'Análise Detalhada');
    addDetailedAnalysis(pdf, pdfData.analyticsData);
    
    return pdf.output('blob');
  },

  async generateMonthlyPDF(data: MonthlyPDFData): Promise<Blob> {
    const pdf = new jsPDF();
    
    // Capa
    addCoverPage(pdf, 'Relatório Mensal', data.generatedAt, data.period);
    
    // Resumo Executivo
    pdf.addPage();
    addHeader(pdf, 'Resumo Executivo - ' + data.period);
    addExecutiveSummary(pdf, data.analyticsData, 'mensal');
    
    // KPIs Principais
    pdf.addPage();
    addHeader(pdf, 'Indicadores Chave');
    addKPIOverview(pdf, data.analyticsData);
    
    // Tendências
    pdf.addPage();
    addHeader(pdf, 'Tendências do Mês');
    addTrendsAnalysis(pdf, data.analyticsData);
    
    return pdf.output('blob');
  },

  async generateYearlyPDF(data: YearlyPDFData): Promise<Blob> {
    const pdf = new jsPDF();
    
    // Capa
    addCoverPage(pdf, 'Relatório Anual', data.generatedAt, data.period);
    
    // Resumo Executivo
    pdf.addPage();
    addHeader(pdf, 'Resumo Anual - ' + data.period);
    addExecutiveSummary(pdf, data.analyticsData, 'anual');
    
    // Visão Geral
    pdf.addPage();
    addHeader(pdf, 'Visão Geral do Ano');
    addYearlyOverview(pdf, data.analyticsData);
    
    // Análise Comparativa
    pdf.addPage();
    addHeader(pdf, 'Análise Comparativa');
    addComparativeAnalysis(pdf, data.analyticsData);
    
    return pdf.output('blob');
  },

  async captureCharts(element: HTMLElement): Promise<string> {
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false
    });
    return canvas.toDataURL('image/png', 1.0);
  }
};