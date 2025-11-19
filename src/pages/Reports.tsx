import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Package, Recycle, FileText, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { relatoriosService } from '@/services/relatoriosService';

interface ReportStats {
  totalBombonas: number;
  available: number;
  inUse: number;
  maintenance: number;
  washing: number;
  totalCycles: number;
}

const Reports = () => {
  const [stats, setStats] = useState<ReportStats>({
    totalBombonas: 0,
    available: 0,
    inUse: 0,
    maintenance: 0,
    washing: 0,
    totalCycles: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: bombonas, error } = await supabase
        .from('bombonas')
        .select('status, total_cycles');

      if (error) throw error;

      const newStats: ReportStats = {
        totalBombonas: bombonas?.length || 0,
        available: bombonas?.filter(b => b.status === 'available').length || 0,
        inUse: bombonas?.filter(b => b.status === 'in_use').length || 0,
        maintenance: bombonas?.filter(b => b.status === 'maintenance').length || 0,
        washing: bombonas?.filter(b => b.status === 'washing').length || 0,
        totalCycles: bombonas?.reduce((sum, b) => sum + (b.total_cycles || 0), 0) || 0
      };

      setStats(newStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleGerarRelatorio = async (tipo: string) => {
    setLoadingReport(tipo);
    try {
      let nomeArquivo = '';
      
      switch (tipo) {
        case 'mensal':
          nomeArquivo = await relatoriosService.gerarRelatorioMensal(mes, ano);
          break;
        case 'anual':
          nomeArquivo = await relatoriosService.gerarRelatorioAnual(ano);
          break;
      }
      
      toast.success(`Relatório ${tipo} gerado com sucesso!`);
      console.log('Arquivo:', nomeArquivo);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error(`Erro ao gerar relatório ${tipo}`);
    } finally {
      setLoadingReport(null);
    }
  };

  const utilizationRate = stats.totalBombonas > 0 
    ? ((stats.inUse / stats.totalBombonas) * 100).toFixed(1)
    : '0.0';

  const availabilityRate = stats.totalBombonas > 0
    ? ((stats.available / stats.totalBombonas) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Relatórios e Analytics</h1>
          <p className="text-muted-foreground">Acompanhe métricas e indicadores do sistema</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando relatórios...</p>
          </div>
        ) : (
          <>
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Bombonas</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBombonas}</div>
                  <p className="text-xs text-muted-foreground">Ativos cadastrados</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Utilização</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{utilizationRate}%</div>
                  <p className="text-xs text-muted-foreground">{stats.inUse} em uso</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disponibilidade</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{availabilityRate}%</div>
                  <p className="text-xs text-muted-foreground">{stats.available} disponíveis</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Ciclos</CardTitle>
                  <Recycle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCycles}</div>
                  <p className="text-xs text-muted-foreground">Reutilizações</p>
                </CardContent>
              </Card>
            </div>

            {/* Seção com Distribuição por Status e Exportar Relatórios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Distribuição por Status */}
              <Card className="shadow-sm border">
                <CardHeader>
                  <CardTitle>Distribuição por Status</CardTitle>
                  <CardDescription>Situação atual das bombonas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Disponível</span>
                      <span className="font-semibold">{stats.available}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.totalBombonas > 0 ? (stats.available / stats.totalBombonas) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Em Uso</span>
                      <span className="font-semibold">{stats.inUse}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.totalBombonas > 0 ? (stats.inUse / stats.totalBombonas) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Manutenção</span>
                      <span className="font-semibold">{stats.maintenance}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.totalBombonas > 0 ? (stats.maintenance / stats.totalBombonas) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Lavagem</span>
                      <span className="font-semibold">{stats.washing}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.totalBombonas > 0 ? (stats.washing / stats.totalBombonas) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exportar Relatórios */}
              <Card className="shadow-sm border">
                <CardHeader>
                  <CardTitle>Exportar Relatórios</CardTitle>
                  <CardDescription>Gere relatórios detalhados do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Seletor de Período */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Mês</label>
                      <select 
                        value={mes} 
                        onChange={(e) => setMes(parseInt(e.target.value))}
                        className="w-full p-2 border rounded text-sm"
                        disabled={loadingReport !== null}
                      >
                        {Array.from({length: 12}, (_, i) => (
                          <option key={i+1} value={i+1}>
                            {relatoriosService.getNomeMes(i+1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Ano</label>
                      <input 
                        type="number" 
                        value={ano}
                        onChange={(e) => setAno(parseInt(e.target.value))}
                        className="w-full p-2 border rounded text-sm"
                        min="2020"
                        max={new Date().getFullYear()}
                        disabled={loadingReport !== null}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto p-4"
                      onClick={() => handleGerarRelatorio('mensal')}
                      disabled={loadingReport !== null}
                    >
                      <FileText className="w-5 h-5 text-muted-foreground mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Relatório Mensal</div>
                        <div className="text-xs text-muted-foreground">
                          Estatísticas do mês selecionado
                        </div>
                      </div>
                      {loadingReport === 'mensal' && (
                        <div className="ml-auto">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto p-4"
                      onClick={() => handleGerarRelatorio('anual')}
                      disabled={loadingReport !== null}
                    >
                      <Calendar className="w-5 h-5 text-muted-foreground mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Relatório Anual</div>
                        <div className="text-xs text-muted-foreground">
                          Consolidado do ano selecionado
                        </div>
                      </div>
                      {loadingReport === 'anual' && (
                        <div className="ml-auto">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;