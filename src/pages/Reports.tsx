import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Package, Recycle, FileText, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
    } finally {
      setLoading(false);
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
            <p className="text-muted-foreground">Carregando relatórios...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-card-eco">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Bombonas</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBombonas}</div>
                  <p className="text-xs text-muted-foreground">Ativos cadastrados</p>
                </CardContent>
              </Card>

              <Card className="shadow-card-eco">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Utilização</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{utilizationRate}%</div>
                  <p className="text-xs text-muted-foreground">{stats.inUse} em uso</p>
                </CardContent>
              </Card>

              <Card className="shadow-card-eco">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disponibilidade</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{availabilityRate}%</div>
                  <p className="text-xs text-muted-foreground">{stats.available} disponíveis</p>
                </CardContent>
              </Card>

              <Card className="shadow-card-eco">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="shadow-card-eco">
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
                        className="bg-success h-2 rounded-full transition-all"
                        style={{ width: `${(stats.available / stats.totalBombonas) * 100}%` }}
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
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(stats.inUse / stats.totalBombonas) * 100}%` }}
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
                        className="bg-destructive h-2 rounded-full transition-all"
                        style={{ width: `${(stats.maintenance / stats.totalBombonas) * 100}%` }}
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
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ width: `${(stats.washing / stats.totalBombonas) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card-eco">
                <CardHeader>
                  <CardTitle>Exportar Relatórios</CardTitle>
                  <CardDescription>Gere relatórios detalhados do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold">Relatório Mensal</p>
                      <p className="text-xs text-muted-foreground">Estatísticas do último mês</p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold">Relatório Anual</p>
                      <p className="text-xs text-muted-foreground">Consolidado do ano</p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold">Analytics Completo</p>
                      <p className="text-xs text-muted-foreground">Todos os dados históricos</p>
                    </div>
                  </button>
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
