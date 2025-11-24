// src/pages/Reports.tsx
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BarChart3, FileText, Calendar, Droplet, Truck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { analyticsService } from '@/services/analyticsService';
import { pdfAnalyticsService } from '@/services/pdfAnalyticsService';
import { AnalyticsData } from '@/services/types';

// Importações do Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingMonthly, setExportingMonthly] = useState(false);
  const [exportingYearly, setExportingYearly] = useState(false);
  const chartsRef = useRef<HTMLDivElement>(null);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getAllAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Erro ao carregar dados de analytics:', error);
      toast.error('Erro ao carregar dados de analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const handleExportPDF = async () => {
    if (!chartsRef.current || !analyticsData) return;

    try {
      setExporting(true);
      const imageData = await pdfAnalyticsService.captureCharts(chartsRef.current);
      
      const pdfData = {
        imageData,
        analyticsData,
        generatedAt: new Date().toLocaleString('pt-BR'),
        reportType: 'completo'
      };
      
      const pdfBlob = await pdfAnalyticsService.generateAnalyticsPDF(pdfData);
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-analytics-completo-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF analytics gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportMonthlyPDF = async () => {
    if (!analyticsData) return;

    try {
      setExportingMonthly(true);
      
      const monthlyData = {
        analyticsData,
        generatedAt: new Date().toLocaleString('pt-BR'),
        period: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      };
      
      const pdfBlob = await pdfAnalyticsService.generateMonthlyPDF(monthlyData);
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-mensal-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF mensal gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF mensal:', error);
      toast.error('Erro ao gerar PDF mensal');
    } finally {
      setExportingMonthly(false);
    }
  };

  const handleExportYearlyPDF = async () => {
    if (!analyticsData) return;

    try {
      setExportingYearly(true);
      
      const yearlyData = {
        analyticsData,
        generatedAt: new Date().toLocaleString('pt-BR'),
        period: new Date().getFullYear().toString()
      };
      
      const pdfBlob = await pdfAnalyticsService.generateYearlyPDF(yearlyData);
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-anual-${new Date().getFullYear()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF anual gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF anual:', error);
      toast.error('Erro ao gerar PDF anual');
    } finally {
      setExportingYearly(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header limpo - igual às outras páginas */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Relatórios e Analytics</h1>
                <p className="text-muted-foreground mt-2">
                  Painel completo com dados de bombonas, lavagens e despachos - BonnaTech
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={loadAnalyticsData}
                  variant="outline"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Atualizando...' : 'Atualizar Dados'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Cards de Relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Relatório Mensal */}
          <Card className="transition-all hover:shadow-lg border-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Calendar className="w-5 h-5" />
                Relatório Mensal
              </CardTitle>
              <CardDescription className="text-green-600">
                Estatísticas consolidadas do mês atual
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                onClick={handleExportMonthlyPDF}
                disabled={exportingMonthly || !analyticsData}
              >
                <Download className="w-4 h-4 mr-2" />
                {exportingMonthly ? 'Gerando PDF...' : 'Exportar PDF Mensal'}
              </Button>
            </CardContent>
          </Card>

          {/* Relatório Anual */}
          <Card className="transition-all hover:shadow-lg border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <FileText className="w-5 h-5" />
                Relatório Anual
              </CardTitle>
              <CardDescription className="text-blue-600">
                Consolidado completo do ano atual
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                onClick={handleExportYearlyPDF}
                disabled={exportingYearly || !analyticsData}
              >
                <Download className="w-4 h-4 mr-2" />
                {exportingYearly ? 'Gerando PDF...' : 'Exportar PDF Anual'}
              </Button>
            </CardContent>
          </Card>

          {/* Analytics Completo */}
          <Card className="transition-all hover:shadow-lg border-2 border-primary">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="flex items-center gap-2 text-primary">
                <BarChart3 className="w-5 h-5" />
                Analytics em Tempo Real
              </CardTitle>
              <CardDescription>
                Todos os dados históricos com gráficos interativos
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button 
                className="w-full bg-gradient-eco text-primary-foreground shadow-eco hover:opacity-90"
                onClick={handleExportPDF}
                disabled={exporting || !analyticsData}
              >
                <Download className="w-4 h-4 mr-2" />
                {exporting ? 'Gerando PDF...' : 'Exportar PDF Completo'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Analytics em Tempo Real - Sempre visível */}
        <div className="space-y-6">
          {/* Header do Analytics */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Painel de Análise em Tempo Real</h2>
              <p className="text-muted-foreground">
                Análise integrada de bombonas, lavagens e despachos - BonnaTech
              </p>
            </div>
          </div>

          {/* Gráficos */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando dados de analytics...</p>
            </div>
          ) : analyticsData ? (
            <div ref={chartsRef} className="space-y-6">
              {/* KPIs Rápidos */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-700">{analyticsData.lavagensStats.totalLavagens}</p>
                      <p className="text-sm text-green-800 font-medium">Total Lavagens</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-700">{analyticsData.despachosStats.totalDespachos}</p>
                      <p className="text-sm text-blue-800 font-medium">Total Despachos</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-700">{analyticsData.cycles.total}</p>
                      <p className="text-sm text-purple-800 font-medium">Ciclos Totais</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-700">{analyticsData.cycles.average}</p>
                      <p className="text-sm text-emerald-800 font-medium">Média Ciclos</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Distribuições */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribuição por Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Status</CardTitle>
                    <CardDescription>
                      Status atual das bombonas no sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Doughnut 
                        data={analyticsData.status} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom' as const,
                            },
                          },
                        }} 
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Distribuição por Material */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Material</CardTitle>
                    <CardDescription>
                      Composição das bombonas por tipo de material
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Doughnut 
                        data={analyticsData.materialData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom' as const,
                            },
                          },
                        }} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos de Tendências */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Movimentações Mensais</CardTitle>
                    <CardDescription>
                      Total de bombonas cadastradas por mês
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Line 
                        data={analyticsData.monthly} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom' as const,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                            },
                          },
                        }} 
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bombonas por Ano</CardTitle>
                    <CardDescription>
                      Distribuição de bombonas cadastradas por ano
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Bar 
                        data={analyticsData.yearly} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom' as const,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                            },
                          },
                        }} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos de Operações */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplet className="w-5 h-5" />
                      Lavagens Realizadas
                    </CardTitle>
                    <CardDescription>
                      Histórico mensal de lavagens realizadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Line 
                        data={analyticsData.lavagensData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom' as const,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                            },
                          },
                        }} 
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Despachos Realizados
                    </CardTitle>
                    <CardDescription>
                      Histórico mensal de despachos realizados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Line 
                        data={analyticsData.despachosData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom' as const,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                            },
                          },
                        }} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Erro ao carregar dados. Tente atualizar a página.</p>
                  <Button 
                    onClick={loadAnalyticsData} 
                    variant="outline" 
                    className="mt-4"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;