import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Package, Truck, RefreshCw, AlertCircle } from 'lucide-react';
import InteractiveMap from '@/components/InteractiveMap';
import { DespachoLocation, Bombona } from '@/services/types';
import { despachoService } from '@/services/despachoService';
import { bombonaService } from '@/services/bombonaService';

const Map = () => {
  const [bombonas, setBombonas] = useState<Bombona[]>([]);
  const [despachos, setDespachos] = useState<DespachoLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bombonas' | 'despachos'>('bombonas');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    
    // Configurar atualização automática a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      console.log('🔄 Buscando dados para o mapa...');
      
      // Buscar todas as bombonas
      const bombonasData = await bombonaService.fetchBombonas();
      console.log('📦 Bombonas carregadas:', bombonasData.length);
      
      // Buscar despachos ativos
      const despachosData = await despachoService.getDespachosForMap();
      console.log('🚚 Despachos carregados:', despachosData.length);
      
      // Filtrar despachos que têm localização
      const despachosComLocalizacao = despachosData.filter(d => 
        d.latitude && d.longitude
      );
      
      console.log('📍 Despachos com localização:', despachosComLocalizacao.length);

      setBombonas(bombonasData);
      setDespachos(despachosComLocalizacao);
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Tente novamente.');
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

  // Bombonas que estão em uso ou disponíveis e têm coordenadas
  const bombonasComLocalizacao = bombonas
    .filter(b => (b.status === 'in_use' || b.status === 'available') && b.location_lat && b.location_lng)
    .map(b => ({
      id: b.id,
      name: b.name,
      status: b.status,
      location_address: b.location_address,
      location_lat: b.location_lat!,
      location_lng: b.location_lng!
    }));

  const despachosComLocalizacao = despachos.filter(d => d.latitude && d.longitude);

  const currentLocations = activeTab === 'bombonas' 
    ? bombonas.filter(b => b.location_lat && b.location_lng)
    : despachosComLocalizacao;

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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border shadow-card-eco overflow-hidden h-[500px]">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Carregando mapa...</p>
                </div>
              ) : (
                <InteractiveMap 
                  bombonas={activeTab === 'bombonas' ? bombonasComLocalizacao : []}
                  despachos={activeTab === 'despachos' ? despachosComLocalizacao : []}
                />
              )}
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p><strong>Bombonas no mapa:</strong> {bombonasComLocalizacao.length} de {bombonas.length} bombonas totais</p>
              <p><strong>Despachos no mapa:</strong> {despachosComLocalizacao.length} de {despachos.length} despachos totais</p>
            </div>
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
                    Bombonas ({bombonasComLocalizacao.length})
                  </Button>
                  <Button
                    variant={activeTab === 'despachos' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('despachos')}
                    className="flex-1"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Despachos ({despachosComLocalizacao.length})
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
                        <p className="text-muted-foreground text-sm mb-2">
                          Nenhuma bombona com localização registrada
                        </p>
                        <Button 
                          variant="link" 
                          size="sm"
                          onClick={() => window.location.href = '/bombonas'}
                        >
                          Atualizar localização das bombonas
                        </Button>
                      </>
                    ) : (
                      <>
                        <Truck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm mb-2">
                          Nenhum despacho com localização registrada
                        </p>
                        <Button 
                          variant="link" 
                          size="sm"
                          onClick={() => window.location.href = '/despachos'}
                        >
                          Ver despachos para atualizar localização
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                currentLocations.map((item) => {
                  // Verificar se é uma bombona ou despacho
                  const isBombona = 'name' in item;
                  const bombonaItem = item as Bombona;
                  const despachoItem = item as DespachoLocation;
                  
                  const lat = isBombona ? bombonaItem.location_lat : despachoItem.latitude;
                  const lng = isBombona ? bombonaItem.location_lng : despachoItem.longitude;
                  
                  return (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">
                            {isBombona ? bombonaItem.name : despachoItem.bombona_nome}
                          </h3>
                          <Badge variant="outline" className={getStatusColor(item.status)}>
                            {getStatusLabel(item.status)}
                          </Badge>
                        </div>
                        
                        {!isBombona && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Destino:</strong> {despachoItem.destino}
                          </p>
                        )}
                        
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">
                            {isBombona 
                              ? bombonaItem.location_address || 'Localização não registrada'
                              : despachoItem.endereco || 'Localização não registrada'
                            }
                          </span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1">
                          <div>
                            <strong>Lat:</strong> {lat?.toFixed(6) || 'N/A'}
                          </div>
                          <div>
                            <strong>Lng:</strong> {lng?.toFixed(6) || 'N/A'}
                          </div>
                        </div>
                        
                        {!isBombona && (
                          <p className="text-xs text-muted-foreground mt-2">
                            <strong>Responsável:</strong> {despachoItem.responsavel}
                          </p>
                        )}

                        <p className="text-xs text-muted-foreground mt-2">
                          <strong>Status:</strong> {getStatusLabel(item.status)}
                        </p>

                        <p className="text-xs text-muted-foreground mt-2">
                          <strong>Última atualização:</strong> {new Date().toLocaleTimeString()}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Map;