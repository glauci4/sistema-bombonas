import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import InteractiveMap from '@/components/InteractiveMap';

interface BombonaLocation {
  id: string;
  name: string;
  status: string;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
}

const Map = () => {
  const [bombonas, setBombonas] = useState<BombonaLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBombonas();
  }, []);

  const fetchBombonas = async () => {
    try {
      const { data, error } = await supabase
        .from('bombonas')
        .select('id, name, status, location_address, location_lat, location_lng')
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null);

      if (error) throw error;
      setBombonas(data || []);
    } catch (error) {
      console.error('Erro ao carregar bombonas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-success text-success-foreground',
      in_use: 'bg-primary text-primary-foreground',
      maintenance: 'bg-destructive text-destructive-foreground',
      washing: 'bg-accent text-accent-foreground'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Disponível',
      in_use: 'Em Uso',
      maintenance: 'Manutenção',
      washing: 'Lavagem'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mapa de Localização</h1>
          <p className="text-muted-foreground">Visualize a localização das bombonas em tempo real</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InteractiveMap locations={bombonas} />
          </div>

          <div className="space-y-4">
            <Card className="shadow-card-eco">
              <CardHeader>
                <CardTitle className="text-lg">Bombonas Rastreadas</CardTitle>
                <CardDescription>
                  {bombonas.length} bombona{bombonas.length !== 1 ? 's' : ''} com localização
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-3 max-h-[520px] overflow-y-auto">
              {loading ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">Carregando...</p>
                  </CardContent>
                </Card>
              ) : bombonas.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">
                      Nenhuma bombona com localização cadastrada
                    </p>
                  </CardContent>
                </Card>
              ) : (
                bombonas.map((bombona) => (
                  <Card key={bombona.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{bombona.name}</h3>
                        <Badge className={getStatusColor(bombona.status)}>
                          {getStatusLabel(bombona.status)}
                        </Badge>
                      </div>
                      {bombona.location_address && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{bombona.location_address}</span>
                        </div>
                      )}
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
