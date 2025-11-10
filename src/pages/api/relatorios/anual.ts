import { NextApiRequest, NextApiResponse } from 'next';
import ExcelJS from 'exceljs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório Anual');

    // Cabeçalhos
    worksheet.columns = [
      { header: 'Mês', key: 'mes', width: 15 },
      { header: 'Total Bombonas', key: 'total', width: 15 },
      { header: 'Em Uso', key: 'emUso', width: 15 },
      { header: 'Disponíveis', key: 'disponiveis', width: 15 },
      { header: 'Taxa Utilização', key: 'taxa', width: 15 },
    ];

    // Dados de exemplo
    const meses = [
      { mes: 'Janeiro', total: 150, emUso: 120, disponiveis: 30, taxa: '80%' },
      { mes: 'Fevereiro', total: 155, emUso: 130, disponiveis: 25, taxa: '84%' },
      { mes: 'Março', total: 160, emUso: 140, disponiveis: 20, taxa: '88%' },
    ];

    meses.forEach(dados => {
      worksheet.addRow(dados);
    });

    // Estiliza o cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0077B6' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-anual-bonnatech.xlsx"');

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
