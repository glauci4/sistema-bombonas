import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Dados de exemplo - substitua por dados reais do seu banco
    const analyticsData = {
      periodo: 'Completo',
      dataGeracao: new Date().toISOString(),
      metricas: {
        totalBombonas: 165,
        taxaUtilizacaoMedia: '85%',
        ciclosTotais: 1247,
        economiaCO2: '2.4 toneladas',
        embalagensEconomizadas: 4580
      },
      evolucaoMensal: [
        { mes: 'Jan', bombonas: 150, utilizacao: '80%' },
        { mes: 'Fev', bombonas: 155, utilizacao: '84%' },
        { mes: 'Mar', bombonas: 160, utilizacao: '88%' }
      ]
    };

    // Retorna como JSON para download
    const jsonData = JSON.stringify(analyticsData, null, 2);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics-completo-bonnatech.json"');
    res.send(jsonData);

  } catch (error) {
    console.error('Erro ao gerar analytics:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}