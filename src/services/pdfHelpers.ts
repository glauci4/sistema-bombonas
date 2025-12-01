// src/services/pdfHelpers.ts
import { jsPDF } from 'jspdf';
import { COLORS, TYPOGRAPHY, SPACING, DIMENSIONS, MESES } from './constants';

// Interface para dados da tabela
interface TableData {
  [key: string]: string | number;
}

export class PDFHelpers {
  // ===== CABEÇALHO =====
  static desenharCabecalho(
    doc: jsPDF, 
    titulo: string, 
    subtitulo: string, 
    periodo: string
  ) {
    // Fundo gradiente (verde corporativo)
    doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.rect(0, 0, DIMENSIONS.pageWidth, DIMENSIONS.headerHeight, 'F');
    
    // Overlay sutil para profundidade
    doc.setFillColor(255, 255, 255);
    doc.setGState(doc.GState({ opacity: 0.05 }));
    doc.rect(0, 0, DIMENSIONS.pageWidth, DIMENSIONS.headerHeight, 'F');
    doc.setGState(doc.GState({ opacity: 1 }));
    
    // Logo/Ícone circular com sombra
    doc.setFillColor(255, 255, 255);
    doc.setGState(doc.GState({ opacity: 0.15 }));
    doc.circle(25, 30, 15, 'F');
    doc.setGState(doc.GState({ opacity: 1 }));
    
    // Ícone bombona (representação simplificada)
    doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.roundedRect(21, 23, 8, 14, 2, 2, 'F');
    
    // Título principal
    doc.setFontSize(TYPOGRAPHY.title.size);
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setFont('helvetica', TYPOGRAPHY.title.weight);
    doc.text(titulo, DIMENSIONS.pageWidth / 2, 25, { align: 'center' });
    
    // Subtítulo
    doc.setFontSize(TYPOGRAPHY.subtitle.size);
    doc.setFont('helvetica', TYPOGRAPHY.subtitle.weight);
    doc.text(subtitulo, DIMENSIONS.pageWidth / 2, 35, { align: 'center' });
    
    // Período
    doc.setFontSize(TYPOGRAPHY.body.size + 2);
    doc.setFont('helvetica', 'bold');
    doc.text(periodo, DIMENSIONS.pageWidth / 2, 45, { align: 'center' });
    
    // Linha decorativa
    doc.setDrawColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setLineWidth(0.5);
    doc.line(50, 52, DIMENSIONS.pageWidth - 50, 52);
  }

  // ===== RODAPÉ =====
  static desenharRodape(doc: jsPDF) {
    const dataGeracao = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    const horaGeracao = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Linha decorativa
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.3);
    doc.line(SPACING.pageMargin, DIMENSIONS.footerY - 5, DIMENSIONS.pageWidth - SPACING.pageMargin, DIMENSIONS.footerY - 5);
    
    // Texto do rodapé
    doc.setFontSize(TYPOGRAPHY.caption.size);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.setFont('helvetica', 'normal');
    
    doc.text(
      `Gerado em ${dataGeracao} às ${horaGeracao}`, 
      DIMENSIONS.pageWidth / 2, 
      DIMENSIONS.footerY, 
      { align: 'center' }
    );
    
    doc.setFont('helvetica', 'bold');
    doc.text(
      'BonnaTech • Sistema de Rastreamento de Bombonas Sustentáveis', 
      DIMENSIONS.pageWidth / 2, 
      DIMENSIONS.footerY + 4, 
      { align: 'center' }
    );
  }

  // ===== CARD DE MÉTRICA =====
  static desenharCard(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    value: string | number,
    icon: string,
    color: [number, number, number] = COLORS.primary
  ) {
    // Sombra sutil
    doc.setFillColor(0, 0, 0);
    doc.setGState(doc.GState({ opacity: 0.03 }));
    doc.roundedRect(x + 1, y + 1, width, height, 4, 4, 'F');
    doc.setGState(doc.GState({ opacity: 1 }));
    
    // Fundo do card
    doc.setFillColor(COLORS.backgroundCard[0], COLORS.backgroundCard[1], COLORS.backgroundCard[2]);
    doc.roundedRect(x, y, width, height, 4, 4, 'F');
    
    // Borda
    doc.setDrawColor(COLORS.borderLight[0], COLORS.borderLight[1], COLORS.borderLight[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, width, height, 4, 4, 'S');
    
    // Faixa colorida superior
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(x, y, width, 6, 4, 4, 'F');
    doc.setFillColor(COLORS.backgroundCard[0], COLORS.backgroundCard[1], COLORS.backgroundCard[2]);
    doc.rect(x, y + 3, width, 3, 'F');
    
    // Ícone
    doc.setFontSize(16);
    doc.text(icon, x + 8, y + 20);
    
    // Valor
    doc.setFontSize(TYPOGRAPHY.title.size - 2);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(value.toString(), x + width / 2, y + 22, { align: 'center' });
    
    // Label
    doc.setFontSize(TYPOGRAPHY.caption.size);
    doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(label, width - 8);
    doc.text(lines, x + width / 2, y + 30, { align: 'center' });
  }

  // ===== TÍTULO DE SEÇÃO =====
  static desenharTituloSecao(
    doc: jsPDF,
    texto: string,
    y: number,
    icon?: string
  ): number {
    const x = SPACING.pageMargin;
    
    // Ícone opcional
    if (icon) {
      doc.setFontSize(12);
      doc.text(icon, x, y + 5);
    }
    
    // Texto
    doc.setFontSize(TYPOGRAPHY.heading.size);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(texto, icon ? x + 8 : x, y + 5);
    
    // Linha decorativa
    const lineStartX = x;
    const lineY = y + 8;
    
    doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setLineWidth(1.5);
    doc.line(lineStartX, lineY, lineStartX + 30, lineY);
    
    doc.setDrawColor(COLORS.primaryLight[0], COLORS.primaryLight[1], COLORS.primaryLight[2]);
    doc.setLineWidth(0.5);
    doc.line(lineStartX + 32, lineY, DIMENSIONS.pageWidth - SPACING.pageMargin, lineY);
    
    return y + 12;
  }

  // ===== GRÁFICO DE PIZZA =====
  static desenharGraficoPizza(
    doc: jsPDF,
    centerX: number,
    centerY: number,
    radius: number,
    dados: Array<{ label: string; value: number; color: [number, number, number] }>
  ) {
    const total = dados.reduce((sum, item) => sum + item.value, 0);
    
    if (total === 0) return;
    
    let startAngle = -90; // Começar do topo
    
    dados.forEach((item) => {
      const sliceAngle = (item.value / total) * 360;
      
      if (item.value > 0) {
        // Fatia
        doc.setFillColor(item.color[0], item.color[1], item.color[2]);
        this.desenharFatia(doc, centerX, centerY, radius, startAngle, sliceAngle);
        
        // Borda branca fina entre fatias
        doc.setDrawColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
        doc.setLineWidth(0.8);
        this.desenharBordaFatia(doc, centerX, centerY, radius, startAngle, sliceAngle);
        
        startAngle += sliceAngle;
      }
    });
    
    // Círculo central para efeito donut (opcional)
    doc.setFillColor(COLORS.backgroundCard[0], COLORS.backgroundCard[1], COLORS.backgroundCard[2]);
    doc.circle(centerX, centerY, radius * 0.5, 'F');
  }

  private static desenharFatia(
    doc: jsPDF,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    sliceAngle: number
  ) {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + sliceAngle) * Math.PI) / 180;
    
    doc.moveTo(centerX, centerY);
    doc.lineTo(centerX + radius * Math.cos(startRad), centerY + radius * Math.sin(startRad));
    
    const steps = Math.max(2, Math.ceil(sliceAngle / 5));
    for (let i = 1; i <= steps; i++) {
      const angle = startRad + (endRad - startRad) * (i / steps);
      doc.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
    }
    
    doc.lineTo(centerX, centerY);
    doc.fill();
  }

  private static desenharBordaFatia(
    doc: jsPDF,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    sliceAngle: number
  ) {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + sliceAngle) * Math.PI) / 180;
    
    doc.line(
      centerX,
      centerY,
      centerX + radius * Math.cos(startRad),
      centerY + radius * Math.sin(startRad)
    );
    doc.line(
      centerX,
      centerY,
      centerX + radius * Math.cos(endRad),
      centerY + radius * Math.sin(endRad)
    );
  }

  // ===== LEGENDA DE GRÁFICO =====
  static desenharLegenda(
    doc: jsPDF,
    x: number,
    y: number,
    dados: Array<{ label: string; value: number; color: [number, number, number] }>,
    total: number
  ): number {
    let currentY = y;
    
    dados.forEach((item) => {
      // Quadrado colorido
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.roundedRect(x, currentY, 4, 4, 0.5, 0.5, 'F');
      
      // Texto
      doc.setFontSize(TYPOGRAPHY.caption.size + 1);
      doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
      doc.setFont('helvetica', 'normal');
      
      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
      const texto = `${item.label}: ${item.value} (${percentage}%)`;
      doc.text(texto, x + 7, currentY + 3);
      
      currentY += 6;
    });
    
    return currentY;
  }

  // ===== GRÁFICO DE BARRAS =====
  static desenharGraficoBarras(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
    dados: Array<{ label: string; value: number }>,
    color: [number, number, number] = COLORS.primary
  ) {
    if (dados.length === 0) return;
    
    const maxValue = Math.max(...dados.map(d => d.value));
    const barWidth = width / dados.length - 2;
    const barGap = 2;
    
    dados.forEach((item, index) => {
      const barHeight = maxValue > 0 ? (item.value / maxValue) * height : 0;
      const barX = x + index * (barWidth + barGap);
      const barY = y + height - barHeight;
      
      // Barra com gradiente simulado
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(barX, barY, barWidth, barHeight, 1, 1, 'F');
      
      // Highlight no topo
      doc.setFillColor(255, 255, 255);
      doc.setGState(doc.GState({ opacity: 0.2 }));
      doc.roundedRect(barX, barY, barWidth, Math.min(barHeight, 3), 1, 1, 'F');
      doc.setGState(doc.GState({ opacity: 1 }));
      
      // Valor acima da barra
      if (item.value > 0) {
        doc.setFontSize(TYPOGRAPHY.caption.size);
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(
          item.value.toString(),
          barX + barWidth / 2,
          barY - 2,
          { align: 'center' }
        );
      }
      
      // Label abaixo
      doc.setFontSize(TYPOGRAPHY.small.size);
      doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
      doc.setFont('helvetica', 'normal');
      const labelLines = doc.splitTextToSize(item.label, barWidth);
      doc.text(labelLines, barX + barWidth / 2, y + height + 4, { align: 'center' });
    });
  }

  // ===== GRÁFICO DE LINHAS =====
  static desenharGraficoLinhas(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
    dados: Array<{ label: string; value: number }>,
    color: [number, number, number] = COLORS.primary
  ) {
    if (dados.length === 0) return;
    
    const maxValue = Math.max(...dados.map(d => d.value), 1);
    const stepX = width / (dados.length - 1 || 1);
    
    // Eixos
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.5);
    doc.line(x, y + height, x + width, y + height); // Eixo X
    doc.line(x, y, x, y + height); // Eixo Y
    
    // Grid horizontal sutil
    doc.setDrawColor(COLORS.borderLight[0], COLORS.borderLight[1], COLORS.borderLight[2]);
    doc.setLineWidth(0.2);
    for (let i = 1; i <= 4; i++) {
      const gridY = y + (height / 4) * i;
      doc.line(x, gridY, x + width, gridY);
    }
    
    // Linha do gráfico
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(1.5);
    
    dados.forEach((item, index) => {
      const pointX = x + index * stepX;
      const pointY = y + height - (item.value / maxValue) * height;
      
      if (index === 0) {
        doc.moveTo(pointX, pointY);
      } else {
        doc.lineTo(pointX, pointY);
      }
    });
    doc.stroke();
    
    // Pontos
    dados.forEach((item, index) => {
      const pointX = x + index * stepX;
      const pointY = y + height - (item.value / maxValue) * height;
      
      // Ponto externo
      doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
      doc.circle(pointX, pointY, 2.5, 'F');
      
      // Ponto interno
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(pointX, pointY, 1.8, 'F');
      
      // Label
      doc.setFontSize(TYPOGRAPHY.caption.size);
      doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(item.label, pointX, y + height + 5, { align: 'center' });
    });
  }

  // ===== TABELA MODERNA =====
  static desenharTabela(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    colunas: Array<{ header: string; width: number; key: string }>,
    dados: TableData[]
  ): number {
    let currentY = y;
    
    // Cabeçalho
    doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.roundedRect(x, currentY, width, 10, 2, 2, 'F');
    
    doc.setFontSize(TYPOGRAPHY.caption.size + 1);
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setFont('helvetica', 'bold');
    
    let currentX = x + 5;
    colunas.forEach(col => {
      doc.text(col.header, currentX, currentY + 6);
      currentX += col.width;
    });
    
    currentY += 10;
    
    // Dados
    doc.setFontSize(TYPOGRAPHY.caption.size);
    doc.setFont('helvetica', 'normal');
    
    dados.forEach((row, index) => {
      // Zebra striping
      if (index % 2 === 0) {
        doc.setFillColor(COLORS.background[0], COLORS.background[1], COLORS.background[2]);
      } else {
        doc.setFillColor(COLORS.backgroundCard[0], COLORS.backgroundCard[1], COLORS.backgroundCard[2]);
      }
      doc.rect(x, currentY, width, 8, 'F');
      
      // Dados da linha
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      currentX = x + 5;
      colunas.forEach(col => {
        const valor = row[col.key]?.toString() || '-';
        doc.text(valor, currentX, currentY + 5);
        currentX += col.width;
      });
      
      currentY += 8;
      
      // Quebra de página
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
    });
    
    return currentY + 5;
  }

  // ===== UTILITÁRIOS =====
  static getNomeMes(mes: number): string {
    return MESES.pt[mes - 1] || 'Mês inválido';
  }

  static converterMesInglesParaPortugues(mesIngles: string): string {
    const mesTotrim = mesIngles.trim();
    return MESES.en[mesTotrim as keyof typeof MESES.en] || mesIngles;
  }

  static formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  static verificarQuebraPagina(doc: jsPDF, currentY: number, necessario: number = 40): number {
    if (currentY + necessario > 270) {
      doc.addPage();
      this.desenharRodape(doc);
      return 20;
    }
    return currentY;
  }
}