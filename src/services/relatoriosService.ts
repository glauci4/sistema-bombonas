import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from 'jspdf';

interface DadosMensais {
  total_bombonas: number;
  bombonas_ativas: number;
  bombonas_em_uso: number;
  total_usuarios: number;
  produtos_mais_utilizados: string;
  ciclos_mensais: number;
}

interface DadoAnual {
  mes: string;
  total_bombonas: number;
  bombonas_ativas: number;
  bombonas_em_uso: number;
  novos_usuarios: number;
}

export const relatoriosService = {
  async gerarRelatorioMensal(mes: number, ano: number): Promise<string> {
    try {
      console.log(`📊 Gerando relatório mensal: ${mes}/${ano}`);
      const dadosMensais = await this.buscarDadosMensaisManual(mes, ano);
      const nomeArquivo = await this.gerarPDFMensal(dadosMensais, mes, ano);
      console.log(`✅ PDF gerado com sucesso: ${nomeArquivo}`);
      return nomeArquivo;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório mensal:', error);
      throw error;
    }
  },

  async gerarRelatorioAnual(ano: number): Promise<string> {
    try {
      console.log(`📊 Gerando relatório anual: ${ano}`);
      const dadosAnuais = await this.buscarDadosAnuaisManual(ano);
      const nomeArquivo = await this.gerarPDFAnual(dadosAnuais, ano);
      console.log(`✅ PDF anual gerado com sucesso: ${nomeArquivo}`);
      return nomeArquivo;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório anual:', error);
      throw error;
    }
  },

  // ===== GERADOR DE PDF MENSAL =====
  async gerarPDFMensal(dados: DadosMensais, mes: number, ano: number): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = margin;
        
        // Cabeçalho centralizado
        doc.setFontSize(24);
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');
        doc.text('EcoTrack', pageWidth / 2, y, { align: 'center' });
        
        y += 10;
        
        // Data atual
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(dataAtual, pageWidth / 2, y, { align: 'center' });
        
        y += 20;
        
        // Título do relatório
        const nomeMes = this.getNomeMes(mes);
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text(`Relatório Mensal - ${nomeMes} de ${ano}`, pageWidth / 2, y, { align: 'center' });
        
        y += 30;
        
        // Resumo Executivo
        doc.setFontSize(16);
        doc.text('Resumo Executivo', margin, y);
        
        y += 20;
        
        // Tabela de métricas
        const metrics = [
          { label: 'Total de Bombonas', value: dados.total_bombonas.toString() },
          { label: 'Taxa de Utilização', value: dados.total_bombonas > 0 ? ((dados.bombonas_em_uso / dados.total_bombonas) * 100).toFixed(1) + '%' : '0.0%' },
          { label: 'Taxa de Disponibilidade', value: dados.total_bombonas > 0 ? ((dados.bombonas_ativas / dados.total_bombonas) * 100).toFixed(1) + '%' : '0.0%' },
          { label: 'Total de Ciclos', value: dados.ciclos_mensais.toString() }
        ];
        
        const col1X = margin;
        const col2X = pageWidth - margin - 40;
        
        metrics.forEach((metric, index) => {
          const currentY = y + (index * 15);
          
          doc.setFontSize(11);
          doc.setTextColor(71, 85, 105);
          doc.setFont('helvetica', 'normal');
          doc.text(metric.label, col1X, currentY);
          
          doc.setFontSize(11);
          doc.setTextColor(15, 23, 42);
          doc.setFont('helvetica', 'bold');
          doc.text(metric.value, col2X, currentY);
        });
        
        y += (metrics.length * 15) + 30;
        
        // Distribuição por Status
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text('Distribuição por Status', margin, y);
        
        y += 20;
        
        const distribuicao = [
          { status: 'Disponível', quantidade: Math.max(0, dados.bombonas_ativas - dados.bombonas_em_uso), percentual: dados.total_bombonas > 0 ? (((dados.bombonas_ativas - dados.bombonas_em_uso) / dados.total_bombonas) * 100).toFixed(1) + '%' : '0.0%' },
          { status: 'Em Uso', quantidade: dados.bombonas_em_uso, percentual: dados.total_bombonas > 0 ? ((dados.bombonas_em_uso / dados.total_bombonas) * 100).toFixed(1) + '%' : '0.0%' },
          { status: 'Manutenção', quantidade: 0, percentual: '0.0%' },
          { status: 'Lavagem', quantidade: 0, percentual: '0.0%' }
        ];
        
        // Cabeçalho da tabela
        const statusX = margin;
        const qtdX = margin + 70;
        const percX = pageWidth - margin - 40;
        
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'bold');
        doc.text('Status', statusX, y);
        doc.text('Quantidade', qtdX, y);
        doc.text('Percentual', percX, y);
        
        y += 15;
        
        // Dados da distribuição
        distribuicao.forEach((item, index) => {
          const currentY = y + (index * 15);
          
          doc.setFontSize(11);
          doc.setTextColor(71, 85, 105);
          doc.setFont('helvetica', 'normal');
          doc.text(item.status, statusX, currentY);
          
          doc.setTextColor(15, 23, 42);
          doc.setFont('helvetica', 'bold');
          doc.text(item.quantidade.toString(), qtdX, currentY);
          doc.text(item.percentual, percX, currentY);
        });
        
        const nomeArquivo = `relatorio_mensal_${mes.toString().padStart(2, '0')}_${ano}.pdf`;
        doc.save(nomeArquivo);
        
        resolve(nomeArquivo);
        
      } catch (error) {
        console.error('❌ Erro ao gerar PDF mensal:', error);
        reject(error);
      }
    });
  },

  // ===== GERADOR DE PDF ANUAL =====
  async gerarPDFAnual(dados: DadoAnual[], ano: number): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = margin;
        
        // Cabeçalho centralizado
        doc.setFontSize(24);
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');
        doc.text('EcoTrack', pageWidth / 2, y, { align: 'center' });
        
        y += 10;
        
        // Data atual
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(dataAtual, pageWidth / 2, y, { align: 'center' });
        
        y += 20;
        
        // Título do relatório centralizado
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text(`Relatório Anual - ${ano}`, pageWidth / 2, y, { align: 'center' });
        
        y += 30;
        
        // Evolução Mensal
        doc.setFontSize(16);
        doc.text('Evolução Mensal', pageWidth / 2, y, { align: 'center' });
        
        y += 20;
        
        if (dados.length === 0) {
          doc.setFontSize(12);
          doc.setTextColor(100, 116, 139);
          doc.text('Nenhum dado disponível para o período selecionado', pageWidth / 2, y, { align: 'center' });
        } else {
          // Centralizar a tabela
          const tableWidth = 160;
          const tableStartX = (pageWidth - tableWidth) / 2;
          
          // Cabeçalho da tabela
          doc.setFontSize(11);
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'bold');
          
          const colunas = [
            { nome: 'Mês', x: tableStartX, largura: 40 },
            { nome: 'Total', x: tableStartX + 45, largura: 25 },
            { nome: 'Ativas', x: tableStartX + 75, largura: 25 },
            { nome: 'Em Uso', x: tableStartX + 105, largura: 25 },
            { nome: 'Novos Usu.', x: tableStartX + 135, largura: 25 }
          ];
          
          colunas.forEach(coluna => {
            doc.text(coluna.nome, coluna.x, y);
          });
          
          y += 12;
          
          // Dados da tabela
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          
          dados.forEach((item, index) => {
            const currentY = y + (index * 12);
            
            // Mês
            doc.setTextColor(71, 85, 105);
            doc.text(item.mes, colunas[0].x, currentY);
            
            // Valores numéricos
            doc.setTextColor(15, 23, 42);
            doc.setFont('helvetica', 'bold');
            doc.text(item.total_bombonas.toString(), colunas[1].x, currentY);
            doc.text(item.bombonas_ativas.toString(), colunas[2].x, currentY);
            doc.text(item.bombonas_em_uso.toString(), colunas[3].x, currentY);
            doc.text(item.novos_usuarios.toString(), colunas[4].x, currentY);
          });
        }
        
        const nomeArquivo = `relatorio_anual_${ano}.pdf`;
        doc.save(nomeArquivo);
        
        resolve(nomeArquivo);
        
      } catch (error) {
        console.error('❌ Erro ao gerar PDF anual:', error);
        reject(error);
      }
    });
  },

  // ===== MÉTODOS AUXILIARES =====
  formatarStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'available': 'Disponível',
      'in_use': 'Em Uso',
      'maintenance': 'Manutenção',
      'washing': 'Lavagem'
    };
    return statusMap[status] || status;
  },

  getNomeMes(mes: number): string {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1] || 'Mês inválido';
  },

  // ===== FALLBACK MANUAL MENSAL =====
  async buscarDadosMensaisManual(mes: number, ano: number): Promise<DadosMensais> {
    try {
      const { data: todasBombonas, error: todasError } = await supabase
        .from('bombonas')
        .select('*');

      if (todasError) throw todasError;

      const { data: usuarios, error: usuariosError } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', `${ano}-${mes.toString().padStart(2, '0')}-01`)
        .lt('created_at', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`);

      if (usuariosError) throw usuariosError;

      const { data: tracking, error: trackingError } = await supabase
        .from('tracking_history')
        .select('*')
        .gte('created_at', `${ano}-${mes.toString().padStart(2, '0')}-01`)
        .lt('created_at', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`);

      if (trackingError) throw trackingError;

      const totalBombonas = todasBombonas?.length || 0;
      const bombonasAtivas = todasBombonas?.filter(b => 
        b.status === 'available' || b.status === 'in_use'
      ).length || 0;
      const bombonasEmUso = todasBombonas?.filter(b => 
        b.status === 'in_use'
      ).length || 0;
      const totalUsuarios = usuarios?.length || 0;
      const ciclosMensais = tracking?.length || 0;

      const produtosCount: { [key: string]: number } = {};
      todasBombonas?.forEach(bombona => {
        if (bombona.current_product) {
          produtosCount[bombona.current_product] = (produtosCount[bombona.current_product] || 0) + 1;
        }
      });

      const produtosMaisUtilizados = Object.entries(produtosCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([produto, count]) => `${produto} (${count})`)
        .join(', ') || 'Nenhum dado disponível';

      return {
        total_bombonas: totalBombonas,
        bombonas_ativas: bombonasAtivas,
        bombonas_em_uso: bombonasEmUso,
        total_usuarios: totalUsuarios,
        produtos_mais_utilizados: produtosMaisUtilizados,
        ciclos_mensais: ciclosMensais
      };

    } catch (error) {
      console.error('Erro no fallback manual:', error);
      return {
        total_bombonas: 0,
        bombonas_ativas: 0,
        bombonas_em_uso: 0,
        total_usuarios: 0,
        produtos_mais_utilizados: 'Erro ao carregar dados',
        ciclos_mensais: 0
      };
    }
  },

  // ===== FALLBACK MANUAL ANUAL =====
  async buscarDadosAnuaisManual(ano: number): Promise<DadoAnual[]> {
    const meses = [];
    
    for (let mes = 1; mes <= 12; mes++) {
      try {
        const { data: bombonas, error } = await supabase
          .from('bombonas')
          .select('*')
          .lte('created_at', `${ano}-${mes.toString().padStart(2, '0')}-31`);

        if (error) throw error;

        const { data: novosUsuarios, error: usuariosError } = await supabase
          .from('profiles')
          .select('*')
          .gte('created_at', `${ano}-${mes.toString().padStart(2, '0')}-01`)
          .lt('created_at', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`);

        if (usuariosError) throw usuariosError;

        const totalBombonas = bombonas?.length || 0;
        const bombonasAtivas = bombonas?.filter(b => 
          b.status === 'available' || b.status === 'in_use'
        ).length || 0;
        const bombonasEmUso = bombonas?.filter(b => 
          b.status === 'in_use'
        ).length || 0;
        const novosUsuariosCount = novosUsuarios?.length || 0;

        meses.push({
          mes: this.getNomeMes(mes),
          total_bombonas: totalBombonas,
          bombonas_ativas: bombonasAtivas,
          bombonas_em_uso: bombonasEmUso,
          novos_usuarios: novosUsuariosCount
        });
      } catch (error) {
        console.error(`Erro no mês ${mes}:`, error);
        meses.push({
          mes: this.getNomeMes(mes),
          total_bombonas: 0,
          bombonas_ativas: 0,
          bombonas_em_uso: 0,
          novos_usuarios: 0
        });
      }
    }

    return meses;
  }
};