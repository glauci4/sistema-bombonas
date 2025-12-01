// src/pages/Reports.tsx
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BarChart3, FileText, Calendar, Droplet, Truck, RefreshCw, TrendingUp, Package } from 'lucide-react';
import { toast } from 'sonner';
import { analyticsService } from '@/services/analyticsService';
import { pdfAnalyticsService } from '@/services/pdfAnalyticsService';
import { AnalyticsData } from '@/services/types';
import Navbar from '@/components/Navbar';

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

// Cores profissionais para os gráficos
const chartColors = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#8b5cf6',
  warning: '#f59e0b',
  error: '#ef4444',
  gray: '#6b7280',
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  green: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  }
};

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

  // Configurações dos gráficos corrigidas - removendo callback problemático
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <Navbar />
      
      {/* Header da página */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Relatórios e Analytics</h1>
                <p className="text-gray-600 mt-2">
                  Painel completo com dados de bombonas, lavagens e despachos - BonnaTech
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={loadAnalyticsData}
                  variant="outline"
                  disabled={loading}
                  className="flex items-center gap-2 border-gray-300"
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
          <Card className="transition-all hover:shadow-lg border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Calendar className="w-5 h-5" />
                Relatório Mensal
              </CardTitle>
              <CardDescription className="text-blue-700">
                Estatísticas consolidadas do mês atual
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                onClick={handleExportMonthlyPDF}
                disabled={exportingMonthly || !analyticsData}
              >
                <Download className="w-4 h-4 mr-2" />
                {exportingMonthly ? 'Gerando PDF...' : 'Exportar PDF Mensal'}
              </Button>
            </CardContent>
          </Card>

          {/* Relatório Anual */}
          <Card className="transition-all hover:shadow-lg border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <FileText className="w-5 h-5" />
                Relatório Anual
              </CardTitle>
              <CardDescription className="text-emerald-700">
                Consolidado completo do ano atual
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                onClick={handleExportYearlyPDF}
                disabled={exportingYearly || !analyticsData}
              >
                <Download className="w-4 h-4 mr-2" />
                {exportingYearly ? 'Gerando PDF...' : 'Exportar PDF Anual'}
              </Button>
            </CardContent>
          </Card>

          {/* Analytics Completo */}
          <Card className="transition-all hover:shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <BarChart3 className="w-5 h-5" />
                Analytics em Tempo Real
              </CardTitle>
              <CardDescription className="text-blue-700">
                Todos os dados históricos com gráficos interativos
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                onClick={handleExportPDF}
                disabled={exporting || !analyticsData}
              >
                <Download className="w-4 h-4 mr-2" />
                {exporting ? 'Gerando PDF...' : 'Exportar PDF Completo'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Analytics em Tempo Real */}
        <div className="space-y-6">
          {/* Header do Analytics */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Painel de Análise em Tempo Real</h2>
              <p className="text-gray-600">
                Análise integrada de bombonas, lavagens e despachos - BonnaTech
              </p>
            </div>
          </div>

          {/* Gráficos */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados de analytics...</p>
            </div>
          ) : analyticsData ? (
            <div ref={chartsRef} className="space-y-6">
              {/* KPIs Rápidos */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Droplet className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.lavagensStats.totalLavagens}</p>
                        <p className="text-sm text-gray-600 font-medium">Total Lavagens</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.despachosStats.totalDespachos}</p>
                        <p className="text-sm text-gray-600 font-medium">Total Despachos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.cycles.total}</p>
                        <p className="text-sm text-gray-600 font-medium">Ciclos Totais</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{analyticsData.cycles.average}</p>
                        <p className="text-sm text-gray-600 font-medium">Média Ciclos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Distribuições */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribuição por Status */}
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-900">Distribuição por Status</CardTitle>
                    <CardDescription className="text-gray-600">
                      Status atual das bombonas no sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-80">
                      <Doughnut 
                        data={{
                          ...analyticsData.status,
                          datasets: analyticsData.status.datasets.map(dataset => ({
                            ...dataset,
                            backgroundColor: [
                              chartColors.green[400],
                              chartColors.blue[400],
                              chartColors.accent,
                              chartColors.warning,
                              chartColors.error
                            ],
                            borderColor: 'white',
                            borderWidth: 2,
                            borderRadius: 8,
                            hoverOffset: 8
                          }))
                        }} 
                        options={doughnutOptions}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Distribuição por Material */}
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-900">Distribuição por Material</CardTitle>
                    <CardDescription className="text-gray-600">
                      Composição das bombonas por tipo de material
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-80">
                      <Doughnut 
                        data={{
                          ...analyticsData.materialData,
                          datasets: analyticsData.materialData.datasets.map(dataset => ({
                            ...dataset,
                            backgroundColor: [
                              chartColors.blue[400],
                              chartColors.green[400],
                              chartColors.accent,
                              chartColors.warning
                            ],
                            borderColor: 'white',
                            borderWidth: 2,
                            borderRadius: 8,
                            hoverOffset: 8
                          }))
                        }} 
                        options={doughnutOptions}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos de Tendências */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-900">Movimentações Mensais</CardTitle>
                    <CardDescription className="text-gray-600">
                      Total de bombonas cadastradas por mês
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-80">
                      <Line 
                        data={{
                          ...analyticsData.monthly,
                          datasets: analyticsData.monthly.datasets.map(dataset => ({
                            ...dataset,
                            borderColor: chartColors.primary,
                            backgroundColor: chartColors.blue[50],
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: chartColors.primary,
                            pointBorderColor: 'white',
                            pointBorderWidth: 2,
                            pointRadius: 4
                          }))
                        }} 
                        options={chartOptions}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-900">Bombonas por Ano</CardTitle>
                    <CardDescription className="text-gray-600">
                      Distribuição de bombonas cadastradas por ano
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-80">
                      <Bar 
                        data={{
                          ...analyticsData.yearly,
                          datasets: analyticsData.yearly.datasets.map(dataset => ({
                            ...dataset,
                            backgroundColor: chartColors.green[400],
                            borderColor: chartColors.green[600],
                            borderWidth: 1,
                            borderRadius: 6,
                            hoverBackgroundColor: chartColors.green[500]
                          }))
                        }} 
                        options={chartOptions}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos de Operações */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Droplet className="w-5 h-5 text-blue-600" />
                      Lavagens Realizadas
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Histórico mensal de lavagens realizadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-80">
                      <Line 
                        data={{
                          ...analyticsData.lavagensData,
                          datasets: analyticsData.lavagensData.datasets.map(dataset => ({
                            ...dataset,
                            borderColor: chartColors.blue[500],
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: chartColors.blue[500],
                            pointBorderColor: 'white',
                            pointBorderWidth: 2,
                            pointRadius: 4
                          }))
                        }} 
                        options={chartOptions}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Truck className="w-5 h-5 text-emerald-600" />
                      Despachos Realizados
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Histórico mensal de despachos realizados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-80">
                      <Line 
                        data={{
                          ...analyticsData.despachosData,
                          datasets: analyticsData.despachosData.datasets.map(dataset => ({
                            ...dataset,
                            borderColor: chartColors.green[500],
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: chartColors.green[500],
                            pointBorderColor: 'white',
                            pointBorderWidth: 2,
                            pointRadius: 4
                          }))
                        }} 
                        options={chartOptions}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="py-12">
                <div className="text-center text-gray-600">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Erro ao carregar dados. Tente atualizar a página.</p>
                  <Button 
                    onClick={loadAnalyticsData} 
                    variant="outline" 
                    className="mt-4 border-gray-300"
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