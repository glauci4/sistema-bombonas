import { jsPDF } from 'jspdf';
import { PDFHelpers } from './pdfHelpers';
import { COLORS, SPACING, DIMENSIONS } from './constants';

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

export class RelatorioPDFLayouts {
  // ===== RELATÓRIO MENSAL =====
  static gerarRelatorioMensal(dados: DadosMensais, mes: number, ano: number): jsPDF {
    const doc = new jsPDF();
    
    // Cabeçalho
    PDFHelpers.desenharCabecalho(
      doc,
      'BONNATECH',
      'Relatório Mensal de Bombonas',
      `${PDFHelpers.getNomeMes(mes)} ${ano}`
    );
    
    let y = DIMENSIONS.headerHeight + 15;
    
    // ===== CARDS DE MÉTRICAS =====
    y = PDFHelpers.desenharTituloSecao(doc, 'INDICADORES DO MÊS', y, '📊');
    y += 5;
    
    const metricas = [
      {
        label: 'TOTAL DE BOMBONAS',
        value: dados.total_bombonas,
        icon: '📦',
        color: COLORS.primary
      },
      {
        label: 'BOMBONAS ATIVAS',
        value: dados.bombonas_ativas,
        icon: '✓',
        color: COLORS.success
      },
      {
        label: 'BOMBONAS EM USO',
        value: dados.bombonas_em_uso,
        icon: '🔄',
        color: COLORS.highlight
      },
      {
        label: 'TOTAL USUÁRIOS',
        value: dados.total_usuarios,
        icon: '👥',
        color: COLORS.info
      },
      {
        label: 'CICLOS/MOVIMENTAÇÕES',
        value: dados.ciclos_mensais,
        icon: '📈',
        color: COLORS.accent
      }
    ];
    
    // Grid 2x2 + 1 centralizado
    let x = SPACING.pageMargin;
    const cardWidth = 85;
    const cardHeight = 38;
    const gap = 10;
    
    // Primeira linha
    metricas.slice(0, 2).forEach((metrica, index) => {
      PDFHelpers.desenharCard(
        doc, x, y, cardWidth, cardHeight,
        metrica.label, metrica.value, metrica.icon, metrica.color
      );
      x += cardWidth + gap;
    });
    
    y += cardHeight + gap;
    x = SPACING.pageMargin;
    
    // Segunda linha
    metricas.slice(2, 4).forEach((metrica, index) => {
      PDFHelpers.desenharCard(
        doc, x, y, cardWidth, cardHeight,
        metrica.label, metrica.value, metrica.icon, metrica.color
      );
      x += cardWidth + gap;
    });
    
    y += cardHeight + gap;
    
    // Última métrica centralizada
    const ultimaMetrica = metricas[4];
    PDFHelpers.desenharCard(
      doc,
      (DIMENSIONS.pageWidth - cardWidth) / 2,
      y,
      cardWidth,
      cardHeight,
      ultimaMetrica.label,
      ultimaMetrica.value,
      ultimaMetrica.icon,
      ultimaMetrica.color
    );
    
    y += cardHeight + SPACING.sectionGap;
    
    // ===== GRÁFICO DE STATUS =====
    y = PDFHelpers.verificarQuebraPagina(doc, y, 70);
    y = PDFHelpers.desenharTituloSecao(doc, 'DISTRIBUIÇÃO POR STATUS', y, '📊');
    y += 10;
    
    if (dados.total_bombonas > 0) {
      const dadosGrafico = [
        {
          label: 'Ativas',
          value: dados.bombonas_ativas,
          color: COLORS.success
        },
        {
          label: 'Em Uso',
          value: dados.bombonas_em_uso,
          color: COLORS.highlight
        },
        {
          label: 'Inativas',
          value: dados.total_bombonas - dados.bombonas_ativas,
          color: COLORS.inactive
        }
      ];
      
      const centerX = 70;
      const centerY = y + 30;
      
      PDFHelpers.desenharGraficoPizza(
        doc,
        centerX,
        centerY,
        DIMENSIONS.chartRadius,
        dadosGrafico
      );
      
      PDFHelpers.desenharLegenda(
        doc,
        120,
        y + 10,
        dadosGrafico,
        dados.total_bombonas
      );
      
      y += 70;
    }
    
    // ===== PRODUTOS MAIS UTILIZADOS =====
    if (dados.produtos_mais_utilizados && dados.produtos_mais_utilizados !== 'Nenhum dado') {
      y = PDFHelpers.verificarQuebraPagina(doc, y, 40);
      y = PDFHelpers.desenharTituloSecao(doc, 'PRODUTOS MAIS UTILIZADOS', y, '🏆');
      y += 5;
      
      // Card de produtos
      doc.setFillColor(...COLORS.primaryUltraLight);
      doc.roundedRect(SPACING.pageMargin, y, DIMENSIONS.pageWidth - 2 * SPACING.pageMargin, 30, 4, 4, 'F');
      
      doc.setDrawColor(...COLORS.primaryLight);
      doc.setLineWidth(0.5);
      doc.roundedRect(SPACING.pageMargin, y, DIMENSIONS.pageWidth - 2 * SPACING.pageMargin, 30, 4, 4, 'S');
      
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      doc.setFont('helvetica', 'normal');
      
      const linhasProdutos = doc.splitTextToSize(
        dados.produtos_mais_utilizados,
        DIMENSIONS.pageWidth - 2 * SPACING.pageMargin - 10
      );
      doc.text(linhasProdutos, SPACING.pageMargin + 5, y + 8);
      
      y += 35;
    }
    
    // Rodapé
    PDFHelpers.desenharRodape(doc);
    
    return doc;
  }

  // ===== RELATÓRIO ANUAL =====
  static gerarRelatorioAnual(dados: DadoAnual[], ano: number): jsPDF {
    const doc = new jsPDF();
    
    // Cabeçalho
    PDFHelpers.desenharCabecalho(
      doc,
      'BONNATECH',
      'Relatório Anual de Bombonas',
      `Ano ${ano}`
    );
    
    let y = DIMENSIONS.headerHeight + 15;
    
    if (dados.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.textSecondary);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'Nenhum dado disponível para o período selecionado',
        DIMENSIONS.pageWidth / 2,
        y,
        { align: 'center' }
      );
      
      PDFHelpers.desenharRodape(doc);
      return doc;
    }
    
    // ===== RESUMO ANUAL =====
    y = PDFHelpers.desenharTituloSecao(doc, 'RESUMO ANUAL', y, '📊');
    y += 5;
    
    const totalBombonas = Math.max(...dados.map(d => d.total_bombonas));
    const totalUsuarios = dados.reduce((sum, d) => sum + d.novos_usuarios, 0);
    const mediaBombonas = Math.round(
      dados.reduce((sum, d) => sum + d.bombonas_ativas, 0) / dados.length
    );
    
    const resumoCards = [
      {
        label: 'PICO DE BOMBONAS',
        value: totalBombonas,
        icon: '📈',
        color: COLORS.primary
      },
      {
        label: 'NOVOS USUÁRIOS',
        value: totalUsuarios,
        icon: '👥',
        color: COLORS.info
      },
      {
        label: 'MÉDIA ATIVAS/MÊS',
        value: mediaBombonas,
        icon: '📊',
        color: COLORS.success
      }
    ];
    
    let x = SPACING.pageMargin + 5;
    const cardWidth = 55;
    const cardHeight = 38;
    
    resumoCards.forEach(card => {
      PDFHelpers.desenharCard(
        doc, x, y, cardWidth, cardHeight,
        card.label, card.value, card.icon, card.color
      );
      x += cardWidth + 8;
    });
    
    y += cardHeight + SPACING.sectionGap;
    
    // ===== GRÁFICO DE EVOLUÇÃO =====
    y = PDFHelpers.verificarQuebraPagina(doc, y, 80);
    y = PDFHelpers.desenharTituloSecao(doc, 'EVOLUÇÃO MENSAL', y, '📈');
    y += 10;
    
    const dadosGrafico = dados.map(item => ({
      label: PDFHelpers.converterMesInglesParaPortugues(item.mes).substring(0, 3),
      value: item.bombonas_ativas
    }));
    
    PDFHelpers.desenharGraficoLinhas(
      doc,
      SPACING.pageMargin + 10,
      y,
      DIMENSIONS.pageWidth - 2 * SPACING.pageMargin - 20,
      60,
      dadosGrafico,
      COLORS.primary
    );
    
    y += 75;
    
    // ===== TABELA DETALHADA =====
    y = PDFHelpers.verificarQuebraPagina(doc, y, 60);
    y = PDFHelpers.desenharTituloSecao(doc, 'DETALHAMENTO MENSAL', y, '📋');
    y += 5;
    
    const colunas = [
      { header: 'MÊS', width: 35, key: 'mes' },
      { header: 'TOTAL', width: 30, key: 'total_bombonas' },
      { header: 'ATIVAS', width: 30, key: 'bombonas_ativas' },
      { header: 'EM USO', width: 30, key: 'bombonas_em_uso' },
      { header: 'NOVOS USU.', width: 35, key: 'novos_usuarios' }
    ];
    
    const dadosTabela = dados.map(item => ({
      mes: PDFHelpers.converterMesInglesParaPortugues(item.mes),
      total_bombonas: item.total_bombonas,
      bombonas_ativas: item.bombonas_ativas,
      bombonas_em_uso: item.bombonas_em_uso,
      novos_usuarios: item.novos_usuarios
    }));
    
    y = PDFHelpers.desenharTabela(
      doc,
      SPACING.pageMargin,
      y,
      DIMENSIONS.pageWidth - 2 * SPACING.pageMargin,
      colunas,
      dadosTabela
    );
    
    // Rodapé
    PDFHelpers.desenharRodape(doc);
    
    return doc;
  }

  // ===== RELATÓRIO ANALYTICS COMPLETO =====
  static gerarAnalyticsCompleto(dados: DadosAnalytics): jsPDF {
    const doc = new jsPDF();
    
    // Cabeçalho
    PDFHelpers.desenharCabecalho(
      doc,
      'BONNATECH',
      'Analytics Completo',
      'Análise Histórica de Dados'
    );
    
    let y = DIMENSIONS.headerHeight + 15;
    
    // ===== RESUMO EXECUTIVO =====
    y = PDFHelpers.desenharTituloSecao(doc, 'RESUMO EXECUTIVO', y, '🎯');
    y += 5;
    
    const resumoMetricas = [
      {
        label: 'TOTAL BOMBONAS HISTÓRICO',
        value: dados.resumo_geral.total_bombonas_historico,
        icon: '📦',
        color: COLORS.primary
      },
      {
        label: 'TOTAL USUÁRIOS',
        value: dados.resumo_geral.total_usuarios,
        icon: '👥',
        color: COLORS.info
      },
      {
        label: 'TOTAL CICLOS',
        value: dados.resumo_geral.total_ciclos,
        icon: '🔄',
        color: COLORS.highlight
      },
      {
        label: 'TAXA REUTILIZAÇÃO',
        value: `${dados.resumo_geral.taxa_reutilizacao.toFixed(1)}%`,
        icon: '♻️',
        color: COLORS.success
      }
    ];
    
    let x = SPACING.pageMargin;
    const cardWidth = 85;
    const cardHeight = 38;
    const gap = 10;
    
    resumoMetricas.slice(0, 2).forEach(metrica => {
      PDFHelpers.desenharCard(
        doc, x, y, cardWidth, cardHeight,
        metrica.label, metrica.value, metrica.icon, metrica.color
      );
      x += cardWidth + gap;
    });
    
    y += cardHeight + gap;
    x = SPACING.pageMargin;
    
    resumoMetricas.slice(2, 4).forEach(metrica => {
      PDFHelpers.desenharCard(
        doc, x, y, cardWidth, cardHeight,
        metrica.label, metrica.value, metrica.icon, metrica.color
      );
      x += cardWidth + gap;
    });
    
    y += cardHeight + SPACING.sectionGap;
    
    // ===== DISTRIBUIÇÃO DE STATUS =====
    y = PDFHelpers.verificarQuebraPagina(doc, y, 70);
    y = PDFHelpers.desenharTituloSecao(doc, 'DISTRIBUIÇÃO ATUAL DE STATUS', y, '📊');
    y += 10;
    
    const dadosStatus = [
      {
        label: 'Ativas',
        value: dados.distribuicao_status.ativas,
        color: COLORS.success
      },
      {
        label: 'Em Uso',
        value: dados.distribuicao_status.em_uso,
        color: COLORS.highlight
      },
      {
        label: 'Inativas',
        value: dados.distribuicao_status.inativas,
        color: COLORS.inactive
      }
    ];
    
    const totalStatus = dadosStatus.reduce((sum, item) => sum + item.value, 0);
    
    if (totalStatus > 0) {
      PDFHelpers.desenharGraficoPizza(
        doc,
        70,
        y + 30,
        DIMENSIONS.chartRadius,
        dadosStatus
      );
      
      PDFHelpers.desenharLegenda(doc, 120, y + 10, dadosStatus, totalStatus);
      
      y += 70;
    }
    
    // ===== PRODUTOS POPULARES =====
    if (dados.produtos_populares.length > 0) {
      y = PDFHelpers.verificarQuebraPagina(doc, y, 80);
      y = PDFHelpers.desenharTituloSecao(doc, 'TOP PRODUTOS', y, '🏆');
      y += 10;
      
      const topProdutos = dados.produtos_populares.slice(0, 5).map(p => ({
        label: p.produto.substring(0, 15),
        value: p.uso_count
      }));
      
      PDFHelpers.desenharGraficoBarras(
        doc,
        SPACING.pageMargin,
        y,
        DIMENSIONS.pageWidth - 2 * SPACING.pageMargin,
        50,
        topProdutos,
        COLORS.accent
      );
      
      y += 70;
    }
    
    // ===== EVOLUÇÃO HISTÓRICA =====
    if (dados.evolucao_mensal.length > 0) {
      y = PDFHelpers.verificarQuebraPagina(doc, y, 90);
      
      if (y < 100) {
        doc.addPage();
        y = 20;
      }
      
      y = PDFHelpers.desenharTituloSecao(doc, 'EVOLUÇÃO HISTÓRICA', y, '📈');
      y += 10;
      
      const evolucaoData = dados.evolucao_mensal.map(item => ({
        label: PDFHelpers.converterMesInglesParaPortugues(item.mes).substring(0, 3),
        value: item.bombonas_ativas
      }));
      
      PDFHelpers.desenharGraficoLinhas(
        doc,
        SPACING.pageMargin + 10,
        y,
        DIMENSIONS.pageWidth - 2 * SPACING.pageMargin - 20,
        60,
        evolucaoData,
        COLORS.primary
      );
      
      y += 75;
      
      // Tabela resumida
      y = PDFHelpers.verificarQuebraPagina(doc, y, 60);
      
      const colunasEvolucao = [
        { header: 'PERÍODO', width: 40, key: 'mes' },
        { header: 'ATIVAS', width: 35, key: 'bombonas_ativas' },
        { header: 'EM USO', width: 35, key: 'bombonas_em_uso' },
        { header: 'USUÁRIOS', width: 35, key: 'novos_usuarios' }
      ];
      
      const dadosTabelaEvolucao = dados.evolucao_mensal.slice(-12).map(item => ({
        mes: PDFHelpers.converterMesInglesParaPortugues(item.mes).substring(0, 8),
        bombonas_ativas: item.bombonas_ativas,
        bombonas_em_uso: item.bombonas_em_uso,
        novos_usuarios: item.novos_usuarios
      }));
      
      y = PDFHelpers.desenharTabela(
        doc,
        SPACING.pageMargin + 15,
        y,
        DIMENSIONS.pageWidth - 2 * SPACING.pageMargin - 30,
        colunasEvolucao,
        dadosTabelaEvolucao
      );
    }
    
    // Rodapé
    PDFHelpers.desenharRodape(doc);
    
    return doc;
  }
}
