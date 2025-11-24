import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scan, MapPin, Package, BarChart3, Leaf, CheckCircle2, ArrowLeft } from 'lucide-react';

interface DemoAsset {
  id: string;
  name: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  status: string;
  lastWash: string;
  cycles: number;
  capacity: string;
  material: string;
  color: string;
  history: Array<{
    date: string;
    action: string;
    location: string;
  }>;
}

interface ScanError {
  error: string;
}

type ScanResult = DemoAsset | ScanError | null;

const Demo = () => {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState('');
  const [scannedData, setScannedData] = useState<ScanResult>(null);

  const demoAsset: DemoAsset = {
    id: 'BOM-DEMO-001',
    name: 'Bombona PEAD 200L Demo',
    type: 'Quimica',
    location: 'Centro de Demonstracao - SP',
    latitude: -23.5505,
    longitude: -46.6333,
    status: 'available',
    lastWash: 'Ha 2 horas',
    cycles: 42,
    capacity: '200L',
    material: 'PEAD',
    color: 'Azul',
    history: [
      { date: '2024-01-15', action: 'Lavagem Completa', location: 'Centro de Lavagem SP' },
      { date: '2024-01-10', action: 'Transporte', location: 'Em Rota SP-RJ' },
      { date: '2024-01-05', action: 'Utilizacao', location: 'Cliente XYZ - RJ' },
    ]
  };

  const handleScan = () => {
    if (qrCode.toLowerCase().includes('demo') || qrCode === 'BOM-DEMO-001') {
      setScannedData(demoAsset);
    } else {
      setScannedData({ error: 'QR Code nao encontrado. Tente: BOM-DEMO-001' });
    }
  };

  const isDemoAsset = (data: ScanResult): data is DemoAsset => {
    return data !== null && !('error' in data);
  };

  const isScanError = (data: ScanResult): data is ScanError => {
    return data !== null && 'error' in data;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Demonstracao Interativa</h1>
          <p className="text-muted-foreground">Explore as funcionalidades do sistema de rastreamento</p>
        </div>

        <Tabs defaultValue="scanner" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scanner">
              <Scan className="w-4 h-4 mr-2" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="tracking">
              <MapPin className="w-4 h-4 mr-2" />
              Rastreamento
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="sustainability">
              <Leaf className="w-4 h-4 mr-2" />
              Sustentabilidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner">
            <Card>
              <CardHeader>
                <CardTitle>Scanner de QR Code Demo</CardTitle>
                <CardDescription>Simule a leitura de um QR Code para rastrear bombonas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite: BOM-DEMO-001"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                  />
                  <Button onClick={handleScan}>
                    <Scan className="w-4 h-4 mr-2" />
                    Escanear
                  </Button>
                </div>

                {isDemoAsset(scannedData) && (
                  <Card className="border-primary/20 bg-gradient-light">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{scannedData.name}</h3>
                          <p className="text-sm text-muted-foreground">ID: {scannedData.id}</p>
                        </div>
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Disponivel
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Capacidade</p>
                          <p className="font-semibold">{scannedData.capacity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Material</p>
                          <p className="font-semibold">{scannedData.material}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Ciclos</p>
                          <p className="font-semibold">{scannedData.cycles}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Ultima Lavagem</p>
                          <p className="font-semibold">{scannedData.lastWash}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{scannedData.location}</span>
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={() => navigate(`/bombonas/details/${scannedData.id}`)}
                      >
                        Ver Detalhes Completos
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {isScanError(scannedData) && (
                  <Card className="border-destructive/20 bg-destructive/5">
                    <CardContent className="pt-6">
                      <p className="text-destructive">{scannedData.error}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking">
            <Card>
              <CardHeader>
                <CardTitle>Rastreamento em Tempo Real</CardTitle>
                <CardDescription>Visualize a localizacao e status das bombonas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video bg-gradient-light rounded-lg flex items-center justify-center border">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 mx-auto text-primary mb-2" />
                      <p className="text-muted-foreground">Mapa Interativo Demo</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => navigate('/mapa')}
                      >
                        Ir para Mapa Completo
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Package className="w-8 h-8 mx-auto text-success mb-2" />
                        <p className="text-2xl font-bold">127</p>
                        <p className="text-sm text-muted-foreground">Em Transito</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <MapPin className="w-8 h-8 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">43</p>
                        <p className="text-sm text-muted-foreground">Localizacoes Ativas</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-accent mb-2" />
                        <p className="text-2xl font-bold">98.5%</p>
                        <p className="text-sm text-muted-foreground">Taxa de Rastreamento</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics e Insights</CardTitle>
                <CardDescription>Analise detalhada de uso e eficiencia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-eco">
                      <CardContent className="pt-6">
                        <BarChart3 className="w-8 h-8 text-primary-foreground mb-2" />
                        <p className="text-3xl font-bold text-primary-foreground">5,247</p>
                        <p className="text-sm text-primary-foreground/80">Total de Ativos</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-light">
                      <CardContent className="pt-6">
                        <Leaf className="w-8 h-8 text-success mb-2" />
                        <p className="text-3xl font-bold text-foreground">R$ 2.8M</p>
                        <p className="text-sm text-muted-foreground">Economia Acumulada</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate('/relatorios')}
                  >
                    Ver Relatorios Completos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sustainability">
            <Card className="bg-gradient-eco">
              <CardHeader>
                <CardTitle className="text-primary-foreground">Impacto Ambiental</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Contribuicao para um futuro sustentavel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-foreground mb-1">15,847</div>
                    <div className="text-sm text-primary-foreground/80">Embalagens Economizadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-foreground mb-1">-42%</div>
                    <div className="text-sm text-primary-foreground/80">Reducao de CO₂</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-foreground mb-1">328</div>
                    <div className="text-sm text-primary-foreground/80">Arvores Preservadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-foreground mb-1">98.5%</div>
                    <div className="text-sm text-primary-foreground/80">Taxa de Reutilizacao</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Demo;