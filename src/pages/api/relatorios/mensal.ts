import { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Cabeçalho
    page.drawText('Relatório Mensal - BonnaTech', {
      x: 50,
      y: height - 50,
      size: 20,
      font,
      color: rgb(0, 0.53, 0.71),
    });

    page.drawText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, {
      x: 50,
      y: height - 80,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    // Dados do relatório
    page.drawText('Resumo de Bombonas:', {
      x: 50,
      y: height - 120,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText('• Total de Bombonas: [DADOS DO BANCO]', {
      x: 50,
      y: height - 150,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText('• Em Uso: [DADOS DO BANCO]', {
      x: 50,
      y: height - 170,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText('• Disponíveis: [DADOS DO BANCO]', {
      x: 50,
      y: height - 190,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-mensal-bonnatech.pdf"');
    res.send(pdfBytes);

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
