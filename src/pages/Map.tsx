import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Package, Truck, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import InteractiveMap from '@/components/InteractiveMap';
import { DespachoLocation, Bombona, BombonaStatus } from '@/services/types';
import { despachoService } from '@/services/despachoService';
import { bombonaService } from '@/services/bombonaService';

const Map = () => {
  const [bombonas, setBombonas] = useState<Bombona[]>([]);
  const [despachos, setDespachos] = useState<DespachoLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bombonas' | 'despachos'>('bombonas');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Configurar atualização automática a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Buscar todas as bombonas (não apenas as com localização)
      const bombonasData = await bombonaService.fetchBombonas();
      
      // Buscar despachos ativos
      const despachosData = await despachoService.getDespachosForMap();

      setBombonas(bombonasData);
      setDespachos(despachosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 text-green-800 border-green-200',
      in_use: 'bg-blue-100 text-blue-800 border-blue-200',
      maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      washing: 'bg-purple-100 text-purple-800 border-purple-200',
      lost: 'bg-red-100 text-red-800 border-red-200',
      em_transito: 'bg-orange-100 text-orange-800 border-orange-200',
      entregue: 'bg-green-100 text-green-800 border-green-200',
      pendente: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Disponível',
      in_use: 'Em Uso',
      maintenance: 'Manutenção',
      washing: 'Lavagem',
      lost: 'Extraviada',
      em_transito: 'Em Trânsito',
      entregue: 'Entregue',
      pendente: 'Pendente'
    };
    return labels[status] || status;
  };

  // Bombonas que estão em uso (incluindo as que estão em despachos)
  const bombonasAtivas = bombonas.filter(b => 
    b.status === 'in_use' || b.status === 'available' // Mostrar disponíveis também
  );

  const currentLocations = activeTab === 'bombonas' ? bombonasAtivas : despachos;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mapa de Localização</h1>
            <p className="text-muted-foreground">Visualize a localização das bombonas e despachos em tempo real</p>
          </div>
          
          <Button 
            onClick={fetchData} 
            variant="outline" 
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InteractiveMap 
              bombonas={bombonasAtivas}
              despachos={despachos}
            />
          </div>

          <div className="space-y-4">
            <Card className="shadow-card-eco">
              <CardHeader>
                <CardTitle className="text-lg">Visualização do Mapa</CardTitle>
                <CardDescription>
                  Selecione o que deseja visualizar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === 'bombonas' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('bombonas')}
                    className="flex-1"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Bombonas ({bombonasAtivas.length})
                  </Button>
                  <Button
                    variant={activeTab === 'despachos' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('despachos')}
                    className="flex-1"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Despachos ({despachos.length})
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3 max-h-[520px] overflow-y-auto">
              {loading ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">Carregando...</p>
                  </CardContent>
                </Card>
              ) : currentLocations.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    {activeTab === 'bombonas' ? (
                      <>
                        <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">
                          Nenhuma bombona ativa no momento
                        </p>
                      </>
                    ) : (
                      <>
                        <Truck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">
                          Nenhum despacho em andamento
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                currentLocations.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">
                          {'bombona_nome' in item ? item.bombona_nome : (item as Bombona).name}
                        </h3>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </div>
                      
                      {'destino' in item && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Destino: {(item as DespachoLocation).destino}
                        </p>
                      )}
                      
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {('endereco' in item && item.endereco) 
                            ? item.endereco 
                            : (item as Bombona).location_address || 'Localização não registrada'
                          }
                        </span>
                      </div>
                      
                      {'responsavel' in item && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Responsável: {(item as DespachoLocation).responsavel}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        Última atualização: {new Date().toLocaleTimeString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Map;