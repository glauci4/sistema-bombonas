import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Camera, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface BombonaInfo {
  id: string;
  name: string;
  qr_code: string;
  capacity: number;
  material: string;
  status: string;
  current_product: string | null;
  location_address: string | null;
  total_cycles: number;
}

const Scanner = () => {
  const [qrCode, setQrCode] = useState('');
  const [bombona, setBombona] = useState<BombonaInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!qrCode.trim()) {
      toast.error('Digite um código QR');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bombonas')
        .select('*')
        .eq('qr_code', qrCode)
        .single();

      if (error || !data) {
        toast.error('Bombona não encontrada');
        setBombona(null);
        return;
      }

      setBombona(data);
      toast.success('Bombona encontrada!');
    } catch (error) {
      toast.error('Erro ao buscar bombona');
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-success text-success-foreground',
      in_use: 'bg-primary text-primary-foreground',
      maintenance: 'bg-destructive text-destructive-foreground',
      washing: 'bg-accent text-accent-foreground'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-eco shadow-eco mb-4">
              <QrCode className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Scanner QR Code</h1>
            <p className="text-muted-foreground">Escaneie ou digite o código QR para rastrear a bombona</p>
          </div>

          <Card className="shadow-card-eco mb-6">
            <CardHeader>
              <CardTitle>Buscar Bombona</CardTitle>
              <CardDescription>Digite o código QR da bombona</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-code">Código QR</Label>
                <div className="flex gap-2">
                  <Input
                    id="qr-code"
                    placeholder="Ex: QR-2024-001"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" disabled>
                <Camera className="w-4 h-4 mr-2" />
                Escanear com Câmera (Em breve)
              </Button>
            </CardContent>
          </Card>

          {bombona && (
            <Card className="shadow-card-eco animate-slide-up">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{bombona.name}</CardTitle>
                    <CardDescription>Código: {bombona.qr_code}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(bombona.status)}>
                    {getStatusLabel(bombona.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Capacidade</p>
                    <p className="text-lg font-semibold">{bombona.capacity}L</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Material</p>
                    <p className="text-lg font-semibold">{bombona.material}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Ciclos</p>
                    <p className="text-lg font-semibold">{bombona.total_cycles || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Produto Atual</p>
                    <p className="text-lg font-semibold">{bombona.current_product || 'Nenhum'}</p>
                  </div>
                </div>

                {bombona.location_address && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Localização</p>
                    <p className="text-sm">{bombona.location_address}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Scanner;
